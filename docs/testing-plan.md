# ClassEdgee — Comprehensive Testing Plan

> **Purpose of this document**: A complete, self-contained testing plan for ClassEdgee. Any AI model (or developer) picking this up in a fresh context should be able to read this document alone and know exactly what to build, in what order, and why. No prior conversation context is needed.
>
> **Companion document**: Read `docs/rebuild-plan.md` first to understand what has been built and what each feature does. This document only covers how to verify it works.

---

## Implementation Status (Last updated: 2026-04-05)

| Phase | Story | Title | Status |
|-------|-------|-------|--------|
| T0 | T-STORY-001 | Test tooling setup (Jest, Vitest, Playwright config) | Not started |
| T1 | T-STORY-002 | Prisma seed script with comprehensive test data | Not started |
| T2 | T-STORY-003 | Backend unit tests — attendance controller logic | Not started |
| T2 | T-STORY-004 | Backend unit tests — faculty controller delete fix | Not started |
| T2 | T-STORY-005 | Backend unit tests — schedule controller infeasibility | Not started |
| T3 | T-STORY-006 | Backend integration tests — auth routes | Not started |
| T3 | T-STORY-007 | Backend integration tests — attendance routes | Not started |
| T3 | T-STORY-008 | Backend integration tests — student and faculty CRUD | Not started |
| T4 | T-STORY-009 | Frontend unit tests — shared components | Not started |
| T4 | T-STORY-010 | Frontend unit tests — API layer transformations | Not started |
| T5 | T-STORY-011 | E2E — authentication flows (all 4 roles) | Not started |
| T5 | T-STORY-012 | E2E — student role journeys | Not started |
| T5 | T-STORY-013 | E2E — faculty role journeys | Not started |
| T5 | T-STORY-014 | E2E — coordinator role journeys | Not started |
| T5 | T-STORY-015 | E2E — admin role journeys | Not started |

---

## Table of Contents

1. [System Under Test](#1-system-under-test)
2. [What NOT to Test](#2-what-not-to-test)
3. [Tech Stack for Tests](#3-tech-stack-for-tests)
4. [Environment Setup](#4-environment-setup)
5. [Seed Data Specification](#5-seed-data-specification)
6. [Phases and Stories](#6-phases-and-stories)
7. [Story Dependency Graph](#7-story-dependency-graph)
8. [Running Tests](#8-running-tests)
9. [CI Integration](#9-ci-integration)

---

## 1. System Under Test

ClassEdgee is a three-service academic management system. Tests cover two of the three services — the Node.js backend and the React frontend. The Python `ml-worker` (RabbitMQ consumer for face recognition) is excluded because it requires GPU hardware and a running RabbitMQ instance; it is covered by manual testing only.

| Service | Directory | Test types |
|---------|-----------|------------|
| Node.js API | `main-backend/` | Unit, Integration |
| React Frontend | `frontend/` | Unit, E2E |
| Python ml-worker | `ml-worker/` | Manual only — excluded |

### Key features to test (implemented as of 2026-04-05)

| Feature | Where | Covered by |
|---------|-------|-----------|
| Login (all 4 roles) | `POST /api/v1/general/login` | Integration, E2E |
| Student CRUD | `main-backend/src/controllers/student.controller.js` | Integration, E2E |
| Faculty CRUD + delete fix | `main-backend/src/controllers/faculty.controller.js` | Unit, Integration |
| Manual attendance marking | `POST /api/v1/attendance/mark-attendance` | Integration, E2E |
| Coordinator attendance dashboard | `GET /api/v1/attendance/dashboard` | Unit, Integration |
| Student attendance summary | `GET /api/v1/attendance/student-summary/:studentId` | Unit, Integration |
| Room and building CRUD | `main-backend/src/Router/room.router.js` | Integration |
| Schedule generation (OR-Tools) | `POST /api/v1/schedule/generate` | Integration |
| AttendanceMarker component | `frontend/src/components/shared/AttendanceMarker.tsx` | Frontend unit |
| StatCard loading skeleton | `frontend/src/components/shared/StatCard.tsx` | Frontend unit |
| DataTable states | `frontend/src/components/shared/DataTable.tsx` | Frontend unit |
| All 4 role dashboards | `frontend/src/pages/*/Dashboard.tsx` | E2E |

---

## 2. What NOT to Test

Do not write tests for these — they are either library responsibility or stable enough to trust:

- **Shadcn/Radix UI components** in `frontend/src/components/ui/` — these are vendored library code
- **Prisma ORM** query syntax correctness — Prisma tests its own SQL generation
- **TanStack Query** caching, staleTime, retry behavior — it is a library
- **OR-Tools solver** constraint correctness — Google tests their own solver
- **React Router** navigation primitives — library responsibility
- **Zod** schema validation beyond what we own — Zod tests its own validators
- **bcrypt / JWT** correctness — crypto library responsibility

**What we DO test**: our controller logic, our API contract (request in → correct response out), our React component states, and full user journeys.

---

## 3. Tech Stack for Tests

| Layer | Tool | Config file |
|-------|------|-------------|
| Backend unit + integration | **Jest** with `--experimental-vm-modules` (ESM) | `main-backend/jest.config.js` |
| Backend HTTP layer | **Supertest** | Used inside Jest integration tests |
| Prisma mocking (unit tests) | **jest-mock-extended** + `prisma/__mocks__/index.js` | `main-backend/src/__mocks__/prisma.js` |
| Frontend unit | **Vitest** + **React Testing Library** | `frontend/vitest.config.ts` |
| Frontend DOM | **jsdom** | Vitest environment |
| E2E | **Playwright** | `frontend/playwright.config.ts` |
| Test database | PostgreSQL (`classedgee_test`) | `.env.test` in `main-backend/` |

### Install commands

```bash
# Backend
cd main-backend
npm install --save-dev jest @jest/globals supertest jest-mock-extended

# Frontend
cd frontend
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
npx playwright install chromium
```

---

## 4. Environment Setup

### Backend test environment (`main-backend/.env.test`)

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/classedgee_test
JWT_SECRET=test-secret-not-for-production
JWT_REFRESH_SECRET=test-refresh-secret
PORT=3001
NODE_ENV=test
```

### Create test database

```bash
createdb classedgee_test
cd main-backend
NODE_ENV=test npx prisma migrate deploy
NODE_ENV=test npx prisma db seed
```

### Frontend E2E environment (`frontend/.env.test`)

```env
VITE_API_URL=http://localhost:3001
```

The E2E tests expect the backend running on port 3001 (test port) with seeded data.

---

## 5. Seed Data Specification

> **This is the most important section.** All E2E tests depend on seed data existing. Integration tests also rely on it. The seed script must be idempotent — safe to run multiple times.

**File**: `main-backend/prisma/seed.js`

The seed script must create the full entity graph below. IDs are fixed (use `upsert`) so tests can reference them by known values.

### Entity graph

```
Institution (id: 1)
  name: "Testville Institute of Technology"
  ├── Department: Computer Science (id: 1)
  ├── Department: Electronics (id: 2)
  ├── Building: Academic Block A (id: 1, floors: 4)
  │     ├── Room: A-101 (classroom, cap 60, floor 1)
  │     ├── Room: A-102 (classroom, cap 60, floor 1)
  │     ├── Room: A-201 (lab, cap 40, floor 2)
  │     └── Room: A-301 (seminar_hall, cap 100, floor 3)
  ├── Building: Tech Block B (id: 2, floors: 3)
  │     ├── Room: B-101 (classroom, cap 50, floor 1)
  │     └── Room: B-201 (lab, cap 30, floor 2)
  ├── Users
  │     ├── admin@test.com     / Test@1234  role: admin
  │     ├── coord@test.com     / Test@1234  role: coordinator
  │     ├── faculty1@test.com  / Test@1234  role: faculty  (CS dept)
  │     ├── faculty2@test.com  / Test@1234  role: faculty  (CS dept)
  │     ├── faculty3@test.com  / Test@1234  role: faculty  (Electronics dept)
  │     └── 20 students        / Test@1234  role: student
  │           ├── 10 in Section CS-A (semester 3, batch 2023)
  │           └── 10 in Section EL-A (semester 3, batch 2023)
  ├── Sections
  │     ├── CS-A (department: CS, semester: 3)
  │     └── EL-A (department: Electronics, semester: 3)
  ├── Courses
  │     ├── Data Structures (CS, semester 3)
  │     ├── Database Systems (CS, semester 3)
  │     ├── Algorithms (CS, semester 3)
  │     ├── Circuit Theory (EL, semester 3)
  │     └── Digital Electronics (EL, semester 3)
  ├── Timeslots (Mon–Fri, periods 1–7, 9:00–17:00)
  ├── Classes (60 total — past 30 days, 2 per day per section)
  │     └── attendance records:
  │           ├── Students s1–s7 of CS-A: attendance 80–95% (healthy)
  │           ├── Students s8–s10 of CS-A: attendance 55–70% (at-risk)
  │           └── All EL-A students: 75–90% (healthy)
  ├── Notes (3 per course = 15 total)
  └── Resources (2 per course = 10 total)
```

### Seed credentials reference (for tests to import)

```js
// main-backend/prisma/seed-credentials.js
export const TEST_USERS = {
  admin:       { email: "admin@test.com",    password: "Test@1234", role: "admin" },
  coordinator: { email: "coord@test.com",    password: "Test@1234", role: "coordinator" },
  faculty1:    { email: "faculty1@test.com", password: "Test@1234", role: "faculty" },
  faculty2:    { email: "faculty2@test.com", password: "Test@1234", role: "faculty" },
  student_ok:  { email: "student1@test.com", password: "Test@1234", role: "student" },  // 85% attendance
  student_risk:{ email: "student9@test.com", password: "Test@1234", role: "student" },  // 62% attendance
};

export const TEST_IDS = {
  institutionId: 1,
  csDepartmentId: 1,
  elDepartmentId: 2,
  csSection: { id: 1, name: "CS-A" },
  elSection: { id: 2, name: "EL-A" },
  roomA101: { id: 1, room_number: "A-101" },
};
```

---

## 6. Phases and Stories

---

### Phase T0 — Test Tooling Setup

> Gate: Nothing. This is the first thing to do.
> Purpose: Wire Jest, Vitest, and Playwright so subsequent stories have a working harness.

---

#### T-STORY-001 — Test tooling setup

**Status**: `Draft`

**Why**: Without working config files, no test can be written or run. This story gets all three test runners configured and able to run a trivial smoke test.

**Acceptance Criteria**:
- [ ] `main-backend/jest.config.js` exists — configured for ESM (`--experimental-vm-modules`), `testEnvironment: node`, reads `.env.test` via `dotenv`
- [ ] Running `cd main-backend && npm test` exits 0 with at least one passing smoke test
- [ ] `frontend/vitest.config.ts` exists — `environment: 'jsdom'`, resolves `@/` alias to `./src/`
- [ ] Running `cd frontend && npx vitest run` exits 0 with at least one passing smoke test
- [ ] `frontend/playwright.config.ts` exists — `baseURL: 'http://localhost:5173'`, browser: chromium, uses `frontend/.env.test`
- [ ] Running `cd frontend && npx playwright test` does not crash (may have 0 specs at this point)
- [ ] `main-backend/src/__mocks__/prisma.js` exists — exports a `jest-mock-extended` mock of PrismaClient for use in unit tests

**Files**:
- `main-backend/jest.config.js` — new
- `main-backend/src/__mocks__/prisma.js` — new
- `frontend/vitest.config.ts` — new
- `frontend/playwright.config.ts` — new
- `main-backend/package.json` — add `"test": "node --experimental-vm-modules node_modules/.bin/jest"` script
- `frontend/package.json` — add `"test:unit": "vitest run"` and `"test:e2e": "playwright test"` scripts

**Depends on**: Nothing

---

### Phase T1 — Seed Data

> Gate: T-STORY-001 done (Jest/Vitest/Playwright configured).
> Purpose: All subsequent tests need realistic data to run against.

---

#### T-STORY-002 — Prisma seed script

**Status**: `Draft`

**Why**: E2E tests are meaningless without real data. Integration tests need a predictable DB state. The seed must be idempotent (safe to re-run) and must create the full entity graph from Section 5 of this document.

**Acceptance Criteria**:
- [ ] `main-backend/prisma/seed.js` exists and runs to completion via `npx prisma db seed`
- [ ] Uses `upsert` throughout — re-running the seed does not create duplicates
- [ ] Creates all entities in Section 5: 1 institution, 2 departments, 2 buildings, 6 rooms, 5 users (admin/coord/3 faculty), 20 students, 2 sections, 5 courses, timeslots, 60 past classes, attendance records, 15 notes, 10 resources
- [ ] `main-backend/prisma/seed-credentials.js` exported as described in Section 5 — used by tests to avoid hardcoding
- [ ] Attendance distribution is as specified: students 1–7 of CS-A have 80–95% overall; students 8–10 have 55–70% (below 75% threshold)
- [ ] Passwords are bcrypt-hashed (salt rounds 10) matching `Test@1234`
- [ ] `main-backend/package.json` has `"prisma": { "seed": "node prisma/seed.js" }`
- [ ] Running seed on a clean test DB produces no errors in console

**Files**:
- `main-backend/prisma/seed.js` — new
- `main-backend/prisma/seed-credentials.js` — new
- `main-backend/package.json` — add prisma seed config

**Depends on**: T-STORY-001

---

### Phase T2 — Backend Unit Tests

> Gate: T-STORY-001 done. Unit tests mock Prisma — they do NOT need the test database.
> Purpose: Verify pure controller logic in isolation. Fast (<5s total).

---

#### T-STORY-003 — Backend unit tests — attendance controller

**Status**: `Draft`

**Why**: Attendance has the most complex business logic in the codebase — date bound calculation, subject aggregation, at-risk thresholds. These are pure functions that must be verified in isolation.

**File under test**: `main-backend/src/controllers/attendance.controller.js`

**Acceptance Criteria**:

`getCoordinatorAttendanceDashboard`:
- [ ] `toDateBounds(undefined, undefined)` returns today as endDate and 30 days ago as startDate
- [ ] `toDateBounds("2026-01-01", "invalid-date")` returns `null`
- [ ] Valid `start_date` / `end_date` query params produce a Prisma `where` clause with correct `gte` / `lte` values
- [ ] `department_id=abc` (non-numeric) returns 400

`getStudentAttendanceSummary`:
- [ ] A student with 8 present out of 10 classes for one subject gets `attendancePercentage: 80.00`, `status: "good"`
- [ ] A student with 6 present out of 10 classes gets `attendancePercentage: 60.00`, `status: "at-risk"`
- [ ] Overall percentage aggregates correctly across multiple subjects
- [ ] `atRisk: true` when overall < 75, `atRisk: false` when >= 75
- [ ] Student with zero attendance records returns `{ overallPercentage: 0, totalClasses: 0, subjects: [], atRisk: true }`
- [ ] Subjects are sorted alphabetically by name

`markAttendance` (via mocked Prisma):
- [ ] Returns 400 if `class_id` is missing
- [ ] Returns 400 if `attendance_data` is empty array

**Test file**: `main-backend/src/__tests__/unit/attendance.controller.test.js`

**Depends on**: T-STORY-001

---

#### T-STORY-004 — Backend unit tests — faculty controller delete

**Status**: `Draft`

**Why**: The `deletefaculty` controller was previously broken (used MongoDB model on Postgres). It was fixed in Phase 3. The fix has two code paths (numeric userId vs. college_uid string) that must both be verified.

**File under test**: `main-backend/src/controllers/faculty.controller.js` — `deletefaculty` function

**Acceptance Criteria**:
- [ ] When `req.params.id = "123"` (numeric string): looks up `faculty` by `user_id: 123` directly, does not query `users` first
- [ ] When `req.params.id = "EMP-001"` (non-numeric): queries `users` table by `college_uid: "EMP-001"` to resolve userId first
- [ ] When faculty not found by userId: returns 404 `{ success: false, message: "faculty not found" }`
- [ ] When user not found by college_uid: returns 404
- [ ] Successful delete runs a Prisma `$transaction` that deletes `faculty` records then `users` record
- [ ] Successful delete returns 200 `{ message: "faculty deleted successfully" }`

**Test file**: `main-backend/src/__tests__/unit/faculty.controller.test.js`

**Depends on**: T-STORY-001

---

#### T-STORY-005 — Backend unit tests — schedule controller infeasibility

**Status**: `Draft`

**Why**: The schedule controller (STORY-032) added infeasibility handling that was previously missing — a `422` response when the OR-Tools solver returns `status: "infeasible"`. This logic must be verified without calling the Python solver.

**File under test**: `main-backend/src/controllers/schedule/schedule.controller2.js`

**Acceptance Criteria**:
- [ ] When mocked Python axios response is `{ status: "infeasible", message: "No room available" }`: controller returns HTTP 422 with `{ success: false, solver_status: "infeasible", message: "No room available" }`
- [ ] When mocked response is `{ status: "infeasible" }` (no message): returns 422 with a default fallback message string
- [ ] When mocked response is `{ status: "feasible", schedule: [] }` (empty schedule): returns 422 with a different "empty schedule" message
- [ ] When mocked response is `{ status: "optimal", schedule: [...] }`: returns 200 with schedule data

**Test file**: `main-backend/src/__tests__/unit/schedule.controller.test.js`

**Depends on**: T-STORY-001

---

### Phase T3 — Backend Integration Tests

> Gate: T-STORY-002 done (seed data exists). These tests hit a real PostgreSQL test database.
> Purpose: Verify that the full request → middleware → controller → Prisma → DB → response pipeline works correctly.
> Setup: Each test file should call `npx prisma db seed` in a `beforeAll` and truncate relevant tables in `afterEach` if needed to keep tests isolated.

---

#### T-STORY-006 — Backend integration tests — auth routes

**Status**: `Draft`

**Why**: Auth is the entry point for every user journey. If login is broken, nothing else works.

**Routes under test**: `POST /api/v1/general/login`

**Acceptance Criteria**:
- [ ] `POST /api/v1/general/login` with `{ email: "admin@test.com", password: "Test@1234", role: "admin" }` returns 200, body contains `{ token, user: { role: "admin" } }`
- [ ] Same for coordinator, faculty, student roles
- [ ] Wrong password returns 401
- [ ] Unknown email returns 401 (must not expose whether email exists)
- [ ] `role` field mismatch (email is faculty, role sent as student) returns 401 or 403
- [ ] Response token is a valid JWT decodable with `JWT_SECRET` from `.env.test`
- [ ] Token payload contains `user_id`, `role`, `institution_id`

**Test file**: `main-backend/src/__tests__/integration/auth.test.js`

**Depends on**: T-STORY-001, T-STORY-002

---

#### T-STORY-007 — Backend integration tests — attendance routes

**Status**: `Draft`

**Why**: Attendance is the most business-critical feature. The integration test verifies the full DB round-trip: mark attendance → read it back.

**Routes under test**:
- `POST /api/v1/attendance/mark-attendance`
- `GET /api/v1/attendance/history/:classId`
- `GET /api/v1/attendance/student-summary/:studentId`
- `GET /api/v1/attendance/dashboard`
- `GET /api/v1/attendance/low-attendance-report`

**Acceptance Criteria**:

`mark-attendance`:
- [ ] Authenticated as faculty1: marks 10 students present/absent for a seeded classId → 200
- [ ] `GET /history/:classId` after marking returns records matching what was submitted
- [ ] Submitting again (same classId, same day) updates existing records (no duplicates in DB)
- [ ] Missing `class_id` returns 400
- [ ] Missing `attendance_data` returns 400

`student-summary/:studentId`:
- [ ] Returns correct `overallPercentage` for `student_ok` (seeded as 85% range)
- [ ] Returns `atRisk: false` for healthy student
- [ ] Returns `atRisk: true` for `student_risk` (seeded as 62% range)
- [ ] Returns `subjects` array with one entry per course the student has classes in

`dashboard`:
- [ ] No filters → returns all records in default 30-day window
- [ ] `?department_id=1` → only records from CS department sections
- [ ] `?start_date=2099-01-01&end_date=2099-01-02` → returns empty records (no classes that far future)
- [ ] `?start_date=invalid` → returns 400

`low-attendance-report`:
- [ ] `?threshold=75` → returns only students below 75% (seeded: students 8–10 of CS-A)
- [ ] `?threshold=100` → returns all students (everyone is below 100%)

**Test file**: `main-backend/src/__tests__/integration/attendance.test.js`

**Depends on**: T-STORY-001, T-STORY-002, T-STORY-006 (for auth token helper)

---

#### T-STORY-008 — Backend integration tests — student and faculty CRUD

**Status**: `Draft`

**Why**: CRUD routes are the most-used coordinator workflows. The integration test verifies the Prisma transaction (both `users` and `students`/`faculty` records created atomically).

**Routes under test**:
- `POST /api/v1/student/createstudent`
- `PUT /api/v1/student/edit/:userId`
- `DELETE /api/v1/student/delete-student/:userId`
- `GET /api/v1/student/list-of-student`
- `DELETE /api/v1/faculty/delete-faculty/:id`

**Acceptance Criteria**:

Student create:
- [ ] Valid payload → 200, DB has new row in `users` AND `students` tables
- [ ] Duplicate email → error (DB constraint violation propagated gracefully, not 500)
- [ ] Missing required field (`firstName`) → error

Student list:
- [ ] `?page=1&pageSize=5` → returns exactly 5 records, `pagination.total` matches seed count
- [ ] `?search=student1` → filters by name
- [ ] `?department=Computer+Science` → only CS students

Student delete:
- [ ] Deletes both `users` and `students` rows in one call
- [ ] Unknown userId → 404

Faculty delete:
- [ ] `DELETE /api/v1/faculty/delete-faculty/faculty1_userId` → 200, user and faculty rows removed
- [ ] `DELETE /api/v1/faculty/delete-faculty/EMP-001` (college_uid) → also works
- [ ] Unknown id → 404

**Test file**: `main-backend/src/__tests__/integration/crud.test.js`

**Depends on**: T-STORY-001, T-STORY-002, T-STORY-006

---

### Phase T4 — Frontend Unit Tests

> Gate: T-STORY-001 done. These tests do NOT need a running backend — they mock API calls.
> Purpose: Verify component rendering states and pure utility logic.

---

#### T-STORY-009 — Frontend unit tests — shared components

**Status**: `Draft`

**Why**: The 6 shared components (`StatCard`, `DataTable`, `EmptyState`, `ErrorState`, `LoadingSkeleton`, `AttendanceMarker`) are used across every page. A bug in them is high-blast-radius.

**Files under test**: `frontend/src/components/shared/`

**Acceptance Criteria**:

`StatCard`:
- [ ] When `value` is `undefined`: renders `LoadingSkeleton` (stat variant), not the value text
- [ ] When `value` is `0`: renders `"0"`, not skeleton
- [ ] When `variant="danger"`: card has `border-red-300` class
- [ ] When `variant="success"`: card has `border-green-300` class
- [ ] When `trend` is positive number: renders `TrendingUp` icon with `+` prefix
- [ ] When `trend` is negative: renders `TrendingDown`

`DataTable`:
- [ ] `isLoading=true` → renders `LoadingSkeleton` with `variant="table"`
- [ ] `error` set → renders `ErrorState` with `onRetry` button
- [ ] `data=[]` and no error and not loading → renders `EmptyState`
- [ ] `data=[...]` → renders rows, one per item
- [ ] `onRowClick` provided → row has `cursor-pointer` class

`EmptyState`:
- [ ] Renders `title` and `description` text
- [ ] `action` prop → renders action element inside component

`ErrorState`:
- [ ] Renders `message` text
- [ ] `onRetry` provided → renders "Retry" button, click calls `onRetry`
- [ ] `onRetry` not provided → no button rendered

`AttendanceMarker`:
- [ ] `isLoading=true` on studentsQuery → renders `LoadingSkeleton`
- [ ] Empty section (no students) → renders `EmptyState` with "No enrolled students"
- [ ] `todaySubmitted=true` → all Present/Absent buttons disabled, submit button disabled
- [ ] `todaySubmitted=false` → buttons enabled
- [ ] Clicking "Absent" for a student sets their status to absent (reflected in badge counts)
- [ ] Clicking "Present" toggles back
- [ ] Submit button click calls `markManualAttendance` mutation

**Test file**: `frontend/src/__tests__/shared-components.test.tsx`

**Depends on**: T-STORY-001

---

#### T-STORY-010 — Frontend unit tests — API layer transformations

**Status**: `Draft`

**Why**: Several API functions in `frontend/src/api/` do non-trivial data transformation before returning to the component. These should be tested in isolation without mounting a component.

**Files under test**: `frontend/src/api/attendance.api.ts`, `frontend/src/api/dashboard.api.ts`

**Acceptance Criteria**:

`getStudentAttendanceSummary` (wraps `getStudentAttendanceDetail`):
- [ ] When `overallPercentage` is 74: returns `{ atRisk: true }`
- [ ] When `overallPercentage` is 75: returns `{ atRisk: false }`
- [ ] When API returns `null` for `summary`: returns safe defaults `{ overallPercentage: 0, totalClasses: 0 }`

`getCoordinatorAttendanceDashboard`:
- [ ] Maps `stats.overallAttendancePercentage` to a number (handles string from backend)
- [ ] When `records` is missing from response: returns `{ records: [] }`

`getFacultyDashboardSummary`:
- [ ] `sameDay` helper: two Date objects on same calendar day return `true`
- [ ] `sameDay` helper: dates on different days return `false`
- [ ] `pendingAttendance` is `max(todayClasses - markedCount, 0)` — never negative

`getCoordinatorStudents`:
- [ ] When `pagination` is missing from response: returns fallback pagination object
- [ ] When `data` is not an array: returns `{ data: [] }`

**Test file**: `frontend/src/__tests__/api-layer.test.ts`

**Depends on**: T-STORY-001

---

### Phase T5 — E2E Tests (Playwright)

> Gate: T-STORY-002 done (seed data). These tests need both the backend (port 3001) and frontend (port 5173) running.
> Purpose: Verify complete user journeys from the browser.
>
> **Before running**: `cd main-backend && NODE_ENV=test npm start` then `cd frontend && npm run dev`
>
> **Credential helper**: Import `TEST_USERS` from `main-backend/prisma/seed-credentials.js` — do not hardcode passwords in specs.

---

#### T-STORY-011 — E2E — authentication flows

**Status**: `Draft`

**Why**: Login is the entry point. If role routing or token storage is broken, every subsequent test fails.

**File**: `frontend/e2e/auth.spec.ts`

**Acceptance Criteria**:
- [ ] Visit `/auth/login`, fill admin credentials → lands on `/admin` dashboard, sidebar shows admin nav items
- [ ] Coordinator credentials → lands on `/coordinator` dashboard
- [ ] Faculty credentials → lands on `/faculty` dashboard
- [ ] Student credentials → lands on `/student` dashboard
- [ ] Wrong password → inline error message visible below form, no redirect
- [ ] After successful login, visit `/auth/login` again → redirects to role root (already logged in)
- [ ] Click logout from user menu → redirects to `/auth/login`, localStorage cleared
- [ ] After logout, visit `/admin` directly → redirects to `/auth/login`
- [ ] Old route `/auth/signin` → redirects to `/auth/login` (backward compat)

**Depends on**: T-STORY-001, T-STORY-002

---

#### T-STORY-012 — E2E — student role journeys

**Status**: `Draft`

**File**: `frontend/e2e/student.spec.ts`

**Acceptance Criteria**:

Dashboard (`/student`):
- [ ] "Enrolled Courses" stat card shows a non-zero number
- [ ] "Attendance" stat card shows a percentage value
- [ ] For `student_risk` (62% attendance): attendance stat card has red/danger styling
- [ ] For `student_ok` (85% attendance): attendance stat card has green/success styling
- [ ] "Today's Classes" card shows classes if any scheduled for today, or empty state

Attendance (`/student/attendance`):
- [ ] Table renders with columns: Subject, Total Classes, Attended, Attendance %, Status
- [ ] For `student_risk`: red "At Risk" alert banner is visible at top of page
- [ ] For `student_ok`: no alert banner
- [ ] Each subject row shows correct values (no NaN, no undefined)

Navigation:
- [ ] All sidebar links navigate to correct pages without 404
- [ ] Trying to access `/coordinator` while logged in as student → redirects to `/student`

**Depends on**: T-STORY-011

---

#### T-STORY-013 — E2E — faculty role journeys

**Status**: `Draft`

**File**: `frontend/e2e/faculty.spec.ts`

**Acceptance Criteria**:

Dashboard (`/faculty`):
- [ ] 4 stat cards visible: Faculty ID, Total Classes, Classes Today, Pending Attendance
- [ ] Recent classes table renders (may be empty if no classes today)

Class room — attendance tab:
- [ ] Navigate to a seeded class via `/faculty/classes/:class_id`
- [ ] Click "Attendance" tab
- [ ] `AttendanceMarker` renders with list of students from the section
- [ ] Click "Absent" for student 1 → badge shows "Absent: 1"
- [ ] Click "Submit Attendance" → success toast appears
- [ ] Buttons lock after submission (disabled)
- [ ] Revisiting the page: attendance is pre-filled from history

Class room — notes tab:
- [ ] Click "Notes" tab → "No notes available" empty state OR notes list
- [ ] Click "Add Note" → modal opens
- [ ] Fill title and content, submit → note appears in grid
- [ ] Note shows title, content, tags

Class room — resources tab:
- [ ] Click "Resources" tab → empty state OR resources list
- [ ] Click "Add Resource" → modal opens
- [ ] Upload a small `.txt` file, fill title → resource card appears with download button
- [ ] Click delete on a resource → resource removed from list

**Depends on**: T-STORY-011

---

#### T-STORY-014 — E2E — coordinator role journeys

**Status**: `Draft`

**File**: `frontend/e2e/coordinator.spec.ts`

**Acceptance Criteria**:

Student management (`/coordinator/students`):
- [ ] Table loads with seeded students (20 total)
- [ ] "Total Students" stat card shows 20
- [ ] Search "student1" → table filters to matching rows
- [ ] Filter by department "Computer Science" → only CS students shown
- [ ] Click "Add Student" → navigates to `/coordinator/students/new`
- [ ] Fill manual form with valid data, submit → redirects to list, new student visible
- [ ] Click "Edit" on a student → pre-filled form, update name, save → list shows updated name
- [ ] Click "Delete" → confirmation dialog appears, confirm → student removed from list

Faculty management (`/coordinator/faculty`):
- [ ] Table loads with 3 seeded faculty members
- [ ] Filter by designation "Professor" → filters correctly
- [ ] Delete faculty → confirmation dialog → removed

Attendance dashboard (`/coordinator/attendance`):
- [ ] Page loads with 4 stat cards and attendance table
- [ ] "Students Below Threshold" card shows 3 (seeded at-risk students)
- [ ] Filter by department "Computer Science" → table updates
- [ ] Change date range to last 7 days → table updates
- [ ] Click "Export Excel" → file download triggered (check `page.on('download')`)
- [ ] "Send Warnings" button enabled when at-risk students exist

Timetable (`/coordinator/timetable`):
- [ ] 3 tabs visible: View Schedule, Generate Schedule, Manual Scheduler
- [ ] View Schedule tab loads without error

Rooms (`/coordinator/rooms`):
- [ ] Table shows seeded rooms (6 rooms)
- [ ] Click "Add Room" → dialog opens
- [ ] Fill form (room number, type, capacity) → submit → new room in table
- [ ] Change status dropdown on a room → status badge updates

Buildings (`/coordinator/buildings`):
- [ ] Table shows 2 seeded buildings with floor count and room count

**Depends on**: T-STORY-011

---

#### T-STORY-015 — E2E — admin role journeys

**Status**: `Draft`

**File**: `frontend/e2e/admin.spec.ts`

**Acceptance Criteria**:

Dashboard (`/admin`):
- [ ] 4 stat cards visible: Total Students, Total Faculty, Coordinators, Rooms
- [ ] Values match seed data (20 students, 3 faculty, 1 coordinator, 6 rooms)
- [ ] Coordinators table renders with seeded coordinator

Coordinators list (`/admin/coordinators`):
- [ ] Table loads, shows coordinator@test.com

Navigation guards:
- [ ] Trying to navigate to `/coordinator` while logged in as admin → redirects to `/admin`
- [ ] Trying to navigate to `/student` while logged in as admin → redirects to `/admin`

**Depends on**: T-STORY-011

---

## 7. Story Dependency Graph

```
T-STORY-001 (tooling)
    │
    ├── T-STORY-002 (seed data)
    │       │
    │       ├── T-STORY-006 (integration: auth)
    │       │       │
    │       │       ├── T-STORY-007 (integration: attendance)
    │       │       └── T-STORY-008 (integration: CRUD)
    │       │
    │       └── T-STORY-011 (E2E: auth)
    │               │
    │               ├── T-STORY-012 (E2E: student)
    │               ├── T-STORY-013 (E2E: faculty)
    │               ├── T-STORY-014 (E2E: coordinator)
    │               └── T-STORY-015 (E2E: admin)
    │
    ├── T-STORY-003 (unit: attendance controller)  ← no DB needed
    ├── T-STORY-004 (unit: faculty controller)     ← no DB needed
    ├── T-STORY-005 (unit: schedule controller)    ← no DB needed
    ├── T-STORY-009 (frontend unit: components)    ← no DB needed
    └── T-STORY-010 (frontend unit: API layer)     ← no DB needed
```

**Recommended execution order:**
1. T-STORY-001 — tooling first, unblocks everything
2. T-STORY-002 — seed data, unblocks all integration + E2E
3. T-STORY-003, 004, 005, 009, 010 — unit tests (can run in parallel, no DB)
4. T-STORY-006 — auth integration (prerequisite for 007, 008)
5. T-STORY-007, 008 — integration tests (can run in parallel)
6. T-STORY-011 — E2E auth (prerequisite for all other E2E)
7. T-STORY-012, 013, 014, 015 — E2E role specs (can run in parallel)

---

## 8. Running Tests

### All backend unit tests (fast, no DB)
```bash
cd main-backend
npm test -- --testPathPattern=unit
```

### All backend integration tests (needs test DB + seed)
```bash
cd main-backend
NODE_ENV=test npx prisma db seed
npm test -- --testPathPattern=integration
```

### All frontend unit tests
```bash
cd frontend
npx vitest run
```

### E2E tests (needs both servers running)
```bash
# Terminal 1 — backend
cd main-backend && NODE_ENV=test npm start

# Terminal 2 — frontend
cd frontend && npm run dev

# Terminal 3 — run specs
cd frontend && npx playwright test
```

### Full suite (sequential)
```bash
cd main-backend && NODE_ENV=test npx prisma db seed && npm test
cd frontend && npx vitest run
cd frontend && npx playwright test
```

---

## 9. CI Integration

When adding CI (GitHub Actions), the job order should be:

```yaml
jobs:
  backend-unit:
    # No DB, fast
    run: cd main-backend && npm test -- --testPathPattern=unit

  backend-integration:
    needs: backend-unit
    services:
      postgres:
        image: postgres:15
        env: { POSTGRES_DB: classedgee_test, POSTGRES_PASSWORD: postgres }
    run: |
      cd main-backend
      NODE_ENV=test npx prisma migrate deploy
      NODE_ENV=test npx prisma db seed
      npm test -- --testPathPattern=integration

  frontend-unit:
    # No backend needed
    run: cd frontend && npx vitest run

  e2e:
    needs: [backend-integration, frontend-unit]
    run: |
      cd main-backend && NODE_ENV=test npm start &
      cd frontend && npm run dev &
      cd frontend && npx playwright test
```

---

## Definition of Done (per story)

A test story is **Done** when:
- [ ] All listed acceptance criteria have a passing test assertion
- [ ] `npm test` / `npx vitest run` / `npx playwright test` exits with code 0
- [ ] No test uses `setTimeout`, `sleep`, or arbitrary delays — use `waitFor` or Playwright `expect` with retry
- [ ] No test hardcodes passwords or IDs — all test data imported from `seed-credentials.js`
- [ ] Tests are independent — order of execution does not affect results
