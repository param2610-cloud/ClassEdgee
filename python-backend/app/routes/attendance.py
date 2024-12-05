# app/schemas/attendance.py
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class FaceRegistrationRequest(BaseModel):
    student_id: int
    enrollment: str
    image: str  # base64 encoded image

class AttendanceRecord(BaseModel):
    student_name: str
    enrollment: str
    status: str
    time: str

class AttendanceResponse(BaseModel):
    attendance: List[AttendanceRecord]