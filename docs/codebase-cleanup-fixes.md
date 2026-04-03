# Codebase Cleanup & Quality Fixes

## Status: Draft
## Date: 2026-04-04

---

## A. Data Layer Problems

### 1. Missing Database Indexes on Hot Columns

**Impact**: Queries slow down 10-100x as data grows. Attendance history, faculty class lists, and section lookups all do full table scans.

**Missing indexes**:
```
attendance.student_id        — queried on every attendance history call
classes.faculty_id           — queried on every "get faculty classes" call
classes.section_id           — queried on every section-based class lookup
faculty.department_id        — queried on department faculty lists
quiz_responses.student_id    — queried on quiz result lookups
```

**Fix**: Add to `prisma/schema.prisma`:
```prisma
model attendance {
  @@index([student_id])
  @@index([class_id, date])
}

model classes {
  @@index([faculty_id])
  @@index([section_id])
}

model faculty {
  @@index([department_id])
}

model quiz_responses {
  @@index([student_id])
}
```

---

### 2. N+1 Query in Schedule Controller

**File**: `src/controllers/schedule/mannualSchedule.controller.js` (lines 125-143)

**Problem**: `Promise.all()` with `schedule_details.findFirst()` inside a loop for each faculty member. If there are 50 faculty, this fires 50 separate DB queries.

**Fix**: Replace with a single `findMany()`:
```javascript
const conflicts = await prisma.schedule_details.findMany({
    where: {
        faculty_id: { in: facultyIds },
        timeslot_id: slotId,
        day_of_week: dayOfWeek,
    }
});
```

---

### 3. Two ORMs Hitting the Same Database

**Problem**: Node uses Prisma ORM. Python uses raw `psycopg2` SQL strings. Both write to the same PostgreSQL instance. No coordinated transactions, no shared validation, no consistent error handling.

**Current risk**: A Prisma migration could break Python's raw SQL queries silently.

**Fix**: Resolved by the face attendance redesign — Python ML Worker will not access the DB at all. For the bulk upload routes (`/faculty/process-faculty-excel`, `/student/process-student-excel`), migrate DB writes from Python into Node. Python parses the Excel and returns structured JSON; Node does the inserts via Prisma.

---

### 4. No Migration Strategy

**Problem**: Project uses `npx prisma db push` which is destructive — it can drop columns/tables to match the schema. No migration history, no rollback capability.

**Fix**:
1. Switch to `npx prisma migrate dev` for development (creates migration files)
2. Use `npx prisma migrate deploy` for production
3. Commit `prisma/migrations/` folder to git
4. Document rollback: `npx prisma migrate resolve --rolled-back <migration_name>`

---

### 5. No Seed Data

**Problem**: New developers get an empty database. Cannot test without manually creating an institution, departments, faculty, students, sections, etc. through the UI.

**Fix**: Create `prisma/seed.ts` with:
- 1 institution
- 2 departments
- 1 coordinator, 3 faculty, 10 students
- 2 sections with students assigned
- 1 course, 1 subject, timeslots
- Sample attendance records

Add to `package.json`:
```json
"prisma": {
  "seed": "ts-node prisma/seed.ts"
}
```

---

## B. Code Quality / Dead Weight

### 6. Mongoose Schemas (Dead Code)

**Files**:
```
src/models/supremeprofile.schema.js
src/models/coordinatorprofile.schema.js
src/models/studentprofile.schema.js
src/models/facultyprofile.schema.js
```

**Problem**: These are MongoDB/Mongoose schemas. The project uses PostgreSQL with Prisma. These files are never imported or used anywhere. `mongoose` is still in `package.json`.

**Fix**: Delete all 4 files. Remove `mongoose` from `package.json`. Delete `src/db/connect.js` (MongoDB connection file, commented out in `server.js`).

---

### 7. Wrong Package in Node Backend

**File**: `main-backend/package.json`

**Problem**: `react-hook-form` (a React frontend library) is listed as a dependency in the Node.js backend. Never used.

**Fix**: `npm uninstall react-hook-form` in `main-backend/`.

---

### 8. Deprecated Files Still in Repo

**Files**:
```
frontend/src/pages/Protected/faculty/schedule/ScheduleGeneratorDEPRECATED.tsx
frontend/src/pages/Protected/faculty/schedule/FacultyExpertiseManagerDEPRECATED.tsx
```

**Fix**: Delete both files. If they're referenced anywhere, remove the imports.

---

### 9. Three State Management Systems in Frontend

**Problem**: Auth and user state is managed in three overlapping systems:

| System | What it manages | Where |
|--------|----------------|-------|
| Redux Toolkit | `user`, `institution`, auth thunks | `store/slices/authSlice.ts` |
| Jotai | `userAtom`, `roleAtom`, `institutionIdAtom`, `userDataAtom` | `store/atom.ts` |
| Context API | `user`, `isLoading`, `logout()`, `reinitializeAuth()` | `services/AuthContext.tsx` |

A component could read user data from any of the three and get different values if they're out of sync.

**Fix**: Pick one. Recommendation:
- **Keep Context API** for auth (simple, already has the refresh/validate logic)
- **Remove Redux authSlice** (duplicates Context)
- **Remove Jotai atoms** that overlap with Context (`userAtom`, `roleAtom`, `userDataAtom`, `user_idAtom`)
- **Keep Jotai** only for UI-local state that doesn't overlap (e.g., `settingsAtom`)
- **Keep Redux departmentSlice** if caching is needed, or migrate to React Query

---

### 10. Inconsistent API Response Format

**Problem**: No standard response shape across 40+ controllers.

```javascript
// Controller A
res.status(201).send({ success: true, data: {...} })

// Controller B
res.status(200).json({ message: "Success", faculty: {...} })

// Controller C
res.status(500).json({ error: "Failed to fetch" })

// Controller D
res.status(200).send(rawArray)
```

**Fix**: Standardize all responses:
```javascript
// Success
{ success: true, data: {...}, message: "optional" }

// Error
{ success: false, error: { code: "VALIDATION_ERROR", message: "..." } }
```

Create a helper:
```javascript
// src/utils/response.js
export const ok = (res, data, message) =>
    res.json({ success: true, data, message });

export const fail = (res, status, code, message) =>
    res.status(status).json({ success: false, error: { code, message } });
```

---

### 11. "mannual" Typo Throughout Codebase

**Affected**:
```
src/controllers/schedule/mannualSchedule.controller.js   (filename)
src/Router/mannualSchedule.router.js                     (filename)
server.js: app.use("/api/v1/mannual-schedule", ...)      (route path)
Hardcoded string: status: 'mannual'                      (in controller)
```

**Fix**: Rename to `manualSchedule` everywhere. This is a breaking change for any frontend calling `/api/v1/mannual-schedule` — update frontend API calls at the same time.

---

### 12. ~500 Lines of Commented-Out Code

**Problem**: Large blocks of commented-out JSON schemas, TODO notes, and old implementations across controllers. Hurts readability, makes grep results noisy.

**Fix**: Delete all commented-out code blocks. If the code is historically significant, it's in git history.

---

### 13. Hardcoded Developer IPs in CORS Allowlist

**File**: `src/config/allowedOrigin.js`

```javascript
'http://192.168.0.158:5173',
'http://192.168.0.103:5173',
'http://192.168.1.100:5173',
'http://192.168.0.193:5173',
```

**Problem**: Developer machine IPs committed to source. Unprofessional, and a mild CORS bypass risk if attacker is on the same network.

**Fix**: Remove all hardcoded IPs. Use only:
```javascript
[
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL,
].filter(Boolean)
```

---

### 14. No Server-Side Input Validation Library

**Problem**: Validation is manual and inconsistent. One controller checks email regex, another doesn't. Quiz routes have dedicated validation middleware; nothing else does.

**Fix**: Add `zod` (already used in frontend) to Node backend:
```javascript
import { z } from 'zod';

const createStudentSchema = z.object({
    email: z.string().email(),
    first_name: z.string().min(1).max(100),
    enrollment_number: z.string().min(1),
    section_id: z.number().int().positive(),
    // ...
});
```

Create a `validate(schema)` middleware that wraps any route.

---

## C. Missing Features That Break UX

### 15. No Password Reset Flow

**Problem**: Zero forgot-password functionality. If a user forgets their password, they are permanently locked out. No endpoint, no UI, no email flow.

**Fix**:
1. `POST /api/v1/general/forgot-password` — accepts email, generates a time-limited reset token, sends email via nodemailer
2. `POST /api/v1/general/reset-password` — accepts token + new password, validates token expiry, updates `password_hash`
3. Frontend: "Forgot password?" link on login page → email input → confirmation screen
4. Add `password_reset_token` and `password_reset_expires` columns to `users` table

---

### 16. No Email Verification

**Problem**: Users created with any email string. No verification that the email is real or belongs to the user. Can lead to typos, fake accounts, and email delivery failures.

**Fix**:
1. On user creation: generate verification token, set `email_verified = false`
2. Send verification email with link containing token
3. `GET /api/v1/general/verify-email?token=...` — sets `email_verified = true`
4. Add `email_verified` (boolean, default false) to `users` table

---

### 17. No Pagination on List Endpoints

**Problem**: List endpoints return ALL records with no limit. `listoffaculty()`, `listOfStudents()`, `list_of_department()`, etc. will return thousands of records as the system grows, causing OOM errors and slow responses.

**Affected endpoints**:
```
GET /api/v1/faculty/list-of-faculty
GET /api/v1/student/list-of-student
GET /api/v1/department/list-of-department
GET /api/v1/room/list-of-rooms
GET /api/v1/equipment/
```

**Fix**: Add cursor or offset pagination:
```javascript
// Query params: ?page=1&limit=20
const page = parseInt(req.query.page) || 1;
const limit = Math.min(parseInt(req.query.limit) || 20, 100);
const skip = (page - 1) * limit;

const [data, total] = await Promise.all([
    prisma.faculty.findMany({ skip, take: limit }),
    prisma.faculty.count(),
]);

res.json({
    success: true,
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
});
```

---

### 18. No docker-compose for Local Development

**Problem**: README references Docker Compose but the file doesn't exist. Developers must manually start 3 services + PostgreSQL separately.

**Fix**: Create `docker-compose.yml` at project root:
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: classedgee
      POSTGRES_USER: classedgee
      POSTGRES_PASSWORD: classedgee
    ports: ["5432:5432"]
    volumes: ["pgdata:/var/lib/postgresql/data"]

  main-backend:
    build: ./main-backend
    ports: ["3000:3000"]
    depends_on: [postgres]
    env_file: ./main-backend/.env

  python-backend:
    build: ./python-backend
    ports: ["8000:8000"]
    depends_on: [postgres]
    env_file: ./python-backend/.env

  frontend:
    build: ./frontend
    ports: ["5173:5173"]

volumes:
  pgdata:
```

---

### 19. Emergency Routes at Wrong API Path

**Problem**: Emergency routes mounted at `/api` instead of `/api/v1`:
```javascript
app.use("/api", emergencyRouter);  // inconsistent with all other routes
```

**Fix**: Change to `app.use("/api/v1/emergency", emergencyRouter)`. Update frontend calls.

---

## Implementation Priority

### Week 1 (alongside security fixes)
| # | Fix | Effort |
|---|-----|--------|
| 6 | Delete Mongoose dead code | 15 min |
| 7 | Remove react-hook-form from backend | 5 min |
| 8 | Delete DEPRECATED files | 5 min |
| 12 | Delete commented-out code | 30 min |
| 13 | Remove hardcoded IPs from CORS | 10 min |

### Week 2
| # | Fix | Effort |
|---|-----|--------|
| 1 | Add missing DB indexes | 30 min |
| 2 | Fix N+1 query in schedule controller | 30 min |
| 10 | Standardize API response format | 2-3 hours |
| 11 | Fix "mannual" typo everywhere | 30 min |
| 14 | Add Zod validation to backend | 2-3 hours |
| 19 | Fix emergency route path | 15 min |

### Week 3
| # | Fix | Effort |
|---|-----|--------|
| 9 | Consolidate state management (pick one) | 3-4 hours |
| 15 | Password reset flow | 3-4 hours |
| 17 | Add pagination to all list endpoints | 2-3 hours |
| 18 | Create docker-compose.yml | 1-2 hours |

### Week 4
| # | Fix | Effort |
|---|-----|--------|
| 4 | Switch to Prisma migrate (from db push) | 1-2 hours |
| 5 | Create seed data | 2-3 hours |
| 16 | Email verification flow | 3-4 hours |
| 3 | Move Python DB writes to Node (part of face attendance redesign) | included in redesign |
