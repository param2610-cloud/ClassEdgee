import io
import json
import os
import re
import tempfile
import time
import traceback

import cloudinary
import cloudinary.uploader
import cv2
import numpy as np
import pika
import requests
from insightface.app import FaceAnalysis

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://localhost:5672")
FACE_REGISTER_QUEUE = os.getenv("FACE_REGISTER_QUEUE", "face.register")
FACE_RECOGNIZE_QUEUE = os.getenv("FACE_RECOGNIZE_QUEUE", "face.recognize")
FACE_RESULTS_QUEUE = os.getenv("FACE_RESULTS_QUEUE", "face.results")

INSIGHTFACE_MODEL_NAME = os.getenv("INSIGHTFACE_MODEL_NAME", "buffalo_s")
INSIGHTFACE_MODEL_ROOT = os.getenv("INSIGHTFACE_MODEL_ROOT", "./insightface_models")

_face_app = None


def configure_cloudinary():
    cloudinary.config(
        cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
        api_key=os.getenv("CLOUDINARY_API_KEY"),
        api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    )


def get_face_app():
    global _face_app
    if _face_app is None:
        _face_app = FaceAnalysis(
            name=INSIGHTFACE_MODEL_NAME,
            root=INSIGHTFACE_MODEL_ROOT,
            providers=["CPUExecutionProvider"],
        )
        _face_app.prepare(ctx_id=-1, det_size=(320, 320))
    return _face_app


def build_failure_result(payload, message):
    return {
        "job_id": payload.get("job_id"),
        "job_type": payload.get("job_type"),
        "status": "failed",
        "error": message,
        "timestamp": int(time.time()),
    }


def build_success_result(payload, extra):
    base = {
        "job_id": payload.get("job_id"),
        "job_type": payload.get("job_type"),
        "status": "success",
        "timestamp": int(time.time()),
    }
    base.update(extra)
    return base


def parse_model_version(model_url):
    if not model_url:
        return 0
    match = re.search(r"_v(\d+)\.npz", model_url)
    if not match:
        return 0
    return int(match.group(1))


def download_bytes(url):
    response = requests.get(url, timeout=60)
    response.raise_for_status()
    return response.content


def decode_image(image_bytes):
    arr = np.frombuffer(image_bytes, dtype=np.uint8)
    return cv2.imdecode(arr, cv2.IMREAD_COLOR)


def normalize_rows(matrix):
    norms = np.linalg.norm(matrix, axis=1, keepdims=True)
    norms[norms == 0] = 1.0
    return matrix / norms


def match_enrollment(query_embedding, known_enrollments, known_embeddings, threshold):
    if known_embeddings.shape[0] == 0:
        return None

    query = query_embedding.astype(np.float32).reshape(1, -1)
    query_norm = normalize_rows(query)
    known_norm = normalize_rows(known_embeddings)

    similarities = (known_norm @ query_norm.T).reshape(-1)
    best_idx = int(np.argmax(similarities))
    best_sim = float(similarities[best_idx])

    if best_sim < threshold:
        return None

    return known_enrollments[best_idx], best_sim


def extract_primary_embedding(image):
    app = get_face_app()
    faces = app.get(image)
    if not faces:
        return None
    best_face = max(faces, key=lambda f: float(f.det_score))
    return best_face.embedding.astype(np.float32)


def load_npz_model_from_url(model_url):
    if not model_url:
        return [], np.empty((0, 512), dtype=np.float32)

    model_bytes = download_bytes(model_url)
    with np.load(io.BytesIO(model_bytes), allow_pickle=False) as data:
        enrollments = data["enrollments"].astype(str).tolist()
        embeddings = data["embeddings"].astype(np.float32)
        if embeddings.ndim == 1:
            embeddings = embeddings.reshape(1, -1)

    if len(enrollments) != len(embeddings):
        raise ValueError("Model file is corrupted: enrollments and embeddings length mismatch")

    return enrollments, embeddings


def upload_npz_model(section_id, model_version, enrollments, embeddings):
    if not os.getenv("CLOUDINARY_CLOUD_NAME"):
        raise ValueError("Cloudinary configuration is missing")

    with tempfile.NamedTemporaryFile(suffix=".npz", delete=False) as tmp_file:
        temp_path = tmp_file.name

    try:
        np.savez_compressed(
            temp_path,
            enrollments=np.array(enrollments),
            embeddings=np.array(embeddings, dtype=np.float32),
        )

        public_id = f"section_{section_id}_model_v{model_version}"
        upload_response = cloudinary.uploader.upload(
            temp_path,
            resource_type="raw",
            folder="face-models",
            public_id=public_id,
            overwrite=True,
            invalidate=True,
        )
        return upload_response["secure_url"]
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


def process_frame_for_matches(
    frame,
    frame_index,
    known_enrollments,
    known_embeddings,
    confidence_threshold,
    matches_map,
):
    app = get_face_app()
    faces = app.get(frame)
    unmatched_faces = 0

    for face in faces:
        match = match_enrollment(
            face.embedding.astype(np.float32),
            known_enrollments,
            known_embeddings,
            confidence_threshold,
        )

        if match is None:
            unmatched_faces += 1
            continue

        enrollment, confidence = match
        entry = matches_map.setdefault(
            enrollment,
            {
                "enrollment": enrollment,
                "best_confidence": 0.0,
                "seen_in_frames": set(),
            },
        )
        if confidence > entry["best_confidence"]:
            entry["best_confidence"] = confidence
        entry["seen_in_frames"].add(frame_index)

    return unmatched_faces, len(faces)


def process_video_bytes(
    media_bytes,
    known_enrollments,
    known_embeddings,
    confidence_threshold,
    matches_map,
    frame_index_start,
    skip_frames,
):
    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as temp_file:
        temp_file.write(media_bytes)
        temp_path = temp_file.name

    try:
        cap = cv2.VideoCapture(temp_path)
        if not cap.isOpened():
            return 0, 0, frame_index_start

        unmatched_faces = 0
        processed_frames = 0
        raw_frame_index = 0
        frame_cursor = frame_index_start

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            if raw_frame_index % skip_frames != 0:
                raw_frame_index += 1
                continue

            unmatched, _ = process_frame_for_matches(
                frame,
                frame_cursor,
                known_enrollments,
                known_embeddings,
                confidence_threshold,
                matches_map,
            )
            unmatched_faces += unmatched
            processed_frames += 1
            frame_cursor += 1
            raw_frame_index += 1

        cap.release()
        return unmatched_faces, processed_frames, frame_cursor
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


def handle_register_job(payload):
    section_id = payload.get("section_id")
    enrollment = payload.get("enrollment")
    image_urls = payload.get("image_urls") or []

    if not section_id or not enrollment:
        return build_failure_result(payload, "section_id and enrollment are required")

    if not isinstance(image_urls, list) or len(image_urls) == 0:
        return build_failure_result(payload, "image_urls must be a non-empty array")

    try:
        current_model_url = payload.get("current_model_url")
        existing_enrollments, existing_embeddings = load_npz_model_from_url(current_model_url)

        new_embeddings = []
        successful_images = 0

        for image_url in image_urls:
            try:
                image_bytes = download_bytes(image_url)
                image = decode_image(image_bytes)
                if image is None:
                    continue

                embedding = extract_primary_embedding(image)
                if embedding is None:
                    continue

                new_embeddings.append(embedding)
                successful_images += 1
            except Exception:
                continue

        if len(new_embeddings) == 0:
            return build_failure_result(payload, "No faces detected in registration images")

        new_embeddings_arr = np.array(new_embeddings, dtype=np.float32)
        merged_embeddings = (
            new_embeddings_arr
            if existing_embeddings.shape[0] == 0
            else np.vstack([existing_embeddings, new_embeddings_arr])
        )
        merged_enrollments = existing_enrollments + ([str(enrollment)] * len(new_embeddings))

        next_version = parse_model_version(current_model_url) + 1
        model_url = upload_npz_model(section_id, next_version, merged_enrollments, merged_embeddings)

        return build_success_result(
            payload,
            {
                "section_id": int(section_id),
                "model_url": model_url,
                "model_version": next_version,
                "faces_detected": len(new_embeddings),
                "embeddings_count": int(merged_embeddings.shape[0]),
                "successful_images": successful_images,
            },
        )
    except Exception as error:
        return build_failure_result(payload, f"Registration pipeline failed: {str(error)}")


def handle_recognize_job(payload):
    model_url = payload.get("model_url")
    capture_urls = payload.get("capture_urls") or []
    class_id = payload.get("class_id")
    section_id = payload.get("section_id")
    confidence_threshold = float(payload.get("confidence_threshold", 0.6))
    video_skip_frames = int(payload.get("video_skip_frames", 30))

    if not model_url:
        return build_failure_result(payload, "model_url is required")
    if not class_id or not section_id:
        return build_failure_result(payload, "class_id and section_id are required")
    if not isinstance(capture_urls, list) or len(capture_urls) == 0:
        return build_failure_result(payload, "capture_urls must be a non-empty array")

    try:
        known_enrollments, known_embeddings = load_npz_model_from_url(model_url)
        if known_embeddings.shape[0] == 0:
            return build_failure_result(payload, "Model has no embeddings")

        matches_map = {}
        unmatched_faces = 0
        processed_captures = 0
        processed_frames = 0
        frame_cursor = 0

        for capture_url in capture_urls:
            try:
                media_bytes = download_bytes(capture_url)
                image = decode_image(media_bytes)

                if image is not None:
                    unmatched, _ = process_frame_for_matches(
                        image,
                        frame_cursor,
                        known_enrollments,
                        known_embeddings,
                        confidence_threshold,
                        matches_map,
                    )
                    unmatched_faces += unmatched
                    processed_frames += 1
                    frame_cursor += 1
                    processed_captures += 1
                    continue

                unmatched, frames_done, frame_cursor = process_video_bytes(
                    media_bytes,
                    known_enrollments,
                    known_embeddings,
                    confidence_threshold,
                    matches_map,
                    frame_cursor,
                    max(1, video_skip_frames),
                )
                unmatched_faces += unmatched
                processed_frames += frames_done
                processed_captures += 1
            except Exception:
                continue

        matches = []
        for value in matches_map.values():
            matches.append(
                {
                    "enrollment": value["enrollment"],
                    "best_confidence": float(value["best_confidence"]),
                    "seen_in_frames": sorted(list(value["seen_in_frames"])),
                }
            )

        return build_success_result(
            payload,
            {
                "class_id": int(class_id),
                "section_id": int(section_id),
                "attendance_date": payload.get("attendance_date"),
                "matches": matches,
                "unmatched_faces": int(unmatched_faces),
                "processed_captures": int(processed_captures),
                "processed_frames": int(processed_frames),
                "confidence_threshold": confidence_threshold,
            },
        )
    except Exception as error:
        return build_failure_result(payload, f"Recognition pipeline failed: {str(error)}")


def publish_result(channel, result_payload):
    channel.basic_publish(
        exchange="",
        routing_key=FACE_RESULTS_QUEUE,
        body=json.dumps(result_payload).encode("utf-8"),
        properties=pika.BasicProperties(
            content_type="application/json",
            delivery_mode=2,
        ),
    )


def process_message(channel, method, properties, body):
    payload = {}
    try:
        payload = json.loads(body.decode("utf-8"))
        job_type = payload.get("job_type")

        if job_type == "register":
            result = handle_register_job(payload)
        elif job_type == "recognize":
            result = handle_recognize_job(payload)
        else:
            result = build_failure_result(payload, f"unknown job type: {job_type}")
    except Exception as error:
        traceback.print_exc()
        result = build_failure_result(payload, f"worker crashed: {str(error)}")

    try:
        publish_result(channel, result)
        channel.basic_ack(delivery_tag=method.delivery_tag)
    except Exception:
        traceback.print_exc()
        channel.basic_nack(delivery_tag=method.delivery_tag, requeue=False)


def main():
    configure_cloudinary()

    params = pika.URLParameters(RABBITMQ_URL)
    connection = pika.BlockingConnection(params)
    channel = connection.channel()

    channel.queue_declare(queue=FACE_REGISTER_QUEUE, durable=True)
    channel.queue_declare(queue=FACE_RECOGNIZE_QUEUE, durable=True)
    channel.queue_declare(queue=FACE_RESULTS_QUEUE, durable=True)
    channel.basic_qos(prefetch_count=1)

    channel.basic_consume(
        queue=FACE_REGISTER_QUEUE,
        on_message_callback=lambda ch, method, props, msg_body: process_message(
            ch, method, props, msg_body
        ),
    )
    channel.basic_consume(
        queue=FACE_RECOGNIZE_QUEUE,
        on_message_callback=lambda ch, method, props, msg_body: process_message(
            ch, method, props, msg_body
        ),
    )

    print("ML worker started. Waiting for face jobs...")
    channel.start_consuming()


if __name__ == "__main__":
    main()
