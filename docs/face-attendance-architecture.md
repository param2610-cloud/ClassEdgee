# Face Attendance System — End-to-End Architecture Plan

## Status: Draft
## Date: 2026-04-04

---

## 1. Current State (Problems)

| # | Issue | Severity |
|---|-------|----------|
| 1 | **Split-brain DB writes** — Python FastAPI writes `attendance` directly to PostgreSQL, Node also writes to same table | Critical |
| 2 | **No auth on FastAPI** — any client that knows the host can register faces or mark attendance | Critical |
| 3 | **Pickle model format** — `pickle.loads()` executes arbitrary code if model file is tampered | High |
| 4 | **Frontend calls two backends** — React talks to both Node (`VITE_LOCAL_IP`) and FastAPI (`VITE_FASTAPI_HOST`) directly | Medium |
| 5 | **No job queue** — concurrent video/image processing blocks; no retry on timeout | Medium |
| 6 | **Model re-downloaded every request** — no local caching of section models | Medium |
| 7 | **Hardcoded IP camera** in `start-attendance` endpoint | Low |
| 8 | **Temp files accumulate** on crashes — no context-manager cleanup | Low |

---

## 2. Target Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       REACT FRONTEND                             │
│                                                                   │
│  - Faculty captures photos at 5-min intervals during class       │
│  - Uploads images to Cloudinary (presigned or unsigned preset)   │
│  - After class → triggers "process attendance" via Node          │
│  - Polls job status OR receives WebSocket push for results       │
│  - ONE backend only: Node. No VITE_FASTAPI_HOST.                 │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS (all requests)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                  NODE.js GATEWAY / ORCHESTRATOR                   │
│                                                                   │
│  OWNS:                                                            │
│  ├── All authentication (JWT validation on every request)        │
│  ├── All PostgreSQL writes (sole writer to attendance table)     │
│  ├── Business rules ("seen in ≥2 frames = present")             │
│  ├── Job lifecycle (publish → RabbitMQ, track status, return)    │
│  └── Cloudinary URL coordination                                 │
│                                                                   │
│  NEW ENDPOINTS:                                                   │
│  POST /api/v1/face/register            publish register job      │
│  POST /api/v1/face/process-class       publish recognize job     │
│  GET  /api/v1/face/job/:jobId          poll job status           │
│  WS   /ws/attendance/:classId          real-time results push    │
│                                                                   │
│  DOES NOT: run ML code, touch npz files, or expose Python        │
└──────────┬─────────────────────────────┬────────────────────────┘
           │ AMQP (publish job)          │ SQL (sole writer)
           ▼                             ▼
┌──────────────────────┐    ┌──────────────────────────┐
│      RabbitMQ        │    │       PostgreSQL          │
│                      │    │                            │
│  Queues:             │    │  Existing tables:          │
│  ├── face.register   │    │  ├── attendance            │
│  ├── face.recognize  │    │  ├── students              │
│  └── face.results    │    │  ├── sections              │
│                      │    │  └── classes               │
│  Config:             │    │                            │
│  ├── prefetch = 1    │    │  NEW column:               │
│  ├── durable = true  │    │  sections.model_version    │
│  └── DLX for fails   │    │    (int, default 0)        │
└──────────┬───────────┘    └──────────────────────────┘
           │ AMQP (consume 1 job at a time)
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   ML WORKER SERVICE (Python)                      │
│                                                                   │
│  STATELESS. No DB access. No auth logic. Pure ML compute.        │
│                                                                   │
│  Consumes: face.register, face.recognize                         │
│  Publishes: face.results                                         │
│                                                                   │
│  Stack:                                                           │
│  ├── InsightFace buffalo_s (512-D embeddings, cosine similarity) │
│  ├── MiniFASNet anti-spoofing (liveness on registration)         │
│  ├── numpy .npz model format (NOT pickle)                        │
│  └── pika (RabbitMQ client)                                      │
│                                                                   │
│  Scaling: docker-compose scale worker=N                          │
│  Each worker: prefetch=1, one job at a time, reply, pick next    │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS (read/write models + images)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CLOUDINARY (free tier)                         │
│                                                                   │
│  Folders:                                                         │
│  ├── face-models/                                                │
│  │   └── section_{id}_model_v{N}.npz                             │
│  ├── class-captures/                                             │
│  │   └── class_{id}/capture_t{minutes}.jpg                       │
│  ├── registration-images/                                        │
│  │   └── student_{enrollment}/face_{idx}.jpg                     │
│  └── profile-pictures/  (existing, unchanged)                    │
│                                                                   │
│  Free tier: 25GB storage, 25GB bandwidth/month                   │
│  Sufficient for resume project scale                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Model Format — .npz (replaces .pkl)

### Why migrate from pickle

- `pickle.loads()` executes arbitrary code — a tampered `.pkl` file is a remote code execution vector
- No versioning, no safe partial load, no interop with non-Python tools
- `.npz` is a numpy archive: safe to load, smaller, version-friendly

### Format

```python
# Save
np.savez_compressed(path,
    enrollments=np.array(["2021CSE045", "2021CSE012", ...]),   # (N,) string
    embeddings=np.array([[0.12, -0.34, ...], ...]),            # (N, 512) float32
)

# Load — safe, no code execution
data = np.load(path, allow_pickle=False)
enrollments = data["enrollments"]  # (N,)
embeddings  = data["embeddings"]   # (N, 512)
```

One student can have multiple embeddings (different angles). The `enrollments` array repeats for multi-embedding students. Matching: cosine similarity of query against all rows, max per unique enrollment.

### Versioning

- Filename: `section_{id}_model_v{N}.npz`
- `sections.model_version` column (integer) tracks current version
- Rollback: point `model_version` back to `v{N-1}` if registration corrupts model

---

## 4. Flow 1 — Face Registration

```
Faculty uploads student photos via frontend
        |
        v
Node: POST /api/v1/face/register
  |-- Auth check (JWT)
  |-- Validate student exists, get section_id
  |-- Upload images to Cloudinary (registration-images/)
  |-- Publish to RabbitMQ "face.register":
  |   {
  |     job_id: uuid,
  |     job_type: "register",
  |     enrollment: "2021CSE045",
  |     image_urls: ["https://res.cloudinary.com/.../face_0.jpg", ...],
  |     current_model_url: "https://res.cloudinary.com/.../section_5_model_v3.npz",
  |     section_id: 5
  |   }
  '-- Return { job_id } to frontend (HTTP 202 Accepted)
        |
        v (async)
ML Worker picks up job:
  |-- Download images from Cloudinary URLs
  |-- Anti-spoofing check (MiniFASNet) — reject printed photos / screens
  |-- Extract 512-D embeddings via InsightFace
  |-- Download existing model from Cloudinary (if exists)
  |-- Merge: append new embeddings for this enrollment
  |-- Save as section_5_model_v4.npz, upload to Cloudinary
  '-- Publish to "face.results":
      {
        job_id, status: "success",
        model_url: "https://res.cloudinary.com/.../section_5_model_v4.npz",
        model_version: 4,
        embeddings_count: 12,
        faces_detected: 10,
        spoofing_rejected: 2
      }
        |
        v
Node consumes "face.results":
  |-- UPDATE sections SET face_recognition_model = model_url,
  |                       model_version = 4
  |-- Push WebSocket: "Registration complete, 10/12 faces accepted"
  '-- Update job status for polling fallback
```

---

## 5. Flow 2 — Classroom Attendance (batch after class)

### During class (40 minutes, every 5 minutes)

```
Frontend captures photo from webcam
  |-- Upload to Cloudinary: class-captures/class_{id}/capture_t{min}.jpg
  '-- 8 captures total over 40 minutes
```

### After class ends

```
Faculty clicks "Process Attendance"
        |
        v
Node: POST /api/v1/face/process-class
  |-- Auth check
  |-- Lookup section model URL + version from sections table
  |-- Collect all capture URLs for this class from Cloudinary
  |-- Publish to RabbitMQ "face.recognize":
  |   {
  |     job_id: uuid,
  |     job_type: "recognize",
  |     model_url: "https://res.cloudinary.com/.../section_5_model_v4.npz",
  |     capture_urls: [
  |       "https://res.cloudinary.com/.../capture_t0.jpg",
  |       "https://res.cloudinary.com/.../capture_t5.jpg",
  |       ...8 total
  |     ],
  |     confidence_threshold: 0.6
  |   }
  '-- Return { job_id } (HTTP 202)
        |
        v (async)
ML Worker picks up job:
  |-- Download model .npz from Cloudinary
  |-- np.load(path, allow_pickle=False) — safe load
  |-- Download all 8 capture images
  |-- For each image:
  |   |-- Detect all faces (InsightFace)
  |   |-- Extract 512-D embedding per face
  |   '-- Cosine similarity match against known embeddings
  |-- Aggregate results across all frames
  '-- Publish to "face.results":
      {
        job_id, status: "success",
        matches: [
          { enrollment: "2021CSE045", best_confidence: 0.94, seen_in_frames: [0,2,4,5,7] },
          { enrollment: "2021CSE012", best_confidence: 0.88, seen_in_frames: [1,3,5] },
          { enrollment: "2021CSE078", best_confidence: 0.52, seen_in_frames: [6] }
        ],
        unmatched_faces: 3,
        processing_time_ms: 4200
      }
        |
        v
Node consumes "face.results":
  |-- Apply business rules:
  |   |-- seen_in_frames.length >= 2                    → PRESENT
  |   |-- seen_in_frames.length == 1 AND confidence > 0.8 → PRESENT
  |   |-- seen_in_frames.length == 1 AND confidence < 0.8 → LATE (flag for review)
  |   '-- not matched                                   → ABSENT
  |-- Resolve enrollment → student_id via DB
  |-- Batch INSERT into attendance:
  |     (class_id, student_id, date, status,
  |      verification_method='facial',
  |      device_info={confidence, frames_seen})
  |-- Push WebSocket: "35/40 present, 2 flagged for review"
  '-- Update job status for polling
```

---

## 6. Anti-Spoofing (MiniFASNet)

Applied **during registration only**:

- MiniFASNet is a lightweight liveness detection model (~2MB)
- Checks if the face is a real person vs. printed photo, phone screen, or mask
- If spoofing detected: reject that image, include in `spoofing_rejected` count
- During class captures: camera is faculty-controlled, spoofing risk is lower — no check needed
- This is a differentiator vs. every similar GitHub project

---

## 7. Business Rules (owned by Node)

| Rule | Logic | Rationale |
|------|-------|-----------|
| Present | `seen_in_frames >= 2` | Reduces false positives from single-frame glitch |
| Present (high confidence) | `seen_in_frames == 1 AND confidence > 0.8` | Strong single match is reliable |
| Late / Review | `seen_in_frames == 1 AND confidence < 0.8` | Flag for faculty manual review |
| Absent | Not matched in any frame | Default |
| Cooldown | One status per student per class per date | Prevents duplicate entries |

These rules live in Node, not in the ML worker. Changing a threshold doesn't require rebuilding the ML Docker image.

---

## 8. What Changes from Current Codebase

### Deleted

| Item | Reason |
|------|--------|
| `VITE_FASTAPI_HOST` env var in frontend | Frontend talks to Node only |
| Frontend direct calls to FastAPI | All routed through Node |
| `python-backend/` as an HTTP server | Replaced by ML Worker (no HTTP, only RabbitMQ consumer) |
| `pickle.loads()` / `.pkl` files | Replaced by `.npz` |
| Python's direct PostgreSQL writes (attendance, sections) | Node is sole DB writer |
| Hardcoded IP camera in `start-attendance` | Removed; batch photo approach instead |

### New

| Item | Purpose |
|------|---------|
| `ml-worker/` service directory | Stateless Python ML consumer |
| RabbitMQ (Docker) | Job queue between Node and ML Worker |
| `sections.model_version` column | Model versioning for rollback |
| `POST /api/v1/face/register` | Node endpoint for face registration |
| `POST /api/v1/face/process-class` | Node endpoint for batch attendance |
| `GET /api/v1/face/job/:jobId` | Job status polling |
| `WS /ws/attendance/:classId` | Real-time attendance push |
| MiniFASNet integration | Anti-spoofing on registration |

### Unchanged

| Item | Notes |
|------|-------|
| Cloudinary (free tier) | Stores models (.npz), captures, profile pics |
| InsightFace buffalo_s | Same model, same 512-D embeddings |
| PostgreSQL schema | Existing tables unchanged, one new column |
| Node.js auth (JWT) | Same flow, now covers face endpoints too |
| Frontend React app | Same stack, just rewire API calls to Node |

---

## 9. Docker Compose Addition

```yaml
services:
  # existing
  main-backend:
    build: ./main-backend
    ports: ["3000:3000"]
    depends_on: [rabbitmq]

  # new
  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"     # AMQP
      - "15672:15672"   # Management UI
    environment:
      RABBITMQ_DEFAULT_USER: classedgee
      RABBITMQ_DEFAULT_PASS: classedgee

  ml-worker:
    build: ./ml-worker
    depends_on: [rabbitmq]
    environment:
      RABBITMQ_URL: amqp://classedgee:classedgee@rabbitmq:5672
      CLOUDINARY_CLOUD_NAME: ${CLOUDINARY_CLOUD_NAME}
      CLOUDINARY_API_KEY: ${CLOUDINARY_API_KEY}
      CLOUDINARY_API_SECRET: ${CLOUDINARY_API_SECRET}
    deploy:
      replicas: 1  # scale with: docker-compose up --scale ml-worker=3
```

---

## 10. Implementation Order

### Phase 1 — Gateway pattern (fix critical issues)

1. Add face registration + attendance endpoints to Node
2. Node publishes jobs to RabbitMQ, consumes results
3. ML Worker consumes jobs, does compute, publishes results
4. Remove frontend's direct FastAPI calls
5. Remove Python's direct DB writes

### Phase 2 — Model migration + anti-spoofing

1. Migrate pickle → npz model format
2. Add `sections.model_version` column
3. Add model migration script (convert existing .pkl → .npz)
4. Integrate MiniFASNet anti-spoofing in ML Worker

### Phase 3 — Frontend UX

1. Interval photo capture UI (5-min timer, webcam)
2. Job status polling + WebSocket real-time updates
3. Attendance review dashboard (approve/reject flagged students)
4. Progress indicator during processing

### Phase 4 — Polish

1. Local model caching in ML Worker (ETag/version check before re-download)
2. Dead-letter queue handling (retry failed jobs, alert on permanent failure)
3. Cleanup: `tempfile.TemporaryDirectory()` in ML Worker
4. Documentation + Docker Compose one-command startup
