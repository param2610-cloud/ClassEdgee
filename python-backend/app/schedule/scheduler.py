from __future__ import annotations

from .models import ScheduleRequest, ScheduleSolveResult
from .solver import solve_schedule_with_cp_sat


def generate_schedule(request: ScheduleRequest) -> ScheduleSolveResult:
    """Validate and solve schedule generation with CP-SAT."""
    return solve_schedule_with_cp_sat(request)
