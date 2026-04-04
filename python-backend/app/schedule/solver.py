from __future__ import annotations

import math
from collections import defaultdict
from dataclasses import dataclass

from ortools.sat.python import cp_model

from .models import FacultyInput, RoomInput, ScheduleRequest, ScheduleSolveResult, SectionInput, SubjectInput, TimeSlotInput


@dataclass
class CandidateAssignment:
    section_key: str
    section: SectionInput
    subject: SubjectInput
    faculty: FacultyInput
    room: RoomInput
    slot: TimeSlotInput
    variable: cp_model.IntVar | None = None


def _parse_time_to_minutes(time_value: str) -> int:
    parts = time_value.split(":")
    if len(parts) < 2:
        raise ValueError(f"Invalid time format: {time_value}")

    hours = int(parts[0])
    minutes = int(parts[1])
    return (hours * 60) + minutes


def _faculty_is_available(faculty: FacultyInput, slot: TimeSlotInput) -> bool:
    windows = faculty.availability_windows
    if not windows:
        return True

    slot_minutes = _parse_time_to_minutes(slot.time)

    for window in windows:
        if window.day_of_week != slot.day:
            continue

        start_minutes = _parse_time_to_minutes(window.start_time)
        end_minutes = _parse_time_to_minutes(window.end_time)

        if start_minutes <= slot_minutes < end_minutes:
            return True

    return False


def _room_is_compatible(room: RoomInput, subject: SubjectInput, section: SectionInput) -> bool:
    room_type = (room.room_type or "").lower()

    if subject.requires_lab and room_type != "lab":
        return False

    if not subject.requires_lab and room_type == "lab":
        return False

    return room.capacity >= section.strength


def _eligible_faculty_ids(subject: SubjectInput, faculty_by_id: dict[str, FacultyInput]) -> list[str]:
    preferred = [faculty_id for faculty_id in subject.preferred_faculty if faculty_id in faculty_by_id]
    if preferred:
        return preferred

    matched_by_specialization = [
        faculty.id
        for faculty in faculty_by_id.values()
        if subject.code in faculty.specializations
    ]

    return matched_by_specialization


def solve_schedule_with_cp_sat(request: ScheduleRequest) -> ScheduleSolveResult:
    model = cp_model.CpModel()

    all_faculty: dict[str, FacultyInput] = {}
    for department in request.departments.values():
        for faculty in department.faculty:
            all_faculty[faculty.id] = faculty

    assignments: list[CandidateAssignment] = []
    section_slot_map: dict[tuple[str, str], list[CandidateAssignment]] = defaultdict(list)
    section_subject_map: dict[tuple[str, str], list[CandidateAssignment]] = defaultdict(list)
    faculty_slot_map: dict[tuple[str, str], list[CandidateAssignment]] = defaultdict(list)
    room_slot_map: dict[tuple[str, str], list[CandidateAssignment]] = defaultdict(list)

    section_total_required: dict[str, int] = defaultdict(int)
    section_subject_requirements: dict[tuple[str, str], int] = {}
    section_subject_slots: dict[tuple[str, str], set[str]] = defaultdict(set)

    # Build candidate assignments and weekly requirements.
    for dept_code, department in request.departments.items():
        dept_faculty_by_id = {faculty.id: faculty for faculty in department.faculty}

        for section in department.sections.values():
            section_key = f"{dept_code}_{section.batch}_{section.section_id}"

            eligible_subjects = [
                subject
                for subject in department.subjects
                if subject.semester == section.semester and subject.department == dept_code
            ]

            for subject in eligible_subjects:
                classes_per_week = max(1, math.ceil(subject.total_hours / max(1, request.semester_weeks)))
                section_subject_requirements[(section_key, subject.subject_id)] = classes_per_week
                section_total_required[section_key] += classes_per_week

                faculty_ids = _eligible_faculty_ids(subject, dept_faculty_by_id)
                if not faculty_ids:
                    continue

                for slot in request.time_slots:
                    for faculty_id in faculty_ids:
                        faculty = dept_faculty_by_id.get(faculty_id) or all_faculty.get(faculty_id)
                        if not faculty:
                            continue

                        if not _faculty_is_available(faculty, slot):
                            continue

                        for room in request.rooms:
                            if not _room_is_compatible(room, subject, section):
                                continue

                            assignment = CandidateAssignment(
                                section_key=section_key,
                                section=section,
                                subject=subject,
                                faculty=faculty,
                                room=room,
                                slot=slot,
                            )

                            assignments.append(assignment)
                            section_slot_map[(section_key, slot.slot_id)].append(assignment)
                            section_subject_map[(section_key, subject.subject_id)].append(assignment)
                            faculty_slot_map[(faculty.id, slot.slot_id)].append(assignment)
                            room_slot_map[(room.id, slot.slot_id)].append(assignment)
                            section_subject_slots[(section_key, subject.subject_id)].add(slot.slot_id)

    if not assignments:
        return ScheduleSolveResult(
            status="infeasible",
            schedule={},
            message="No valid assignment candidates available.",
        )

    # Fast infeasibility check for each required subject.
    for requirement_key, required_count in section_subject_requirements.items():
        available_slot_count = len(section_subject_slots.get(requirement_key, set()))
        if available_slot_count < required_count:
            section_key, subject_id = requirement_key
            return ScheduleSolveResult(
                status="infeasible",
                schedule={},
                message=(
                    f"Insufficient valid slots for section {section_key} subject {subject_id}. "
                    f"Needed {required_count}, found {available_slot_count}."
                ),
            )

    # Decision variables for candidate assignments.
    for index, assignment in enumerate(assignments):
        assignment.variable = model.NewBoolVar(f"x_{index}")

    # 1) At most one assignment per section per slot.
    for bucket in section_slot_map.values():
        model.Add(sum(assignment.variable for assignment in bucket) <= 1)

    # 2) No faculty double booking.
    for bucket in faculty_slot_map.values():
        model.Add(sum(assignment.variable for assignment in bucket) <= 1)

    # 3) No room double booking.
    for bucket in room_slot_map.values():
        model.Add(sum(assignment.variable for assignment in bucket) <= 1)

    # 4) Subject coverage per section.
    for requirement_key, required_count in section_subject_requirements.items():
        bucket = section_subject_map.get(requirement_key, [])
        model.Add(sum(assignment.variable for assignment in bucket) == required_count)

    preference_terms: list[cp_model.LinearExpr] = []
    penalty_terms: list[cp_model.LinearExpr] = []

    # Soft objective 1: Preferred slots bonus.
    for assignment in assignments:
        preferred_slot_ids = set(assignment.faculty.preferred_slots or [])
        if int(assignment.slot.slot_id) in preferred_slot_ids:
            preference_terms.append(assignment.variable * 10)

    # Precompute utility maps for soft constraints.
    section_day_map: dict[tuple[str, int], list[CandidateAssignment]] = defaultdict(list)
    faculty_day_map: dict[tuple[str, int], list[CandidateAssignment]] = defaultdict(list)
    faculty_week_map: dict[str, list[CandidateAssignment]] = defaultdict(list)
    section_day_room_map: dict[tuple[str, int, str], list[CandidateAssignment]] = defaultdict(list)

    for assignment in assignments:
        day = assignment.slot.day
        section_day_map[(assignment.section_key, day)].append(assignment)
        faculty_day_map[(assignment.faculty.id, day)].append(assignment)
        faculty_week_map[assignment.faculty.id].append(assignment)
        section_day_room_map[(assignment.section_key, day, assignment.room.id)].append(assignment)

    # Soft objective 2: Spread classes across the week per section.
    for section_key, total_required in section_total_required.items():
        ideal_daily = max(1, math.ceil(total_required / 5))

        for day in range(1, 6):
            bucket = section_day_map.get((section_key, day), [])
            if not bucket:
                continue

            day_count = model.NewIntVar(0, len(bucket), f"section_day_count_{section_key}_{day}")
            model.Add(day_count == sum(assignment.variable for assignment in bucket))

            excess = model.NewIntVar(0, len(bucket), f"section_day_excess_{section_key}_{day}")
            model.Add(excess >= day_count - ideal_daily)
            penalty_terms.append(excess * 5)

    # Soft objective 3: Faculty daily max class load.
    for faculty in all_faculty.values():
        max_per_day = max(1, faculty.max_hours_per_day)
        for day in range(1, 6):
            bucket = faculty_day_map.get((faculty.id, day), [])
            if not bucket:
                continue

            day_count = model.NewIntVar(0, len(bucket), f"faculty_day_count_{faculty.id}_{day}")
            model.Add(day_count == sum(assignment.variable for assignment in bucket))

            excess = model.NewIntVar(0, len(bucket), f"faculty_day_excess_{faculty.id}_{day}")
            model.Add(excess >= day_count - max_per_day)
            penalty_terms.append(excess * 20)

    # Soft objective 4: Faculty weekly max class load.
    for faculty in all_faculty.values():
        bucket = faculty_week_map.get(faculty.id, [])
        if not bucket:
            continue

        max_weekly = max(1, faculty.max_weekly_hours)
        week_count = model.NewIntVar(0, len(bucket), f"faculty_week_count_{faculty.id}")
        model.Add(week_count == sum(assignment.variable for assignment in bucket))

        excess = model.NewIntVar(0, len(bucket), f"faculty_week_excess_{faculty.id}")
        model.Add(excess >= week_count - max_weekly)
        penalty_terms.append(excess * 15)

    # Soft objective 5: Minimize room changes for a section in a day.
    section_day_rooms: dict[tuple[str, int], set[str]] = defaultdict(set)
    for section_key, day, room_id in section_day_room_map.keys():
        section_day_rooms[(section_key, day)].add(room_id)

    for section_day_key, room_ids in section_day_rooms.items():
        room_used_vars: list[cp_model.IntVar] = []

        for room_id in room_ids:
            bucket = section_day_room_map[(section_day_key[0], section_day_key[1], room_id)]
            room_used = model.NewBoolVar(
                f"room_used_{section_day_key[0]}_{section_day_key[1]}_{room_id}"
            )
            for assignment in bucket:
                model.Add(assignment.variable <= room_used)
            room_used_vars.append(room_used)

        if not room_used_vars:
            continue

        room_count = model.NewIntVar(0, len(room_used_vars), f"room_count_{section_day_key[0]}_{section_day_key[1]}")
        model.Add(room_count == sum(room_used_vars))

        room_change_excess = model.NewIntVar(
            0,
            len(room_used_vars),
            f"room_change_excess_{section_day_key[0]}_{section_day_key[1]}",
        )
        model.Add(room_change_excess >= room_count - 1)
        penalty_terms.append(room_change_excess * 3)

    model.Maximize(sum(preference_terms) - sum(penalty_terms))

    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 60.0

    status = solver.Solve(model)
    if status == cp_model.OPTIMAL:
        status_label = "optimal"
    elif status == cp_model.FEASIBLE:
        status_label = "feasible"
    else:
        return ScheduleSolveResult(
            status="infeasible",
            schedule={},
            message="No feasible schedule found for the provided constraints.",
        )

    schedule_output: dict[str, dict[str, dict[str, str | int]]] = defaultdict(dict)

    for assignment in assignments:
        if solver.BooleanValue(assignment.variable):
            slot_key = f"{assignment.slot.day} {assignment.slot.time}"
            schedule_output[assignment.section_key][slot_key] = {
                "course": assignment.subject.name,
                "faculty_id": assignment.faculty.id,
                "room_id": assignment.room.id,
                "semester": assignment.section.semester,
                "academic_year": assignment.section.academic_year,
                "section_id": assignment.section.section_id,
                "course_id": assignment.subject.course_id,
                "subject_id": assignment.subject.subject_id,
                "slot_id": assignment.slot.slot_id,
            }

    return ScheduleSolveResult(
        status=status_label,
        schedule=dict(schedule_output),
    )
