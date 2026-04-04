# Attendance UX Grooming Plan

## Status
Draft for implementation planning

## Goal
Create a reliable, simple, role-based attendance experience for faculty, coordinator, and student users.

## Problem Summary
Current attendance UX is fragmented and confusing:
- Face registration and class attendance are split across different pages with no shared flow language.
- Processing can appear stuck from the user perspective (queued state uncertainty).
- Error handling is technical, not actionable.
- Attendance processing does not clearly separate capture, processing, review, and publish steps.
- Job state can be lost on backend restart (in-memory tracking).

## Success Criteria
- Faculty can complete attendance in under 2 minutes after class capture.
- Users always know the current job state and next action.
- Failed jobs show clear retry guidance.
- Recognition result and final attendance write are distinguishable in UI.
- Coordinator can review attendance quality and exceptions.

## Role-Based UX Ownership

### Faculty (primary operator)
- Owns class capture and processing.
- Reviews recognition outcome before finalizing.
- Handles quick manual corrections for low-confidence cases.

### Coordinator (oversight)
- Monitors low attendance and quality metrics.
- Reviews flagged anomalies and escalations.

### Student
- Completes face registration/enrollment.
- Sees attendance outcome and history only.

## Information Architecture

### Faculty
Single source of truth in class context:
- Route: /p/classes/:class_id
- Attendance area should be a 5-step flow:
  1. Capture
  2. Upload
  3. Process
  4. Review
  5. Publish

### Coordinator
- Route: /p/attendance
- Focus on reporting, quality checks, notifications, and exceptions.

### Student
- Profile verification for enrollment.
- Personal attendance summary in student dashboard/profile.

## Proposed Attendance Flow (Faculty)

### Step 1: Capture
UI block: "Capture Source"
- Option A: Record from camera
- Option B: Upload existing video/image set
- Show camera permission status and capture checklist.

Validation:
- At least one valid media item.
- File format and size checks before upload.

### Step 2: Upload
UI block: "Upload Progress"
- Determinate progress bar per file and total.
- Success/failure count.
- Retry only failed uploads.

### Step 3: Process
UI block: "Recognition Job"
- Show job id, started at, current state.
- States: queued -> processing -> recognized -> persisted -> completed/failed.
- Use polling initially, websocket later for real-time updates.

Important:
- Separate recognition success from attendance persistence success.
- If recognition is success but DB write fails, show explicit "Recognition succeeded, save failed" state.

### Step 4: Review
UI block: "Recognition Review"
- Recognized students list with confidence and frames seen.
- Unmatched faces count.
- Flagged/low-confidence list for manual review.
- Quick actions: mark present, mark absent, require review.

### Step 5: Publish
UI block: "Finalize Attendance"
- Show summary before commit:
  - Present count
  - Absent count
  - Flagged count
- Confirm action with one button and completion receipt.

## Registration Flow (Student)
- Capture face images with guided prompts.
- Queue registration job and show status timeline.
- On success, show "Model updated for section" confirmation.
- On failure, show specific corrective action (lighting, angle, image quality, retry).

## UX States and Copy Standards

### Global states
- Idle
- In progress
- Partial success
- Success
- Recoverable failure
- Non-recoverable failure

### Message rules
- No raw stack traces in UI.
- Include what happened, what it means, and what to do next.

Example:
- Bad: "ConnectorError 23514"
- Good: "Faces were recognized, but attendance could not be saved due to database partition setup. Please retry in 1 minute or contact admin."

## Backend/Contract Requirements for UX Reliability
- Always provide `attendance_date` from class metadata when processing.
- Persist face jobs to DB (not in-memory map only).
- Include final state machine fields in job response:
  - recognition_status
  - persistence_status
  - failure_reason
  - retryable
- Add optional `review_required` list in recognition payload.

## Error Scenarios and UX Behavior
- DB connectivity issue: show retry CTA and preserve job context.
- Persistence partition error: show admin-level warning and queue retry.
- No model for section: block processing with direct link to registration step.
- Empty capture set: disable process CTA with validation message.

## Phased Implementation Plan

### Phase 1: IA and UI framing (1-2 days)
- Create attendance stepper shell in faculty class page.
- Keep existing upload implementation inside Step 1 and Step 2.

### Phase 2: Job-state UX and resilience (2-3 days)
- Add explicit processing timeline and state transitions.
- Add retry controls and improved failure copy.

### Phase 3: Review and publish (2-4 days)
- Build review panel for recognized/flagged/unmatched.
- Add finalize action and completion receipt.

### Phase 4: Coordinator quality dashboard (2-3 days)
- Surface flagged sessions and manual intervention metrics.
- Add confidence and exception trend cards.

### Phase 5: Persistence hardening (parallel backend)
- Move face job store from in-memory to DB table.
- Keep job history queryable after restart.

## Definition of Done
- Faculty can complete process from capture to publish without switching pages.
- Job progress never appears stuck without explanation.
- User sees clear difference between recognition success and DB save success.
- Coordinator can identify and resolve exception cases.
- Student enrollment success/failure is understandable and actionable.

## Immediate Next Action
Implement Phase 1 in UI first:
- Introduce attendance stepper layout in class attendance tab.
- Keep existing upload and camera recording features as step content.
- Add consistent status panel at the bottom for job lifecycle.
