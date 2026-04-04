from __future__ import annotations

from typing import Any, Dict, Literal

from pydantic import BaseModel, Field


class AvailabilityWindow(BaseModel):
    day_of_week: int
    start_time: str
    end_time: str
    is_preferred: bool = False


class FacultyInput(BaseModel):
    id: str
    name: str
    department: str
    specializations: list[str] = Field(default_factory=list)
    max_hours_per_day: int = 4
    max_weekly_hours: int = 40
    availability_windows: list[AvailabilityWindow] = Field(default_factory=list)
    preferred_slots: list[int] = Field(default_factory=list)


class SubjectInput(BaseModel):
    code: str
    name: str
    subject_id: str
    course_id: str
    department: str
    semester: int
    credits: int
    requires_lab: bool
    total_hours: int
    preferred_faculty: list[str] = Field(default_factory=list)


class SectionInput(BaseModel):
    section_id: str
    batch: int
    section: str
    strength: int
    semester: int
    academic_year: int


class DepartmentInput(BaseModel):
    name: str
    faculty: list[FacultyInput] = Field(default_factory=list)
    subjects: list[SubjectInput] = Field(default_factory=list)
    sections: Dict[str, SectionInput] = Field(default_factory=dict)


class RoomInput(BaseModel):
    id: str
    name: str
    capacity: int
    room_type: str


class TimeSlotInput(BaseModel):
    slot_id: str
    day: int
    time: str


class ScheduleRequest(BaseModel):
    departments: Dict[str, DepartmentInput]
    rooms: list[RoomInput]
    time_slots: list[TimeSlotInput]
    semester_weeks: int = 16


class ScheduleSolveResult(BaseModel):
    status: Literal["optimal", "feasible", "infeasible"]
    schedule: Dict[str, Dict[str, Dict[str, Any]]]
    message: str | None = None
