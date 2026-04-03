# Scheduler Restructuring Plan — Google OR-Tools CP-SAT

## Context

The ClassEdgee scheduling system is broken at every layer:

- **Python**: Greedy sequential algorithm with no optimization, no load balancing, ignores faculty availability/capacity
- **Node backend**: Dead code executing on startup, N+1 queries, missing fields (subject_id, course_id), hardcoded 4-week semester
- **Data model**: No DB-level double-booking prevention, inconsistent day_of_week values, unused tables (schedule_conflicts, facultyavailability)
- **Frontend**: ScheduleGrid never fetches data (always empty), hardcoded section_id=12, duplicate components

Goal: Solid data model first, then replace greedy algorithm with OR-Tools CP-SAT constraint solver, fix backend controllers, fix frontend.

---

## Phase 1: Data Model (Prisma Schema)

**File**: `main-backend/prisma/schema.prisma`

### 1.1 Add unique constraints to prevent double-booking

```prisma
model schedule_details {
  // ... existing fields ...
  @@unique([faculty_id, timeslot_id])  // No faculty double-booking
  @@unique([room_id, timeslot_id])     // No room double-booking
  @@index([timeslot_id], map: "idx_schedule_details_timeslot")  // Missing index
}
```

Since timeslots are scoped to semester+academic_year, these global uniques are safe across semesters.

**Pre-migration check**: Query for existing duplicates before adding constraints.

### 1.2 Remove redundant schedule_details.day_of_week

Remove `day_of_week String? @db.VarChar(255)` from schedule_details — it's always NULL, day info lives in timeslots.day_of_week.

### 1.3 Make timeslots fields non-nullable

```prisma
model timeslots {
  day_of_week   Int           // was Int?
  semester      Int           // was Int?
  academic_year Int           // was Int?
}
```

Standardize day_of_week to 1-5 (Mon-Fri) everywhere.

### 1.4 Add missing indexes

```prisma
model classes {
  @@index([slot_id])
  @@index([date_of_class])
  @@index([section_id])
}
```

### 1.5 Switch to Prisma Migrate

```bash
npx prisma migrate dev --name scheduler-restructure
```

Commit `prisma/migrations/` folder. Stop using `db push`.

---

## Phase 2: OR-Tools CP-SAT Solver (Python)

### 2.1 New file: `python-backend/app/schedule/models.py`

Pydantic input/output schemas with strict typing:

```python
class FacultyInput(BaseModel):
    id: str
    name: str
    department: str
    specializations: list[str]        # subject codes
    max_hours_per_day: int
    max_weekly_hours: int
    availability_windows: list[AvailabilityWindow]  # NEW: from facultyavailability table
    preferred_slots: list[int]                       # NEW: from faculty.preferred_slots

class AvailabilityWindow(BaseModel):
    day_of_week: int
    start_time: str
    end_time: str
    is_preferred: bool

class SubjectInput(BaseModel):
    code: str
    name: str
    subject_id: str       # NEW: pass through for output
    course_id: str
    department: str
    semester: int
    credits: int
    requires_lab: bool
    total_hours: int
    preferred_faculty: list[str]  # faculty IDs

class SectionInput(BaseModel):
    section_id: str
    batch: int
    section: str
    strength: int     # student_count for room capacity check
    semester: int
    academic_year: int

class RoomInput(BaseModel):
    id: str
    name: str
    capacity: int
    room_type: str    # "classroom" | "lab"

class TimeSlotInput(BaseModel):
    slot_id: str      # NEW: actual DB slot ID
    day: int          # 1-5
    time: str         # HH:MM:SS

class ScheduleRequest(BaseModel):
    departments: dict[str, DepartmentInput]
    rooms: list[RoomInput]
    time_slots: list[TimeSlotInput]    # CHANGED: list of slot objects (was {days, times})
    semester_weeks: int = 16
```

Output format stays backward-compatible with `saveScheduleToDatabase`:

```python
{
  "DEPT_BATCH_SECTIONID": {
    "DAY TIME": {
      "course": str, "faculty_id": str, "room_id": str,
      "semester": int, "academic_year": int,
      "section_id": str, "course_id": str,
      "subject_id": str   # NEW
    }
  }
}
```

### 2.2 New file: `python-backend/app/schedule/solver.py`

CP-SAT constraint model using pre-enumerated valid triples:

**Decision variables**: For each (section, timeslot, valid_triple_index) → BoolVar

**Pre-filter valid triples per section**:

- Subject belongs to section's semester + department
- Faculty is mapped to subject (faculty_subject_mapping)
- Room type matches (lab→lab, theory→classroom)
- Room capacity >= section strength
- Faculty is available during this timeslot (check availability_windows)

**Hard constraints**:

1. At most one assignment per section per slot
2. No faculty double-booking across all sections (AtMostOne per faculty per slot)
3. No room double-booking across all sections (AtMostOne per room per slot)
4. Each subject gets exactly `classes_per_week` slots per section

**Soft constraints (objective)**:

1. Faculty preferred_slots bonus (weight: 10)
2. Spread classes across week — penalize >ideal daily count per section (weight: 5)
3. Faculty max_classes_per_day — penalize excess (weight: 20)
4. Faculty max_weekly_hours — penalize excess (weight: 15)
5. Minimize room changes for same section in a day (weight: 3)

**Solver config**:

- `solver.parameters.max_time_in_seconds = 60.0`
- Return status: "optimal", "feasible" (timeout), or "infeasible"

### 2.3 Refactor `python-backend/app/schedule/scheduler.py`

- Remove greedy `ScheduleGenerator` class
- Orchestrate: validate input → build solver indices → run CP-SAT → format output
- Remove file-based `data.json` loading — accept Pydantic model directly

### 2.4 Update `python-backend/app/main.py`

- Update `/generate-schedule` endpoint to use new Pydantic models
- Remove `with open("data.json", "w")` file write (line 179)
- Return solver status alongside schedule

### 2.5 Add to `python-backend/app/requirements.txt`

```
ortools>=9.8
```

---

## Phase 3: Backend Controller Fixes (Node.js)

### 3.1 Delete dead code

**Delete**: `main-backend/src/controllers/schedule/schedule.controller.js` — 318 lines of unused code, including a function that randomly assigns subjects on server startup.

### 3.2 Fix `schedule.controller2.js` — `fetchData()`

**File**: `main-backend/src/controllers/schedule/schedule.controller2.js:7-127`

Changes:

1. Include `facultyavailability` in faculty query
2. Map availability windows into output
3. Add `max_classes_per_day` (currently only sends `max_weekly_hours / 5`)
4. Send timeslots as list of `{slot_id, day, time}` objects (not flat arrays)
5. Include `subject_id` in subjects output
6. Include `student_count` (strength) in sections

### 3.3 Fix `schedule.controller2.js` — `saveScheduleToDatabase()`

**File**: `main-backend/src/controllers/schedule/schedule.controller2.js:262-414`

Changes:

1. Accept `semester_weeks` param, pass to `generateWeeklyDates` (currently hardcoded to 4)
2. Save `subject_id` on `schedule_details.create()` (line 365 — currently missing)
3. Match timeslots by `slot_id` directly (not by day+time string parsing)

### 3.4 Fix `schedule.controller2.js` — `generateSchedule()`

**File**: `main-backend/src/controllers/schedule/schedule.controller2.js:130-187`

Accept `semester_weeks` from request body, pass to `saveScheduleToDatabase`.

### 3.5 Rewrite `mannualSchedule.controller.js`

**File**: `main-backend/src/controllers/schedule/mannualSchedule.controller.js`

**`get_available_faculty` (lines 96-148)** — Fix N+1 + broken preferred_slots:

```javascript
// Batch query instead of Promise.all with individual findFirst
const bookedFaculty = await prisma.schedule_details.findMany({
    where: {
        faculty_id: { in: mappedFaculty.map(m => m.faculty_id) },
        timeslot_id: Number(slotId)
    },
    select: { faculty_id: true }
});
const bookedSet = new Set(bookedFaculty.map(b => b.faculty_id));

// Safe preferred_slots check (was crashing on null)
isAvailable: !bookedSet.has(mapping.faculty_id),
isPreferred: (mapping.faculty.preferred_slots || []).includes(Number(slotId))
```

**`get_available_rooms` (lines 151-191)** — Same N+1 fix with batch query.

**`assignSchedule` (lines 194-226)** — Add missing fields:

```javascript
// schedule_details: add subject_id
data: { schedule_id, faculty_id, room_id, timeslot_id: slotId, subject_id: subjectId }

// classes: add course_id and date_of_class
const subject = await prisma.subject_details.findUnique({
    where: { subject_id: subjectId }, select: { course_id: true }
});
data: { ..., course_id: subject?.course_id, date_of_class: new Date() }
```

**`export_schedule` (line 255)** — Change `detail.day_of_week` to `detail.timeslots.day_of_week`.

### 3.6 Fix timeslot controller validation

Standardize validation message to match 1-5 range (was saying "0 and 6").

---

## Phase 4: Frontend Fixes

### 4.1 Fix ScheduleGrid (CRITICAL)

**File**: `frontend/src/components/schedule/ScheduleGrid.tsx`

- Add `useEffect` to fetch timeslots via `scheduleService.getTimeSlots(departmentId, semester)`
- Accept `scheduleId` and `sectionId` as props (currently hardcoded to 0)

### 4.2 Fix MannualScheduler prop passing

**File**: `frontend/src/pages/Protected/faculty/schedule/MannualScheduler.tsx`

- Uncomment `scheduleId`, `sectionId`, `academicYear` props on ScheduleGrid

### 4.3 Fix hardcoded section_id

**File**: `frontend/src/pages/Protected/faculty/schedule/ScheduleViewer.tsx:45`

- Change `section/12` to use `useParams().section_id`

### 4.4 Fix API endpoint inconsistency

**File**: `frontend/src/api/scheduling-api/fetch.ts:29`

- Change `/api/v1/schedule/faculty` to `/api/v1/mannual-schedule/faculty`

### 4.5 Fix day_of_week indexing

- Standardize to 1-indexed weekday map: `{1: 'Monday', 2: 'Tuesday', ...}`
- Update `ScheduleViewer.tsx` and `SechduleViewerComponent.tsx`

### 4.6 Clean up

- Delete `ScheduleGeneratorDEPRECATED.tsx` (100% commented out)
- Delete `FacultyExpertiseManagerDEPRECATED.tsx` (exact duplicate)
- Rename `MannualScheduler.tsx` → `ManualScheduler.tsx`
- Rename `SechduleGenerator.tsx` → `ScheduleGenerator.tsx`
- Rename `SechduleViewerComponent.tsx` → `ScheduleViewerComponent.tsx`
- Update all imports in `ScheduleDashboard.tsx`

---

## Implementation Order

```
Phase 1 (Data Model)     → ~1 day
  ├── Pre-migration duplicate check script
  ├── Schema changes + prisma migrate dev
  └── Verify migration

Phase 2 (OR-Tools)       → ~3-4 days
  ├── models.py (Pydantic schemas)
  ├── solver.py (CP-SAT model)
  ├── Refactor scheduler.py
  ├── Update main.py endpoint
  └── Test solver independently with sample data

Phase 3 (Backend)        → ~2 days
  ├── Delete schedule.controller.js
  ├── Fix fetchData() to send new format
  ├── Fix saveScheduleToDatabase (semester weeks + subject_id)
  ├── Fix mannualSchedule N+1 + missing fields
  └── Integration test: Node → Python → Node → DB

Phase 4 (Frontend)       → ~1 day
  ├── Fix ScheduleGrid data fetching
  ├── Fix hardcoded values
  ├── Clean up deprecated/duplicate files
  └── End-to-end test in browser
```

## Verification

After each phase, verify:

**Phase 1**: `npx prisma migrate dev` succeeds, existing data intact, unique constraints active
**Phase 2**: Python unit test — feed sample input, get valid schedule with no conflicts
**Phase 3**: POST /api/v1/schedule/generate → schedule saved with subject_id, course_id, full semester classes
**Phase 4**:

- Manual scheduler: InitialForm → grid loads timeslots → assign subject/faculty/room → saved correctly
- Schedule viewer: displays timetable with correct day mapping
- Browser console: no errors, network tab shows correct API calls

## Critical Files

| File                                                                  | Changes                                                                                    |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `main-backend/prisma/schema.prisma`                                   | Unique constraints, indexes, non-nullable fields, remove day_of_week from schedule_details |
| `python-backend/app/schedule/solver.py`                               | **NEW** — CP-SAT constraint model                                                          |
| `python-backend/app/schedule/models.py`                               | **NEW** — Pydantic schemas                                                                 |
| `python-backend/app/schedule/scheduler.py`                            | Rewrite as orchestrator                                                                    |
| `python-backend/app/main.py`                                          | Update /generate-schedule endpoint                                                         |
| `python-backend/app/requirements.txt`                                 | Add `ortools>=9.8`                                                                         |
| `main-backend/src/controllers/schedule/schedule.controller2.js`       | Fix fetchData, saveScheduleToDatabase, generateSchedule                                    |
| `main-backend/src/controllers/schedule/mannualSchedule.controller.js` | Fix N+1, add missing fields, add validation                                                |
| `main-backend/src/controllers/schedule/schedule.controller.js`        | **DELETE**                                                                                 |
| `frontend/src/components/schedule/ScheduleGrid.tsx`                   | Fetch timeslots on mount, accept props                                                     |
| `frontend/src/pages/Protected/faculty/schedule/MannualScheduler.tsx`  | Uncomment prop passing                                                                     |
| `frontend/src/pages/Protected/faculty/schedule/ScheduleViewer.tsx`    | Fix hardcoded section_id                                                                   |
| `frontend/src/api/scheduling-api/fetch.ts`                            | Fix endpoint path                                                                          |
