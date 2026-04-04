import argparse
import io
import os
import pickle
import re
import tempfile
from typing import List, Tuple

import cloudinary
import cloudinary.uploader
import numpy as np
import psycopg2
import requests


def parse_args():
    parser = argparse.ArgumentParser(
        description="Migrate section face model URLs from legacy .pkl to .npz"
    )
    parser.add_argument(
        "--database-url",
        default=os.getenv("DATABASE_URL"),
        help="PostgreSQL connection string (defaults to DATABASE_URL env)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print planned changes without writing DB updates",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=0,
        help="Process at most N sections (0 means all)",
    )
    return parser.parse_args()


def configure_cloudinary():
    cloudinary.config(
        cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
        api_key=os.getenv("CLOUDINARY_API_KEY"),
        api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    )


def parse_model_version(model_url: str) -> int:
    if not model_url:
        return 0
    match = re.search(r"_v(\d+)\.npz", model_url)
    if not match:
        return 0
    return int(match.group(1))


def download_bytes(url: str) -> bytes:
    response = requests.get(url, timeout=60)
    response.raise_for_status()
    return response.content


def convert_legacy_pickle_to_arrays(model_obj) -> Tuple[List[str], np.ndarray, int]:
    if not isinstance(model_obj, dict):
        return [], np.empty((0, 512), dtype=np.float32), 0

    enrollments: List[str] = []
    embeddings: List[np.ndarray] = []
    dropped = 0

    for enrollment, records in model_obj.items():
        if isinstance(records, dict):
            records = [records]

        if not isinstance(records, list):
            continue

        for record in records:
            candidate = None
            if isinstance(record, dict):
                candidate = record.get("embedding") or record.get("encoding")
            else:
                candidate = record

            if candidate is None:
                continue

            try:
                vector = np.array(candidate, dtype=np.float32).reshape(-1)
            except Exception:
                dropped += 1
                continue

            if vector.size != 512:
                dropped += 1
                continue

            enrollments.append(str(enrollment))
            embeddings.append(vector)

    if not embeddings:
        return [], np.empty((0, 512), dtype=np.float32), dropped

    return enrollments, np.stack(embeddings).astype(np.float32), dropped


def upload_npz_model(section_id: int, model_version: int, enrollments, embeddings) -> str:
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


def has_model_version_column(cursor) -> bool:
    cursor.execute(
        """
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'sections'
          AND column_name = 'model_version'
        LIMIT 1
        """
    )
    return cursor.fetchone() is not None


def fetch_target_sections(cursor, limit: int):
    query = """
        SELECT section_id, face_recognition_model
        FROM sections
        WHERE face_recognition_model IS NOT NULL
          AND face_recognition_model ILIKE '%\\.pkl%'
        ORDER BY section_id ASC
    """
    if limit > 0:
        query += " LIMIT %s"
        cursor.execute(query, (limit,))
    else:
        cursor.execute(query)
    return cursor.fetchall()


def migrate_section(cursor, section_id: int, model_url: str, has_model_version: bool, dry_run: bool):
    model_bytes = download_bytes(model_url)
    legacy_model = pickle.loads(model_bytes)
    enrollments, embeddings, dropped = convert_legacy_pickle_to_arrays(legacy_model)

    if embeddings.shape[0] == 0:
        if dry_run:
            print(
                f"[DRY-RUN] section {section_id}: only non-512 legacy vectors found; would set model URL to NULL"
            )
            return "would_null", dropped

        cursor.execute(
            """
            UPDATE sections
            SET face_recognition_model = NULL
            WHERE section_id = %s
            """,
            (section_id,),
        )
        print(
            f"section {section_id}: set model URL to NULL (no compatible 512-D vectors; dropped={dropped})"
        )
        return "nulled", dropped

    next_version = parse_model_version(model_url) + 1
    if next_version <= 0:
        next_version = 1

    if dry_run:
        print(
            f"[DRY-RUN] section {section_id}: would upload .npz with {embeddings.shape[0]} vectors, dropped={dropped}, version={next_version}"
        )
        return "would_migrate", dropped

    new_model_url = upload_npz_model(section_id, next_version, enrollments, embeddings)

    if has_model_version:
        cursor.execute(
            """
            UPDATE sections
            SET face_recognition_model = %s,
                model_version = %s
            WHERE section_id = %s
            """,
            (new_model_url, next_version, section_id),
        )
    else:
        cursor.execute(
            """
            UPDATE sections
            SET face_recognition_model = %s
            WHERE section_id = %s
            """,
            (new_model_url, section_id),
        )

    print(
        f"section {section_id}: migrated to {new_model_url} (vectors={embeddings.shape[0]}, dropped={dropped}, version={next_version})"
    )
    return "migrated", dropped


def main():
    args = parse_args()

    if not args.database_url:
        raise ValueError("DATABASE_URL is required (pass --database-url or set env)")

    configure_cloudinary()

    connection = psycopg2.connect(args.database_url)
    connection.autocommit = False

    migrated = 0
    nulled = 0
    dropped_total = 0
    failed = 0

    try:
        with connection.cursor() as cursor:
            model_version_exists = has_model_version_column(cursor)
            rows = fetch_target_sections(cursor, args.limit)
            print(f"Found {len(rows)} sections with legacy .pkl model URLs")

            for section_id, model_url in rows:
                try:
                    status, dropped = migrate_section(
                        cursor,
                        section_id=section_id,
                        model_url=model_url,
                        has_model_version=model_version_exists,
                        dry_run=args.dry_run,
                    )
                    dropped_total += dropped
                    if status in ("migrated", "would_migrate"):
                        migrated += 1
                    if status in ("nulled", "would_null"):
                        nulled += 1

                    if not args.dry_run:
                        connection.commit()
                except Exception as error:
                    failed += 1
                    connection.rollback()
                    print(f"section {section_id}: failed -> {error}")

        print("Migration summary")
        print(f"migrated_sections={migrated}")
        print(f"nulled_sections={nulled}")
        print(f"failed_sections={failed}")
        print(f"dropped_incompatible_vectors={dropped_total}")
    finally:
        connection.close()


if __name__ == "__main__":
    main()
