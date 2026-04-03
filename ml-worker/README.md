# ML Worker (Queue Consumer)

This service executes face ML jobs for the new attendance architecture.

Current behavior:
- Consumes jobs from `face.register` and `face.recognize`.
- Uses InsightFace (`buffalo_s`) for embedding extraction and matching.
- Stores section models as `.npz` artifacts in Cloudinary (`face-models/`).
- Publishes success/failure payloads to `face.results`.

Register job contract (`job_type=register`):
- Input: `section_id`, `enrollment`, `image_urls[]`, `current_model_url`.
- Output: `model_url`, `model_version`, `faces_detected`, `embeddings_count`.

Recognize job contract (`job_type=recognize`):
- Input: `class_id`, `section_id`, `model_url`, `capture_urls[]`, `confidence_threshold`.
- Output: `matches[]` (enrollment, best_confidence, seen_in_frames), `unmatched_faces`.

Environment variables:
- `RABBITMQ_URL` (default: `amqp://localhost:5672`)
- `FACE_REGISTER_QUEUE` (default: `face.register`)
- `FACE_RECOGNIZE_QUEUE` (default: `face.recognize`)
- `FACE_RESULTS_QUEUE` (default: `face.results`)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `INSIGHTFACE_MODEL_NAME` (default: `buffalo_s`)
- `INSIGHTFACE_MODEL_ROOT` (default: `./insightface_models`)
