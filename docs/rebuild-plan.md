# ClassEdgee — Full Rebuild Plan

> **Purpose of this document**: A complete, self-contained plan for rebuilding ClassEdgee from scratch. Any AI model (or developer) picking this up in a fresh context should be able to read this document alone and know exactly what to build, in what order, and why. No prior conversation context is needed.

---

## Implementation Status (Last updated: 2026-04-05)

Quick reference — what is Done vs Remaining.

| Phase | Story | Title | Status |
|-------|-------|-------|--------|
| 0 | STORY-001 | Remove dual backend from frontend env | **Done** — frontend FastAPI env references removed (`fastapidomain`, `VITE_FASTAPI_HOST`) |
| 0 | STORY-002 | Add auth middleware to Python backend | **Superseded** — new ml-worker uses RabbitMQ, no HTTP; Python is no longer called by Node over HTTP |
| 0 | STORY-003 | Node proxy route for ML operations | **Done** — `POST /api/v1/face/process-class`, `POST /api/v1/face/register`, `GET /api/v1/face/job/:jobId` |
| 0 | STORY-004 | Move attendance DB writes from Python to Node | **Done** — `faceResultProcessor.js` owns all attendance writes; ml-worker returns results only |
| 0 | STORY-005 | Replace pickle with numpy .npz | **Done** — `ml-worker/worker.py` uses `.npz` throughout; old pickle code gone |
| 1 | STORY-010 | Zustand auth store | Not started |
| 1 | STORY-011 | TanStack Query + token validation | Not started |
| 1 | STORY-012 | Role-namespaced routing | Not started |
| 1 | STORY-013 | Shared AppShell layout | Not started |
| 1 | STORY-014 | Role-specific sidebar nav configs | Not started |
| 2 | STORY-020 | Design system shared components | Not started |
| 2 | STORY-021 | Student Dashboard (real data) | Not started |
| 2 | STORY-022 | Faculty Dashboard (real data) | Not started |
| 2 | STORY-023 | Coordinator Dashboard (real data) | Not started |
| 2 | STORY-024 | Admin Dashboard | Not started |
| 2 | STORY-025 | Login page (unified, role-aware) | Not started |
| 3 | STORY-030 | Student management | Not started |
| 3 | STORY-031 | Faculty management | Not started |
| 3 | STORY-032 | Timetable management | **Backend Done** — CP-SAT solver + Node controller on `feat/scheduler-refactor-ortools`, pending merge; frontend integration not started |
| 3 | STORY-033 | Room and building management | Not started |
| 4 | STORY-040 | Manual attendance marking (faculty) | Not started |
| 4 | STORY-041 | Face recognition attendance | **Done** — async job polling via `AttendanceComponent.tsx` + RabbitMQ pipeline |
| 4 | STORY-042 | Attendance dashboard (coordinator) | Not started |
| 4 | STORY-043 | Student attendance view | Not started |
| 5 | STORY-050 | Class room (notes + resources tab) | Not started |
| 5 | STORY-051 | Quiz system | **Done** — faculty create/list + per-student score view + one-time student submission guard |
| 5 | STORY-052 | Real-time emergency alerts (Socket.io) | **Done** — JWT-authenticated Socket.io with institution rooms + live emergency hooks |
| 5 | STORY-053 | Async face attendance with job polling | **Done** — RabbitMQ queues + in-memory job store + 3s polling in frontend |
| 6 | STORY-060 | Dynamic page titles | **Done** — `usePageTitle` integrated in app/public layouts |
| 6 | STORY-061 | Low attendance email notifications | **Done** — coordinator attendance dashboard includes send-warnings flow |
| 6 | STORY-062 | Profile pages | **Done** — role-namespaced faculty/student profile settings with RHF + Zod |

### What was actually built (face recognition revamp — April 2026)

The entire face recognition pipeline was rebuilt. The old Python FastAPI service is no longer in the ML data path. Here is the new architecture that is live:

```
React Frontend
    │
    ▼
Node.js (main-backend/)  ──── PostgreSQL (owns ALL writes)
    │      │
    │      └── faceResultProcessor.js (consumes face.results queue, writes attendance)
    │
    ▼
RabbitMQ
    │
    ▼
ml-worker/ (Python, stateless)
    └── worker.py: reads face.register / face.recognize queues
                   returns results to face.results queue
                   NO database access whatsoever
```

**New files added in this revamp:**
- `ml-worker/worker.py` — standalone Python RabbitMQ consumer
- `ml-worker/Dockerfile` + `ml-worker/requirements.txt`
- `docker-compose.face.yml` — RabbitMQ + ml-worker
- `main-backend/src/lib/faceQueue.js` — amqplib RabbitMQ client
- `main-backend/src/lib/faceJobStore.js` — in-memory job status Map
- `main-backend/src/lib/faceResultProcessor.js` — attendance writer from worker results
- `main-backend/src/lib/faceBootstrap.js` — starts consumer on app boot
- `main-backend/src/controllers/face.controller.js`
- `main-backend/src/Router/face.router.js` — mounted at `/api/v1/face`
- `main-backend/src/middlewares/requireAuth.js` — JWT auth middleware
- `frontend/src/components/AttendanceComponent.tsx` — updated to call Node, poll job

**Note on STORY-002**: No longer applicable. The ml-worker communicates via RabbitMQ, not HTTP. Node never calls Python over HTTP for ML. The old `python-backend/` still exists (used for bulk Excel processing and schedule generation via `POST /api/v1/schedule/generate`) but is NOT involved in attendance or face recognition.

---

## Table of Contents

1. [What ClassEdgee Is](#1-what-classedgee-is)
2. [Why We Are Rebuilding](#2-why-we-are-rebuilding)
3. [Architecture Decisions](#3-architecture-decisions)
4. [Tech Stack](#4-tech-stack)
5. [Repository Structure](#5-repository-structure)
6. [Design System](#6-design-system)
7. [Route Map](#7-route-map)
8. [API Contract Reference](#8-api-contract-reference)
9. [Phases & Stories](#9-phases--stories)
10. [Story Dependency Graph](#10-story-dependency-graph)
11. [What to Preserve from Current Codebase](#11-what-to-preserve-from-current-codebase)
12. [Definition of Done](#12-definition-of-done)

---

## 1. What ClassEdgee Is

ClassEdgee is a **multi-role academic management system** for colleges and universities. It is a portfolio/resume project demonstrating face-recognition attendance, JWT auth, multi-role access, AI-powered schedule generation, real-time alerts, and PWA.

### Roles

| Role | Code name | Responsibilities |
|------|-----------|-----------------|
| Institution Admin | `admin` | Register institution, create coordinator accounts, generate IDs |
| Coordinator | `coordinator` | Manage students, faculty, rooms, timetable, courses, attendance oversight |
| Faculty | `faculty` | View schedule, teach classes, mark attendance, upload notes/resources, run quizzes |
| Student | `student` | View classes, access notes/resources, submit quizzes, track own attendance |

### Services (current state — post face-revamp)

| Service | Directory | Port | Notes |
|---------|-----------|------|-------|
| React Frontend | `frontend/` | 5173 (dev) | |
| Node.js API | `main-backend/` | 3000 | Single gateway for all frontend calls |
| ML Worker | `ml-worker/` | — | Stateless RabbitMQ consumer, no HTTP port |
| RabbitMQ | docker-compose.face.yml | 5672 | Queues: face.register, face.recognize, face.results |
| Python (legacy) | `python-backend/` | 8000 | Still used for bulk Excel upload + schedule generation only |
| Database | PostgreSQL | 5432 | All writes owned by Node |

---

## 2. Why We Are Rebuilding

The current codebase is broken in 8 specific ways. These are **not style opinions** — they are functional failures.

### Critical failures (must fix)

**F1 — Split-brain database writes**
Python FastAPI writes `attendance` records directly to PostgreSQL, bypassing Node entirely. Node also writes to the same table. Two services own the same data with no coordination. This causes inconsistent validation and no unified audit trail.

**F2 — No authentication on Python backend**
Zero auth on any FastAPI endpoint. Anyone who discovers the `VITE_FASTAPI_HOST` URL can register arbitrary face models or mark fake attendance. The URL is exposed in the frontend bundle.

**F3 — Frontend talks to two backends**
React sends requests to both `VITE_LOCAL_IP` (Node) and `VITE_FASTAPI_HOST` (FastAPI) directly. This means the frontend knows the internal service topology, requires two CORS configs, and leaks the Python service URL to the browser.

### UX/code failures (make it unusable)

**F4 — Shared `/p/*` route namespace for all roles**
All four roles share the same URL prefix. The `ProtectedRoute` component switches on `user.role` but the routes are duplicated and confusing. No isolation between roles.

**F5 — Navigation doesn't match actual routes**
The sidebar for coordinator is missing: Buildings, Rooms (partially), Resources, Attendance. The faculty sidebar has duplicate "Administration" and "Department" sections both pointing to similar pages.

**F6 — Dashboard stats are hardcoded**
Student dashboard shows hardcoded "5 courses enrolled", "85% average". Coordinator dashboard shows hardcoded "System Status: Active". Users see fake data.

**F7 — Four state management systems in parallel**
Redux Toolkit + Jotai atoms + AuthContext + direct localStorage access. No single source of truth for auth state. Cross-tab sync is manually implemented with custom events.

**F8 — No error states, inconsistent loading states**
Some pages show a spinner, some show `<div>loading</div>` (literal text), some show nothing. When an API call fails, the page silently stays empty with no message and no retry.

---

## 3. Architecture Decisions

These are final decisions. Do not re-evaluate them during implementation.

### Decision 1: Node.js is the single API gateway

React never calls Python directly. All API traffic goes through Node. Node calls Python internally.

```
React Frontend
     │
     ▼
Node.js (port 3000)  ──── PostgreSQL
     │
     ▼
Python ML Worker (internal only, no public exposure)
```

**Why**: Fixes F2 (Python auth), F3 (frontend topology), and F1 (DB write ownership).

### Decision 2: Role-namespaced routes

Each role gets its own URL namespace. Zero shared paths between roles.

```
/admin/*        → Admin app
/coordinator/*  → Coordinator app
/faculty/*      → Faculty app
/student/*      → Student app
```

**Why**: Fixes F4. No role-switch logic needed. Each role's routes are self-contained and independently maintainable.

### Decision 3: TanStack Query for server state, Zustand for client state

Replace Redux Toolkit + Jotai + AuthContext with:
- **TanStack Query v5** — all data that comes from an API (classes, students, attendance, etc.)
- **Zustand** — client-only state (auth user/token, UI state like sidebar open)

**Why**: Fixes F7. One system for server cache (with staleTime, retry, refetch). One system for client state. No thunks, no slices, no atoms.

### Decision 4: Python (ml-worker) returns results, Node writes to DB ✅ IMPLEMENTED

The ml-worker is a **pure compute worker**. It reads from RabbitMQ queues, does ML computation, publishes results back to `face.results` queue. It never touches PostgreSQL.

Node's `faceResultProcessor.js` consumes `face.results`, applies business rules (min frames, confidence thresholds), and writes to the `attendance` table via Prisma.

Business rules live in `faceResultProcessor.js`:
- `FACE_PRESENT_MIN_FRAMES` (env var, default 2) — student must appear in ≥N frames
- `FACE_SINGLE_FRAME_HIGH_CONF` (env var, default 0.8) — single frame allowed if confidence ≥ this

**Why**: Fixes F1. Node owns all data. Business logic stays in Node.

### Decision 5: RabbitMQ for job queue (not BullMQ) ✅ IMPLEMENTED

Face recognition uses **RabbitMQ** via `amqplib` (not BullMQ/Redis). This was the right choice:
- `prefetch_count=1` prevents CPU contention on the ml-worker
- Durable queues survive restarts
- Works with Docker Compose out of the box (`docker-compose.face.yml`)
- ml-worker is horizontally scalable: `docker-compose scale ml-worker=N`

The async flow (upload → job_id → poll) is fully implemented:
- `POST /api/v1/face/process-class` → `{ job_id }`
- `GET /api/v1/face/job/:jobId` → `{ status, result }`
- Frontend polls every 3 seconds (`AttendanceComponent.tsx`)

---

## 4. Tech Stack

### Frontend

| Concern | Package | Notes |
|---------|---------|-------|
| Framework | React 19 + TypeScript 5 | Keep from current |
| Build | Vite 5 | Keep from current |
| Router | React Router v6 | Keep, restructure routes |
| UI components | Shadcn UI + Radix | Keep all `/components/ui/` |
| Styling | Tailwind CSS 3.4 | Keep from current |
| Server state | TanStack Query v5 | Replace Redux data fetching |
| Client state | Zustand 4 | Replace Redux auth + Jotai atoms |
| Forms | React Hook Form + Zod | Keep from current |
| HTTP client | Axios 1.7 | Keep, single base URL (Node only) |
| Charts | Recharts | Keep from current |
| Toasts | Sonner | Keep from current |
| Icons | Lucide React | Keep from current |
| Animations | Framer Motion | Keep, use sparingly |

**Remove**: Redux Toolkit, Jotai, `enhancedLocalStorage` custom events.

**Single API base URL**: `VITE_API_URL` → Node.js backend only. Remove `VITE_FASTAPI_HOST` from frontend env.

**API call rule (enforced from Phase 3 onward)**: Every HTTP call in `src/api/*.ts` **must** use the shared `api` instance from `@/api/axios`, never raw `axios` directly. The shared instance has the auth token interceptor (injects `Authorization: Bearer <token>`) and the 401 → token refresh handler. Using raw `axios` bypasses both and will silently fail when the token expires.

```ts
// CORRECT
import api from "@/api/axios";
const response = await api.get("/api/v1/some/endpoint");

// WRONG — do not do this
import axios from "axios";
import { domain } from "@/lib/constant";
const response = await axios.get(`${domain}/api/v1/some/endpoint`);
```

Any existing file that violates this (e.g. `service.ts` pre-phase3) must be migrated when touched.

### Backend (Node.js — `main-backend/`)

| Concern | Package | Notes |
|---------|---------|-------|
| Framework | Express.js v4 | Keep |
| ORM | Prisma v5 | Keep |
| Database | PostgreSQL | Keep |
| Auth | jsonwebtoken + bcrypt | Keep |
| File upload | multer + Cloudinary | Keep for profile images |
| Email | nodemailer | Keep |
| HTTP client | axios | Keep, for calling Python internally |
| Job queue | BullMQ + Redis | Phase 4 upgrade (bull already installed) |
| WebSocket | Socket.io | Phase 4 for real-time notifications |

### Backend (Python — `python-backend/`)

| Concern | Package | Notes |
|---------|---------|-------|
| Framework | FastAPI | Keep |
| Face recognition | InsightFace | Keep |
| Model format | numpy `.npz` | Replace pickle (security fix) |
| Auth | Shared API key header | Add `X-Internal-Key` header check |

Python service is internal only. No CORS needed. Accepts requests only with `X-Internal-Key: <secret>` header set by Node.

---

## 5. Repository Structure

```
ClassEdgee/
├── frontend/
│   └── src/
│       ├── api/                    # Axios instance + query functions (one per domain)
│       │   ├── axios.ts            # Single axios instance, VITE_API_URL base
│       │   ├── auth.api.ts
│       │   ├── student.api.ts
│       │   ├── faculty.api.ts
│       │   ├── coordinator.api.ts
│       │   ├── attendance.api.ts
│       │   ├── classes.api.ts
│       │   └── schedule.api.ts
│       ├── components/
│       │   ├── ui/                 # Shadcn components (do not edit these)
│       │   └── shared/             # Design system primitives (see Section 6)
│       │       ├── PageHeader.tsx
│       │       ├── StatCard.tsx
│       │       ├── DataTable.tsx
│       │       ├── EmptyState.tsx
│       │       ├── ErrorState.tsx
│       │       └── LoadingSkeleton.tsx
│       ├── hooks/
│       │   ├── useAuth.ts          # Zustand auth store selector
│       │   └── useCurrentUser.ts   # TanStack Query: GET /api/v1/general/validate-token
│       ├── layouts/
│       │   ├── AppShell.tsx        # Sidebar + header wrapper (all roles share this)
│       │   └── PublicLayout.tsx    # Landing/auth pages (no sidebar)
│       ├── pages/
│       │   ├── public/
│       │   │   ├── LandingPage.tsx
│       │   │   ├── Login.tsx
│       │   │   └── Registration.tsx
│       │   ├── admin/              # /admin/* routes
│       │   │   ├── AdminApp.tsx    # Route definitions for admin
│       │   │   ├── Dashboard.tsx
│       │   │   └── IdGenerate.tsx
│       │   ├── coordinator/        # /coordinator/* routes
│       │   │   ├── CoordinatorApp.tsx
│       │   │   ├── Dashboard.tsx
│       │   │   ├── students/
│       │   │   ├── faculty/
│       │   │   ├── courses/
│       │   │   ├── rooms/
│       │   │   ├── buildings/
│       │   │   ├── timetable/
│       │   │   └── attendance/
│       │   ├── faculty/            # /faculty/* routes
│       │   │   ├── FacultyApp.tsx
│       │   │   ├── Dashboard.tsx
│       │   │   ├── classes/
│       │   │   ├── schedule/
│       │   │   ├── attendance/
│       │   │   └── profile/
│       │   └── student/            # /student/* routes
│       │       ├── StudentApp.tsx
│       │       ├── Dashboard.tsx
│       │       ├── classes/
│       │       ├── attendance/
│       │       └── profile/
│       ├── store/
│       │   └── auth.store.ts       # Zustand: { user, token, setAuth, clearAuth }
│       ├── lib/
│       │   ├── constants.ts        # VITE_API_URL, query keys
│       │   └── utils.ts            # cn() and other utils
│       └── App.tsx                 # Top-level router: public vs role-namespaced
│
├── main-backend/                   # Node.js (keep existing structure, add proxy route)
│   └── src/
│       ├── routes/
│       │   └── ml.router.js        # New: proxies /api/v1/ml/* to Python internally
│       └── ...existing routes...
│
├── python-backend/                 # FastAPI (add auth middleware, fix pickle)
│   └── ...existing structure...
│
└── docs/
    └── rebuild-plan.md             # This file
```

---

## 6. Design System

Define these once in `frontend/src/components/shared/`. Every page uses these primitives. No page invents its own layout.

### Design Tokens (add to `tailwind.config.ts`)

```ts
// Colors — semantic, not arbitrary
colors: {
  primary:   { DEFAULT: '#2563eb', foreground: '#fff' },  // blue-600
  danger:    { DEFAULT: '#dc2626', foreground: '#fff' },  // red-600 — emergencies, errors
  warning:   { DEFAULT: '#d97706', foreground: '#fff' },  // amber-600 — due soon, caution
  success:   { DEFAULT: '#16a34a', foreground: '#fff' },  // green-600 — present, active
  muted:     { DEFAULT: '#f1f5f9', foreground: '#64748b' }, // slate-100/500
}
```

### Shared Component Specs

#### `PageHeader`
```tsx
// Props: title, description?, breadcrumbs?, actions?
// Usage: top of every page
<PageHeader
  title="Student Management"
  description="Add, edit, and manage students"
  breadcrumbs={[{ label: 'Dashboard', href: '/coordinator' }, { label: 'Students' }]}
  actions={<Button>Add Student</Button>}
/>
```

#### `StatCard`
```tsx
// Props: label, value, trend?, trendLabel?, icon?, variant? (default|danger|warning|success)
// Usage: dashboard summary metrics
<StatCard label="Total Students" value={342} trend={+12} trendLabel="this month" icon={Users} />
```

#### `DataTable`
```tsx
// Props: columns, data, isLoading, error?, emptyMessage?, onRowClick?
// Built on Shadcn Table + TanStack Table
// Always shows: loading skeleton | error state | empty state | data
```

#### `EmptyState`
```tsx
// Props: icon, title, description, action?
// Usage: when a list/table has no data
<EmptyState icon={Users} title="No students yet" description="Add your first student to get started" action={<Button>Add Student</Button>} />
```

#### `ErrorState`
```tsx
// Props: message, onRetry?
// Usage: when an API call fails
<ErrorState message="Failed to load students" onRetry={refetch} />
```

#### `LoadingSkeleton`
```tsx
// Props: variant: 'card' | 'table' | 'list' | 'stat'
// Usage: inline per-component loading, never full-page spinners
<LoadingSkeleton variant="table" rows={5} />
```

### Rules

1. Every data-fetching component must render one of: LoadingSkeleton | ErrorState | EmptyState | actual data.
2. Full-page spinners are banned. Loading is per-component.
3. Never hardcode mock data in a page component. If the API isn't ready, use a realistic static fixture exported from a `__fixtures__` folder.
4. Page layout follows: `<PageHeader> → <StatCards row> → <main content>`. Deviation requires justification.

---

## 7. Route Map

### Public Routes

| Path | Component | Notes |
|------|-----------|-------|
| `/` | `LandingPage` | Institution marketing page |
| `/auth/login` | `Login` | Replaces `/auth/signin` |
| `/auth/register` | `Registration` | Institution setup |

### Admin Routes (`/admin/*`)

| Path | Component |
|------|-----------|
| `/admin` | `AdminDashboard` |
| `/admin/coordinators` | `CoordinatorList` |
| `/admin/coordinators/new` | `CreateCoordinator` |
| `/admin/emergency` | `EmergencyAlert` |

### Coordinator Routes (`/coordinator/*`)

| Path | Component |
|------|-----------|
| `/coordinator` | `CoordinatorDashboard` |
| `/coordinator/students` | `StudentList` |
| `/coordinator/students/new` | `CreateStudent` (tabs: manual / bulk upload) |
| `/coordinator/students/:id/edit` | `EditStudent` |
| `/coordinator/faculty` | `FacultyList` |
| `/coordinator/faculty/new` | `CreateFaculty` (tabs: manual / bulk upload) |
| `/coordinator/faculty/:id/edit` | `EditFaculty` |
| `/coordinator/departments` | `DepartmentList` |
| `/coordinator/departments/:id` | `DepartmentDetail` |
| `/coordinator/departments/:id/add-hod` | `AddHod` |
| `/coordinator/courses` | `CourseDashboard` |
| `/coordinator/courses/:id` | `CourseDetail` |
| `/coordinator/courses/:course_id/semester/:sem_id/:syllabus_id` | `SemesterSyllabus` |
| `/coordinator/timetable` | `TimetableManagement` |
| `/coordinator/rooms` | `RoomManagement` |
| `/coordinator/buildings` | `BuildingManagement` |
| `/coordinator/attendance` | `AttendanceDashboard` |
| `/coordinator/resources` | `ResourceManagement` |
| `/coordinator/emergency` | `EmergencyAlert` |

### Faculty Routes (`/faculty/*`)

| Path | Component |
|------|-----------|
| `/faculty` | `FacultyDashboard` |
| `/faculty/classes` | `ClassList` (upcoming + past tabs) |
| `/faculty/classes/:class_id` | `ClassRoom` (notes, quiz, attendance tabs) |
| `/faculty/classes/:class_id/quiz` | `QuizManagement` |
| `/faculty/schedule` | `ScheduleDashboard` |
| `/faculty/schedule/:section_id` | `ScheduleViewer` |
| `/faculty/attendance` | `AttendanceDashboard` (replaces `/student-details`) |
| `/faculty/resources` | `ResourceManagement` |
| `/faculty/department` | `DepartmentView` |
| `/faculty/courses` | `CourseDashboard` |
| `/faculty/profile` | `ProfileSettings` |
| `/faculty/emergency` | `EmergencyAlert` |

### Student Routes (`/student/*`)

| Path | Component |
|------|-----------|
| `/student` | `StudentDashboard` |
| `/student/classes` | `ClassList` |
| `/student/classes/:class_id` | `ClassRoom` (notes, resources, quiz tabs) |
| `/student/attendance` | `AttendanceSummary` |
| `/student/calendar` | `Calendar` |
| `/student/notifications` | `Notifications` |
| `/student/feedback` | `Feedback` |
| `/student/profile` | `StudentProfile` |
| `/student/emergency` | `EmergencyAlert` |

---

## 8. API Contract Reference

The frontend only calls Node.js (`VITE_API_URL`). These are the key endpoints.

### Auth

```
POST /api/v1/general/login
  body: { email, password, role }
  → { accessToken, refreshToken, user: { user_id, name, email, role, institution_id } }

GET  /api/v1/general/validate-token
  header: Authorization: Bearer <token>
  → { user: { user_id, name, email, role, institution_id } }

POST /api/v1/general/refresh-token
  body: { refreshToken }
  → { accessToken }

POST /api/v1/general/logout
  → 200
```

### Students (coordinator manages)

```
GET    /api/v1/student?section_id=&department_id=   → { students: [...] }
POST   /api/v1/student/create                        → { student }
PUT    /api/v1/student/:id                           → { student }
DELETE /api/v1/student/:id                           → 204
POST   /api/v1/student/bulk-upload                   → { created, failed }
```

### Faculty (coordinator manages)

```
GET    /api/v1/faculty?department_id=    → { faculty: [...] }
POST   /api/v1/faculty/create            → { faculty }
PUT    /api/v1/faculty/:id               → { faculty }
DELETE /api/v1/faculty/:id               → 204
POST   /api/v1/faculty/bulk-upload       → { created, failed }
```

### Classes

```
GET  /api/v1/classes/upcoming?faculty_id=    → { classes: [...] }
GET  /api/v1/classes/past?faculty_id=        → { classes: [...] }
GET  /api/v1/classes/:class_id               → { class, notes, resources }
```

### Attendance

```
GET  /api/v1/attendance/history/:class_id    → { records: [...] }
POST /api/v1/attendance/mark                 → { marked: number }
  body: { class_id, student_ids: [], method: 'manual' }

POST /api/v1/attendance/face                 → { job_id } (async in Phase 4)
  body: multipart: { video, class_id, section_id }
  Phase 1: synchronous, returns { marked: number } directly
  Phase 4: async, returns job_id, poll GET /api/v1/attendance/job/:job_id
```

### Schedule

```
GET  /api/v1/schedule/:section_id            → { timetable: [...] }
POST /api/v1/schedule/generate               → { schedule } (calls Python internally)
```

### ML Proxy (new, added in Phase 1)

```
POST /api/v1/ml/face-attendance
  Node receives, calls Python internally with X-Internal-Key header
  Python never exposed to frontend
```

---

## 9. Phases & Stories

Each story follows this format:
- **ID**: Unique identifier for cross-referencing
- **Status**: `Draft | Ready | In Progress | Done`
- **Why**: The reason this story exists — what problem it solves
- **Acceptance Criteria**: Testable conditions that must all be true for story to be Done
- **Files**: Primary files to create or modify
- **Depends on**: Story IDs that must be Done before this story starts

---

### Phase 0 — Foundation

> Gate: All Phase 0 stories Done before any Phase 1 story starts.

---

#### STORY-001 — Remove dual backend from frontend env
**Status**: `Done ✅`

**Why**: The frontend has `VITE_FASTAPI_HOST` which exposes the Python service URL in the browser bundle.

**What was done**: `AttendanceComponent.tsx` now calls `${domain}/api/v1/face/process-class` (Node only). ✅

**What was completed**:
- [x] `fastapidomain` export removed from `frontend/src/lib/constant.ts`
- [x] `VITE_FASTAPI_HOST` removed from frontend env references (`.env.example` and source usage)
- [x] Dead FastAPI comments removed from `ClassDashboard.tsx`
- [x] Verified zero `grep` matches for `fastapidomain` and `VITE_FASTAPI_HOST` in `frontend/src/`

**Files**:
- `frontend/src/lib/constant.ts` — remove `fastapidomain` line
- `frontend/src/pages/Protected/faculty/classes/ClassDashboard.tsx` — remove dead commented code
- `frontend/.env` (if exists) — remove `VITE_FASTAPI_HOST`

**Depends on**: nothing

---

#### STORY-002 — Add auth middleware to Python backend
**Status**: `Superseded — skip`

**Why superseded**: The new ml-worker communicates exclusively via RabbitMQ queues, not HTTP. Node never calls Python over HTTP for ML operations. The ml-worker has no HTTP server at all — it only reads from RabbitMQ queues. There is no HTTP endpoint to secure.

The old `python-backend/` FastAPI service still runs for two remaining functions (bulk Excel upload + schedule generation). If you want to secure those, add a shared API key header there. But it is not blocking any current work.

**No action required for this story.**

**Depends on**: nothing

---

#### STORY-003 — Node proxy route for ML operations
**Status**: `Done ✅`

**What was built** (better than the original plan):
- `POST /api/v1/face/register` — queues face registration job to RabbitMQ
- `POST /api/v1/face/process-class` — queues face recognition job to RabbitMQ
- `GET /api/v1/face/job/:jobId` — returns job status from in-memory store
- All routes protected by `requireAuth` middleware (JWT validation)
- Mounted at `/api/v1/face` in `main-backend/server.js`

**Key files**:
- `main-backend/src/Router/face.router.js`
- `main-backend/src/controllers/face.controller.js`
- `main-backend/src/middlewares/requireAuth.js`

**Depends on**: STORY-002 (superseded)

---

#### STORY-004 — Move attendance DB writes from Python to Node
**Status**: `Done ✅`

**What was built**: `faceResultProcessor.js` in Node consumes the `face.results` RabbitMQ queue and writes all attendance records via Prisma.

- ml-worker publishes `{ job_id, job_type, status, matches: [...], ... }` to `face.results`
- `faceResultProcessor.js` resolves `enrollment_number → student_id` via Prisma, then `upsert`s attendance with `verification_method: 'facial'`
- ml-worker has zero database access (no psycopg2, no Prisma, no SQLAlchemy)
- Business rules (min frames, high confidence single-frame) applied in Node

**Key files**:
- `main-backend/src/lib/faceResultProcessor.js`
- `main-backend/src/lib/faceJobStore.js` (in-memory job status tracking)

**Depends on**: STORY-003

---

#### STORY-005 — Replace pickle model storage with numpy .npz
**Status**: `Done ✅`

**What was built**: `ml-worker/worker.py` uses `.npz` throughout. `pickle` is never imported.

- `load_npz_model_from_url()` — downloads and loads `.npz` with `np.load(..., allow_pickle=False)` (safe)
- `upload_npz_model()` — saves as `section_{id}_model_v{N}.npz` to Cloudinary
- `parse_model_version()` — extracts version number from URL, auto-increments on registration
- Model format: `{ enrollments: string[], embeddings: float32[N, 512] }`
- No migration utility needed — old `python-backend/` pickle models are simply unused now (new ml-worker starts fresh)

**Key files**:
- `ml-worker/worker.py` — all model I/O functions

**Depends on**: nothing

---

### Phase 1 — Auth + App Shell

> Gate: All Phase 0 stories Done. Phase 1 delivers a working login → role-based redirect → correct sidebar for each role.

---

#### STORY-010 — Zustand auth store
**Status**: `Ready`

**Why**: Replaces Redux Toolkit auth slice + Jotai userAtom + AuthContext + enhancedLocalStorage events with a single Zustand store. Fixes F7.

**Acceptance Criteria**:
- [ ] `frontend/src/store/auth.store.ts` created with Zustand
- [ ] Store shape: `{ user: User | null, token: string | null, setAuth(user, token): void, clearAuth(): void }`
- [ ] `user` and `token` persisted to `localStorage` via `zustand/middleware persist`
- [ ] `useAuth` hook exported: `const { user, token, setAuth, clearAuth } = useAuth()`
- [ ] `AuthContext.tsx` removed
- [ ] `Redux store` auth slice removed
- [ ] `Jotai userAtom, roleAtom` removed
- [ ] All components that previously used `useAuth()` from AuthContext now use `useAuth()` from Zustand store

**Files**:
- `frontend/src/store/auth.store.ts` — new
- `frontend/src/services/AuthContext.tsx` — delete
- `frontend/src/store/index.ts` — remove auth slice
- All pages/components using `useAuth` — update import

**Depends on**: nothing

---

#### STORY-011 — TanStack Query setup + token validation
**Status**: `Ready`

**Why**: Currently the app validates the JWT token in an effect inside AuthContext and manages loading state manually. TanStack Query handles this cleanly with caching, retry, and loading states.

**Acceptance Criteria**:
- [ ] `QueryClient` and `QueryClientProvider` wrapping the app in `main.tsx`
- [ ] `useCurrentUser` hook: calls `GET /api/v1/general/validate-token`, returns `{ user, isLoading, isError }`
- [ ] On `401` response, Zustand `clearAuth()` is called and user is redirected to `/auth/login`
- [ ] Axios interceptor handles token refresh: on 401, attempts `POST /api/v1/general/refresh-token` once, retries original request, then clears auth if refresh also fails
- [ ] Single `axios.ts` instance exported from `frontend/src/api/axios.ts` with `baseURL: import.meta.env.VITE_API_URL`

**Files**:
- `frontend/src/main.tsx` — add QueryClientProvider
- `frontend/src/api/axios.ts` — new: single axios instance + interceptors
- `frontend/src/hooks/useCurrentUser.ts` — new

**Depends on**: STORY-010

---

#### STORY-012 — Role-namespaced routing
**Status**: `Ready`

**Why**: Replaces the single `/p/*` namespace with isolated role routes. Fixes F4.

**Acceptance Criteria**:
- [ ] `App.tsx` routes:
  - `/` → `LandingPage`
  - `/auth/login` → `Login` (also accepts old `/auth/signin` with redirect)
  - `/auth/register` → `Registration`
  - `/admin/*` → `AdminApp` (requires role: admin)
  - `/coordinator/*` → `CoordinatorApp` (requires role: coordinator)
  - `/faculty/*` → `FacultyApp` (requires role: faculty)
  - `/student/*` → `StudentApp` (requires role: student)
- [ ] `RoleGuard` component: if `!user` redirect to `/auth/login`; if `user.role !== expectedRole` redirect to correct role's root
- [ ] After login, user is redirected to their role's root: admin → `/admin`, coordinator → `/coordinator`, etc.
- [ ] Old `/p/*` routes return 404 (no redirect, force clean break)

**Files**:
- `frontend/src/App.tsx` — rewrite
- `frontend/src/components/RoleGuard.tsx` — new
- `frontend/src/pages/admin/AdminApp.tsx` — new (just route definitions)
- `frontend/src/pages/coordinator/CoordinatorApp.tsx` — new
- `frontend/src/pages/faculty/FacultyApp.tsx` — new
- `frontend/src/pages/student/StudentApp.tsx` — new

**Depends on**: STORY-010, STORY-011

---

#### STORY-013 — Shared AppShell layout
**Status**: `Ready`

**Why**: All four roles need a sidebar + header + content area. Currently each role has its own layout with subtle differences. One `AppShell` component serves all roles.

**Acceptance Criteria**:
- [ ] `AppShell` accepts `nav` prop: array of `{ title, icon, href, children?: [...] }`
- [ ] Sidebar uses Shadcn `Sidebar` component (collapsible="icon")
- [ ] Header has: sidebar toggle button | breadcrumb (auto-generated from current path) | user avatar + name + logout
- [ ] Emergency alert banner renders at top of content area if active emergency exists (single `useEmergency` hook, not duplicate components per role)
- [ ] Mobile: sidebar collapses to icon-only or Sheet drawer based on screen width
- [ ] `PublicLayout` for landing/auth pages: no sidebar, no header

**Files**:
- `frontend/src/layouts/AppShell.tsx` — new
- `frontend/src/layouts/PublicLayout.tsx` — new
- `frontend/src/components/shared/BreadcrumbNav.tsx` — updated to use React Router location
- `frontend/src/hooks/useEmergency.ts` — unified emergency check hook

**Depends on**: STORY-012

---

#### STORY-014 — Role-specific sidebar navigation configs
**Status**: `Ready`

**Why**: Each role's sidebar navigation must match all available routes (current sidebar is missing multiple routes). Navigation config is a data structure, not embedded logic.

**Acceptance Criteria**:
- [ ] Navigation config in `frontend/src/lib/navigation.ts` — one array per role
- [ ] **Admin nav**: Dashboard, Coordinators, Emergency
- [ ] **Coordinator nav**: Dashboard | Students | Faculty | Courses | Timetable | Departments | Rooms | Buildings | Attendance | Resources | Emergency
- [ ] **Faculty nav**: Dashboard | Classes (Today's Classes, Class List, Syllabus) | Schedule | Attendance | Resources | Department | Courses | Profile | Emergency
  - Note: "Student Details" renamed to "Attendance" — no confusion about the page's purpose
- [ ] **Student nav**: Dashboard | Classes | Attendance | Calendar | Notifications | Feedback | Profile | Emergency
- [ ] Every nav item's `href` matches a route that actually exists in that role's `*App.tsx`
- [ ] Active nav item highlighted based on current URL (React Router `useMatch`)

**Files**:
- `frontend/src/lib/navigation.ts` — new
- `frontend/src/components/AppSidebar.tsx` — simplified (reads from navigation.ts)

**Depends on**: STORY-013

---

### Phase 2 — Core Loop Per Role

> Gate: Phase 1 Done. Phase 2 delivers the primary screen for each role with real data (no hardcoded stats).

---

#### STORY-020 — Design system shared components
**Status**: `Ready`

**Why**: All Phase 2 pages use `PageHeader`, `StatCard`, `DataTable`, `EmptyState`, `ErrorState`, `LoadingSkeleton`. These must exist before any page is built.

**Acceptance Criteria**:
- [ ] All 6 components from Section 6 built and exported from `frontend/src/components/shared/index.ts`
- [ ] `StatCard`: renders skeleton when `value` is undefined/null
- [ ] `DataTable`: renders `LoadingSkeleton` when `isLoading`, `ErrorState` when `error`, `EmptyState` when `data.length === 0`
- [ ] `ErrorState`: always has a retry button if `onRetry` prop is provided
- [ ] Tailwind design token colors from Section 6 added to `tailwind.config.ts`
- [ ] All components are fully typed with TypeScript

**Files**:
- `frontend/src/components/shared/PageHeader.tsx` — new
- `frontend/src/components/shared/StatCard.tsx` — new
- `frontend/src/components/shared/DataTable.tsx` — new
- `frontend/src/components/shared/EmptyState.tsx` — new
- `frontend/src/components/shared/ErrorState.tsx` — new
- `frontend/src/components/shared/LoadingSkeleton.tsx` — new
- `frontend/src/components/shared/index.ts` — barrel export
- `tailwind.config.ts` — add semantic colors

**Depends on**: STORY-013

---

#### STORY-021 — Student Dashboard (real data)
**Status**: `Ready`

**Why**: Current student dashboard shows hardcoded stats ("5 courses", "85% average"). This story makes it real. Fixes F6 for student role.

**Acceptance Criteria**:
- [ ] Page at `/student` renders:
  - Greeting: "Good morning, {name}" (time-aware)
  - `StatCard` row: Enrolled Courses (real count) | Attendance % (real %, color: green if ≥75%, red if <75%) | Upcoming Classes Today (real count)
  - "Today's Classes" section: list of today's classes with subject, time, room — from `GET /api/v1/classes/upcoming`
  - "Recent Activity" section (optional, show EmptyState if no data)
- [ ] All stats show `LoadingSkeleton` while loading
- [ ] If any API call fails, affected section shows `ErrorState` with retry button
- [ ] No hardcoded numbers anywhere in the component

**Files**:
- `frontend/src/pages/student/Dashboard.tsx` — rewrite
- `frontend/src/api/classes.api.ts` — add `getUpcomingClasses()`
- `frontend/src/api/attendance.api.ts` — add `getStudentAttendanceSummary()`

**Depends on**: STORY-020, STORY-014

---

#### STORY-022 — Faculty Dashboard (real data)
**Status**: `Ready`

**Why**: Current faculty dashboard has hardcoded "Class Completion: 78%" and "Attendance Updates". Fixes F6 for faculty role.

**Acceptance Criteria**:
- [ ] Page at `/faculty` renders:
  - Greeting with faculty name + department
  - `StatCard` row: Classes Today | Total Students | Pending Attendance (classes where attendance not marked)
  - "Today's Schedule" section: time-ordered list of today's classes
  - "Classes Needing Attention" section: classes with no attendance marked (warns faculty)
- [ ] `StatCard` for "Pending Attendance" uses `variant="warning"` if count > 0
- [ ] All data from real API calls (TanStack Query)
- [ ] No hardcoded numbers or progress bars

**Files**:
- `frontend/src/pages/faculty/Dashboard.tsx` — rewrite
- `frontend/src/api/classes.api.ts` — add `getFacultyTodayClasses()`

**Depends on**: STORY-020, STORY-014

---

#### STORY-023 — Coordinator Dashboard (real data)
**Status**: `Ready`

**Why**: Current coordinator dashboard has entirely hardcoded stats AND non-functional Quick Actions buttons. Fixes F6 for coordinator role.

**Acceptance Criteria**:
- [ ] Page at `/coordinator` renders:
  - `StatCard` row: Total Students | Total Faculty | Active Rooms | Sections
  - "Management" grid: 6 navigation cards (Students, Faculty, Courses, Timetable, Rooms, Attendance) — each card shows count + link to section
  - Quick Actions: "Add Student", "Add Faculty", "Generate Schedule" — all navigate to real routes
  - No "System Status" section with hardcoded "Active" badges
- [ ] All counts are real (from API)
- [ ] Non-functional placeholder buttons removed entirely

**Files**:
- `frontend/src/pages/coordinator/Dashboard.tsx` — rewrite
- `frontend/src/api/coordinator.api.ts` — add `getCoordinatorStats()`

**Depends on**: STORY-020, STORY-014

---

#### STORY-024 — Admin Dashboard
**Status**: `Ready`

**Why**: Current admin/supreme dashboard is a single button on a half-empty page. It has no real functionality display.

**Acceptance Criteria**:
- [ ] Page at `/admin` renders:
  - Institution name + ID (from token/API)
  - `StatCard` row: Total Coordinators | Active Sections | Students in System
  - "Coordinator Accounts" table: list of coordinators with name, email, department, created date
  - "Create Coordinator" button opens a dialog/sheet form
- [ ] Uses `DataTable` for coordinator list
- [ ] All data from real API

**Files**:
- `frontend/src/pages/admin/Dashboard.tsx` — rewrite
- `frontend/src/api/coordinator.api.ts` — add `getCoordinators()`

**Depends on**: STORY-020, STORY-014

---

#### STORY-025 — Login page (unified, role-aware)
**Status**: `Ready`

**Why**: Current login page has separate endpoints per role (`/api/v1/{role}/login`). The role selector UX is unclear.

**Acceptance Criteria**:
- [ ] Single login form: email + password + role selector (dropdown: Student | Faculty | Coordinator | Admin)
- [ ] On success: store `{ user, token }` in Zustand, redirect to role root (`/admin`, `/coordinator`, etc.)
- [ ] On failure: show inline error message below form (not toast)
- [ ] "Forgot password" link visible (can be placeholder for now)
- [ ] Form validation with Zod: email format, password min 6 chars
- [ ] Loading state on submit button (disabled + spinner)
- [ ] Route `/auth/signin` redirects to `/auth/login` (backward compat)

**Files**:
- `frontend/src/pages/public/Login.tsx` — rewrite
- `frontend/src/api/auth.api.ts` — `login(email, password, role)` function

**Depends on**: STORY-010, STORY-012

---

### Phase 3 — Coordinator Management Features

> Gate: Phase 2 Done. Phase 3 delivers the coordinator's daily workflows: managing students, faculty, timetable.

---

#### STORY-030 — Student management (list, create, edit, delete)
**Status**: `Draft`

**Why**: The most-used coordinator workflow. Existing pages exist but use inconsistent layouts and no error states.

**Acceptance Criteria**:
- [ ] `/coordinator/students` — `DataTable` with columns: Name, Enrollment No, Section, Department, Attendance %, Actions (Edit, Delete)
- [ ] Search/filter: by department, by section, by name
- [ ] `/coordinator/students/new` — tabbed form: "Manual Entry" tab + "Bulk Upload" tab
  - Manual: React Hook Form + Zod, all required fields
  - Bulk: CSV/Excel upload, shows preview of parsed rows before submitting, shows `{ created, failed }` result after
- [ ] `/coordinator/students/:id/edit` — pre-filled form, submit calls PUT endpoint
- [ ] Delete: confirmation dialog before DELETE call
- [ ] All states: loading skeleton, error state with retry, empty state with "Add Student" CTA

**Files**:
- `frontend/src/pages/coordinator/students/StudentList.tsx` — rewrite
- `frontend/src/pages/coordinator/students/CreateStudent.tsx` — rewrite with tabs
- `frontend/src/pages/coordinator/students/EditStudent.tsx` — rewrite
- `frontend/src/api/student.api.ts` — ensure all CRUD functions present

**Depends on**: STORY-020, STORY-023

---

#### STORY-031 — Faculty management (list, create, edit, delete)
**Status**: `Draft`

**Why**: Same as STORY-030 but for faculty. Existing pages exist but are inconsistent.

**Acceptance Criteria**:
- [ ] `/coordinator/faculty` — `DataTable` with columns: Name, Employee ID, Department, Expertise, Max Weekly Hours, Actions
- [ ] Search/filter by department, by name
- [ ] `/coordinator/faculty/new` — tabbed form: Manual + Bulk Upload
- [ ] `/coordinator/faculty/:id/edit` — pre-filled form
- [ ] Delete with confirmation dialog
- [ ] All states: loading, error, empty

**Files**:
- `frontend/src/pages/coordinator/faculty/FacultyList.tsx`
- `frontend/src/pages/coordinator/faculty/CreateFaculty.tsx`
- `frontend/src/pages/coordinator/faculty/EditFaculty.tsx`
- `frontend/src/api/faculty.api.ts`

**Depends on**: STORY-030

---

#### STORY-032 — Timetable management
**Status**: `Backend Done ✅ — Frontend integration not started`

**What was built** (on `feat/scheduler-refactor-ortools`, merge to main before starting frontend):

**Python solver** (`python-backend/app/schedule/`):
- `solver.py` — Google OR-Tools CP-SAT constraint solver. Hard constraints: no double-booking of faculty/rooms/sections. Soft constraints: spread classes across week, faculty daily/weekly load limits, preferred slots bonus, minimize room changes per day. 60s solve timeout. Returns `status: "optimal" | "feasible" | "infeasible"` with a descriptive `message` on failure.
- `models.py` — Pydantic models (`ScheduleRequest`, `ScheduleSolveResult`, `FacultyInput`, `SubjectInput`, etc.)
- `scheduler.py` — thin wrapper calling solver
- Endpoint: `POST /generate-schedule` in `python-backend/app/main.py`

**Node controller** (`main-backend/src/controllers/schedule/schedule.controller2.js`):
- `fetchData()` — fetches all departments/faculty/subjects/sections/rooms/timeslots from Prisma, maps to Python's schema
- `generateSchedule()` — calls Python, handles `infeasible` status explicitly (returns Python's `message` to client), persists result to `schedule_meta` + `schedule_details` via Prisma
- `getLatestSchedule()` — fetch schedule for a section
- `getAllSchedules()` — fetch all schedules grouped by department/year

**Route**: `POST /api/v1/schedule/generate` → `schedule.router.js` → `schedule.controller2.js`

**Frontend** (`ScheduleGenerator.tsx`):
- Shows `optimal` vs `feasible` in success state
- Shows Python's specific infeasibility reason when generation fails (e.g. "Insufficient valid slots for section CSE_2021_5 subject 42")
- Adds `credentials: 'include'` to fetch

**What remains for frontend integration**:
- [ ] Move `ScheduleGenerator.tsx` into new route `/coordinator/timetable` (after Phase 1 routing is done)
- [ ] Replace `useAuth` from old `AuthContext` with Zustand store (after STORY-010)
- [ ] Wire timetable viewer (`ScheduleViewer.tsx`, `ScheduleViewerComponent.tsx`) into the new route structure
- [ ] Replace Jotai `institutionIdAtom` usage in `ScheduleViewerComponent.tsx` with Zustand
- [ ] Reuse + refactor `ScheduleGrid.tsx` for the manual drag-and-drop schedule editor (existing component, just needs state management fix)

**Files to touch during frontend integration**:
- `frontend/src/pages/coordinator/timetable/TimetableManagement.tsx` — new, compose ScheduleGenerator + ScheduleViewer
- `frontend/src/pages/Protected/faculty/schedule/ScheduleGenerator.tsx` — replace AuthContext import
- `frontend/src/pages/Protected/faculty/schedule/ScheduleViewerComponent.tsx` — replace Jotai import
- `frontend/src/components/schedule/ScheduleGrid.tsx` — fix state management

**Depends on**: STORY-023, STORY-010 (for auth store), Phase 1 routing

---

#### STORY-033 — Room and building management
**Status**: `Draft`

**Why**: Routes exist but Rooms was missing from the coordinator sidebar. Buildings management exists but was unreachable.

**Acceptance Criteria**:
- [ ] `/coordinator/rooms` — DataTable: room number, building, capacity, type, status (available/maintenance)
- [ ] Create/edit room in a dialog (not a separate page)
- [ ] `/coordinator/buildings` — DataTable: building name, address, floors, total rooms
- [ ] Create/edit building in a dialog
- [ ] Both pages appear in coordinator sidebar under "Infrastructure"

**Files**:
- `frontend/src/pages/coordinator/rooms/RoomManagement.tsx` — refactor to use DataTable + dialog
- `frontend/src/pages/coordinator/buildings/BuildingManagement.tsx` — refactor

**Depends on**: STORY-020

---

### Phase 4 — Attendance System

> Gate: Phase 3 Done. Phase 4 delivers the core feature: attendance marking (manual + face recognition).

---

#### STORY-040 — Manual attendance marking (faculty)
**Status**: `Draft`

**Why**: Faculty can mark attendance from the class room page. Current implementation exists but has broken state and no error handling.

**Acceptance Criteria**:
- [ ] `/faculty/classes/:class_id` has an "Attendance" tab
- [ ] Attendance tab shows: list of enrolled students with Present/Absent toggle for each
- [ ] "Submit Attendance" button calls `POST /api/v1/attendance/mark` with `{ class_id, student_ids: [present ones], method: 'manual' }`
- [ ] After submit: show success toast + mark attendance tab as "submitted" (disabled re-submit unless coordinator overrides)
- [ ] Existing attendance shown pre-selected if re-viewing
- [ ] Uses `LoadingSkeleton` while loading student list

**Files**:
- `frontend/src/pages/faculty/classes/ClassRoom.tsx` — add attendance tab
- `frontend/src/components/shared/AttendanceMarker.tsx` — new reusable component
- `frontend/src/api/attendance.api.ts` — `markAttendance()` function

**Depends on**: STORY-022

---

#### STORY-041 — Face recognition attendance (async with job polling)
**Status**: `Done ✅ (async approach implemented directly, Phase 1 sync approach skipped)`

**What was built**: `AttendanceComponent.tsx` implements the full async flow:
1. User selects video file
2. Video uploaded to Cloudinary (existing `UploadOnCloudinary` service)
3. Cloudinary URL POSTed to `POST /api/v1/face/process-class` → returns `{ job_id }`
4. Frontend polls `GET /api/v1/face/job/:jobId` every 3 seconds
5. On `status: completed` → shows `processed_captures`, `processed_frames`, `students_marked_present`, `unmatched_faces`
6. On `status: failed` → shows error alert

**Note**: The "Confirm & Submit" step from the original plan was simplified — attendance is written automatically when the worker completes (no explicit confirmation needed).

**What still needs improvement** (not blocking, but worth noting):
- The component is used in the old `/p/protected` route structure; when routes are rebuilt (STORY-012), this component should be wired into `/faculty/classes/:class_id` attendance tab
- Error state could use the design system `ErrorState` component once STORY-020 is done

**Key files**:
- `frontend/src/components/AttendanceComponent.tsx`

**Depends on**: STORY-040 (for the tab integration), STORY-001, STORY-003, STORY-004

---

#### STORY-042 — Attendance dashboard (coordinator)
**Status**: `Draft`

**Why**: Coordinator needs to see attendance health across all sections. Current page exists but is minimal.

**Acceptance Criteria**:
- [ ] `/coordinator/attendance`:
  - `StatCard` row: Overall Attendance % | Students Below 75% | Classes Without Attendance Today
  - Filter: by department, by section, by date range
  - Table: section | class | date | present count | absent count | method (manual/facial)
- [ ] "Students Below 75%" card uses `variant="danger"`
- [ ] Export to Excel button (reuse existing XLSX functionality)

**Files**:
- `frontend/src/pages/coordinator/attendance/AttendanceDashboard.tsx` — rewrite

**Depends on**: STORY-040, STORY-023

---

#### STORY-043 — Student attendance view
**Status**: `Draft`

**Why**: Students can't currently see their own attendance summary anywhere obvious. It's the most-asked feature in academic systems.

**Acceptance Criteria**:
- [ ] `/student/attendance`:
  - Overall attendance % with color coding (green ≥75%, red <75%)
  - Per-subject breakdown: subject name | total classes | attended | % | status badge
  - Monthly calendar heatmap (optional, can be Phase 5)
- [ ] Warning banner if overall attendance < 75%: "You are at risk of shortage"

**Files**:
- `frontend/src/pages/student/attendance/AttendanceSummary.tsx` — new
- `frontend/src/api/attendance.api.ts` — `getStudentAttendanceSummary()`

**Depends on**: STORY-021

---

### Phase 5 — LMS Features

> Gate: Phase 4 Done. Phase 5 adds the learning management features: notes, resources, quizzes.

---

#### STORY-050 — Class room (notes + resources tab)
**Status**: `Draft`

**Why**: Faculty uploads notes and resources to a class. Students view them. Existing components exist but are scattered and inconsistently styled.

**Acceptance Criteria**:
- [ ] `/faculty/classes/:class_id` "Notes" tab:
  - Upload note (file or rich text)
  - List of existing notes: filename, uploaded date, download link
- [ ] `/faculty/classes/:class_id` "Resources" tab:
  - Upload resource file
  - List with type icon, filename, uploaded date, delete button
- [ ] `/student/classes/:class_id` shows Notes and Resources tabs (view only, no upload)
- [ ] All tabs use `LoadingSkeleton` while loading

**Files**:
- `frontend/src/pages/faculty/classes/ClassRoom.tsx` — add notes + resources tabs
- `frontend/src/pages/student/classes/ClassRoom.tsx` — new (view-only)
- `frontend/src/api/classes.api.ts` — `getNotes()`, `uploadNote()`, `getResources()`, `uploadResource()`

**Depends on**: STORY-040

---

#### STORY-051 — Quiz system (faculty create, student submit)
**Status**: `Done ✅`

**Why**: Faculty creates quizzes per class. Students submit answers. Existing quiz components exist but have broken state management and no student-side flow.

**Acceptance Criteria**:
- [ ] `/faculty/classes/:class_id/quiz`:
  - List existing quizzes for this class
  - "Create Quiz" button: add questions (MCQ + short answer), set time limit, publish
- [ ] Published quiz visible to students in `/student/classes/:class_id` "Quiz" tab
- [ ] Student can submit quiz once, cannot re-submit
- [ ] Faculty sees results: per-student score table

**Files**:
- `frontend/src/pages/faculty/classes/quiz/QuizManagement.tsx` — refactor
- `frontend/src/pages/student/classes/ClassRoom.tsx` — add quiz tab
- `frontend/src/api/quiz.api.ts` — new

**Depends on**: STORY-050

---

#### STORY-052 — Real-time emergency alerts (Socket.io)
**Status**: `Done ✅`

**Why**: Emergency alerts currently require page refresh to see. Socket.io gives instant delivery. Node already has the infrastructure (`bull` queue installed, `socket.io` is a natural add).

**Acceptance Criteria**:
- [ ] Node.js: Socket.io server initialized, rooms per institution_id
- [ ] When emergency is created: server emits `emergency:new` to institution room
- [ ] Frontend: `useEmergency` hook subscribes to Socket.io, sets Zustand state
- [ ] Emergency banner appears instantly without page refresh
- [ ] Coordinator/admin can dismiss emergency: emits `emergency:resolved` to room
- [ ] Socket connection authenticated with JWT (same token as HTTP requests)

**Files**:
- `main-backend/src/socket.js` — new
- `main-backend/src/index.js` — attach Socket.io to HTTP server
- `frontend/src/hooks/useEmergency.ts` — update to use Socket.io
- `frontend/src/lib/socket.ts` — new: Socket.io client singleton

**Depends on**: STORY-013

---

#### STORY-053 — Async face attendance with job polling (RabbitMQ)
**Status**: `Done ✅ (implemented with RabbitMQ, not BullMQ)`

**What was built**: Full async pipeline using RabbitMQ + in-memory job store.

**Architecture**:
- `publishFaceJob(FACE_RECOGNIZE_QUEUE, payload)` — enqueues job
- `createFaceJob({ jobId, jobType, payloadMeta })` — tracks in `Map`
- `consumeFaceResults(processFaceResultMessage)` — started on app boot via `faceBootstrap.js`
- When worker finishes: `updateFaceJob(jobId, { status: 'completed', result })` — job store updated
- Frontend polls `GET /api/v1/face/job/:jobId` every 3 seconds

**Job status lifecycle**: `queued → completed | failed`

**Note on in-memory job store**: `faceJobStore.js` uses a JavaScript `Map`. This means job status is lost on Node restart. For production, this should be persisted to Redis or PostgreSQL. Not blocking for portfolio use.

**Key files**:
- `main-backend/src/lib/faceQueue.js`
- `main-backend/src/lib/faceJobStore.js`
- `main-backend/src/lib/faceBootstrap.js`
- `main-backend/src/lib/faceResultProcessor.js`

**Depends on**: STORY-041

---

### Phase 6 — Polish

> Gate: Phase 5 Done. Phase 6 covers quality of life improvements.

---

#### STORY-060 — Dynamic page titles
**Status**: `Done ✅`

**Why**: All browser tabs currently show the same title. Makes multi-tab usage confusing.

**Acceptance Criteria**:
- [ ] `usePageTitle(title: string)` hook that sets `document.title = \`${title} — ClassEdgee\``
- [ ] Every page calls `usePageTitle` with a descriptive title
- [ ] Login page: "Sign In — ClassEdgee"
- [ ] Dashboard: "Dashboard — ClassEdgee"
- [ ] Class room: "{Subject Name} — ClassEdgee"

**Files**:
- `frontend/src/hooks/usePageTitle.ts` — new
- Every page component — add `usePageTitle` call

**Depends on**: STORY-020

---

#### STORY-061 — Low attendance email notifications
**Status**: `Done ✅`

**Why**: Coordinator needs to send warning emails to students below 75% attendance. Node already has `nodemailer` configured.

**Acceptance Criteria**:
- [ ] `/coordinator/attendance` has "Send Warnings" button in the "Students Below 75%" section
- [ ] Clicking shows a preview: list of students + their attendance %
- [ ] Confirm sends `POST /api/v1/attendance/low-attendance-emails` (endpoint already exists in Node)
- [ ] Success toast: "Sent {N} emails"

**Files**:
- `frontend/src/pages/coordinator/attendance/AttendanceDashboard.tsx` — add button
- `frontend/src/api/attendance.api.ts` — `sendLowAttendanceEmails()`

**Depends on**: STORY-042

---

#### STORY-062 — Profile pages (faculty + student)
**Status**: `Done ✅`

**Why**: Profile pages exist but are inconsistently styled and don't use the design system.

**Acceptance Criteria**:
- [ ] `/faculty/profile`: name, email, department, expertise tags (editable), profile photo upload to Cloudinary
- [ ] `/student/profile`: name, enrollment no, section, department, profile photo (editable)
- [ ] Both use `PageHeader` + form with React Hook Form + Zod
- [ ] Photo upload uses existing Cloudinary integration

**Files**:
- `frontend/src/pages/faculty/profile/ProfileSettings.tsx` — rewrite
- `frontend/src/pages/student/profile/StudentProfile.tsx` — rewrite

**Depends on**: STORY-020

---

## 10. Story Dependency Graph

```
Phase 0 — STATUS: Near complete
  STORY-001 (partial)   ← finish this first
  STORY-002 (superseded, skip)
  STORY-003 ✅
  STORY-004 ✅
  STORY-005 ✅
  STORY-041 ✅
  STORY-053 ✅

Phase 1 — STATUS: Not started (start here after STORY-001 is finished)
  STORY-010 ── STORY-011 ── STORY-012 ── STORY-013 ── STORY-014

Phase 2 — STATUS: Not started
  STORY-020 ──┬── STORY-021
              ├── STORY-022
              ├── STORY-023
              ├── STORY-024
              └── STORY-025 (also needs STORY-010, STORY-012)

Phase 3 — STATUS: Not started
  STORY-030 ── STORY-031
  STORY-032 (parallel to 030/031)
  STORY-033 (parallel to 030/031)

Phase 4 — STATUS: Partially done
  STORY-040 (not started) ──┬── STORY-041 ✅
                            ├── STORY-042 (not started)
                            └── STORY-043 (not started)

Phase 5 — STATUS: Partially done
  STORY-050 ── STORY-051 (not started)
  STORY-052 (not started, depends only on STORY-013)
  STORY-053 ✅

Phase 6 — STATUS: Not started
  STORY-060, STORY-061, STORY-062 (independent of each other)
```

### Recommended next task order

1. **Finish STORY-001** (30 min) — remove `fastapidomain` from `constant.ts`, clean dead comments
2. **STORY-010 → STORY-011 → STORY-012 → STORY-013 → STORY-014** — Auth + App Shell (the biggest UX unlock)
3. **STORY-020** — Design system (prerequisite for all dashboards)
4. **STORY-021 → 022 → 023 → 024 → 025** — Dashboards with real data
5. Then Phase 3 and remaining Phase 4 stories

---

## 11. What to Preserve from Current Codebase

Do not rewrite what works. The rebuild is architecture + frontend structure, not a full rewrite.

### Keep as-is (do not touch)
- **`frontend/src/components/ui/`** — all Shadcn components. Do not edit.
- **`main-backend/src/routes/`** — all Node API route files. Refactor if needed, not rewrite.
- **`main-backend/prisma/schema.prisma`** — Prisma schema is solid. Minor additions only.
- **`ml-worker/`** — entire directory. Complete, tested, working. Do not touch.
- **`main-backend/src/lib/faceQueue.js`** — complete, working.
- **`main-backend/src/lib/faceResultProcessor.js`** — complete, working.
- **`main-backend/src/lib/faceJobStore.js`** — complete, working.
- **`main-backend/src/lib/faceBootstrap.js`** — complete, working.
- **`main-backend/src/Router/face.router.js`** — complete, working.
- **`main-backend/src/controllers/face.controller.js`** — complete, working.
- **`main-backend/src/middlewares/requireAuth.js`** — reuse this in all new routes.
- **`docker-compose.face.yml`** — complete, working.
- **`frontend/src/components/schedule/`** — reuse ScheduleGrid and TimeTableGrid with light refactor.
- **`frontend/src/pages/coordinator/course/`** — CourseDashboard, SpecificCourseDashboard are functional, migrate to new route paths.

### Migrate (keep logic, update structure)
- All coordinator management pages — keep form logic, update layout to use design system
- `AttendanceComponent.tsx` — working, integrate into the new `/faculty/classes/:class_id` attendance tab once STORY-040 is done
- Quiz components — keep question builder logic, fix state management

### Delete
- `frontend/src/services/AuthContext.tsx`
- `frontend/src/store/` Redux slices (replace with Zustand + TanStack Query)
- `frontend/src/pages/Protected/` entire directory (replaced by role-namespaced pages)
- `frontend/src/layouts/MainLayout.tsx` (replaced by AppShell)
- `frontend/src/components/rough/` (scratch/prototype files)
- `frontend/src/lib/constant.ts` — `fastapidomain` export (STORY-001 remainder)
- All hardcoded mock data in dashboard components

---

## 12. Definition of Done

A story is **Done** when ALL of the following are true:

1. **All acceptance criteria checked** — every bullet point in the story's AC list is verifiable
2. **No hardcoded data** — no mock values, `// TODO`, or placeholder text visible to users
3. **Loading state** — every data-fetching section shows `LoadingSkeleton` while loading
4. **Error state** — every data-fetching section shows `ErrorState` with retry if the API call fails
5. **Empty state** — every list/table shows `EmptyState` with a helpful CTA when the list is empty
6. **TypeScript** — no `any` types introduced. All props fully typed.
7. **No console errors** — browser console is clean when using the feature normally
8. **Mobile usable** — the page is usable on a 375px wide viewport (not necessarily pixel-perfect, but functional)
9. **Navigation works** — the page is reachable from the sidebar and the URL is correct per the Route Map in Section 7
