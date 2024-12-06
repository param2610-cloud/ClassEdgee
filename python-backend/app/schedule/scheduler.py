from typing import List, Dict
import json
from dataclasses import dataclass
import random
from collections import defaultdict

@dataclass
class TimeSlot:
    day: str
    time: str

    def __str__(self):
        return f"{self.day} {self.time}"

@dataclass
class Course:
    code: str
    name: str
    department: str
    semester: int
    credits: int
    requires_lab: bool
    faculty_id: str
    total_hours: int
    course_id: str

@dataclass
class Room:
    id: str
    name: str
    capacity: int
    room_type: str

class ScheduleGenerator:
    def __init__(self, data_file: str):
        with open(data_file, 'r') as f:
            self.data = json.load(f)
        self.process_input_data()

    def process_input_data(self):
        self.courses = []
        self.rooms = []
        self.sections = []
        self.faculty = defaultdict(list)
        
        # Process rooms
        for room_data in self.data["rooms"]:
            self.rooms.append(Room(
                id=room_data["id"],
                name=room_data["name"],
                capacity=room_data["capacity"],
                room_type=room_data["room_type"]
            ))
        
        # Process departments, courses, sections
        for dept_code, dept_data in self.data["departments"].items():
            # Process faculty
            for faculty in dept_data["faculty"]:
                self.faculty[dept_code].append({
                    "id": faculty["id"],
                    "max_hours": faculty["max_hours_per_day"],
                    "specializations": faculty["specializations"]
                })
            
            # Process courses
            for subject in dept_data["subjects"]:
                preferred_faculty = subject["preferred_faculty_specializations"]
                if not preferred_faculty:  # Handle empty faculty list
                    if dept_code in self.faculty and self.faculty[dept_code]:
                        faculty_id = self.faculty[dept_code][0]["id"]
                    else:
                        continue  # Skip course if no faculty available
                else:
                    faculty_id = preferred_faculty[0]  # Take first preferred faculty
                
                self.courses.append(Course(
                    code=subject["code"],
                    name=subject["name"],
                    department=dept_code,
                    semester=subject["semester"],
                    credits=subject["credits"],
                    requires_lab=subject["requires_lab"],
                    faculty_id=faculty_id,
                    total_hours=subject["total_hours"],
                    course_id = subject["course_id"]
                ))

    def _convert_schedule_for_json(self, schedule):
        """Convert schedule to JSON-serializable format"""
        return {str(k): {str(tk): tv for tk, tv in v.items()} 
                for k, v in schedule.items()}

    def generate_schedule(self) -> Dict:
        if not self.courses or not self.rooms:
            return {}  # Return empty schedule if no courses or rooms
            
        schedule = defaultdict(dict)
        faculty_assignments = defaultdict(set)
        room_assignments = defaultdict(set)
        
        for dept_code, dept_data in self.data["departments"].items():
            if not dept_data["sections"]:
                continue
                
            for section_id, section_data in dept_data["sections"].items():
                dept_courses = [c for c in self.courses if c.department == dept_code]
                if not dept_courses:
                    continue
                    
                for course in dept_courses:
                    classes_per_week = self.calculate_weekly_classes(course.total_hours)
                    scheduled_count = 0
                    
                    while scheduled_count < classes_per_week:
                        slot = self.find_available_slot(
                            course, 
                            faculty_assignments[course.faculty_id],
                            section_id, 
                            room_assignments
                        )
                        
                        if not slot:
                            break
                            
                        time_slot, room = slot
                        key = f"{dept_code}_{section_data['batch']}_{section_data['section_id']}"
                        
                        schedule[key][str(time_slot)] = {
                            "course": course.name,
                            "faculty_id": course.faculty_id,
                            "room_id": room.id,
                            "semester": course.semester,
                            "academic_year": section_data["academic_year"],
                            "section_id": section_data["section_id"],
                            "course_id": course.course_id
                        }
                        
                        faculty_assignments[course.faculty_id].add(str(time_slot))
                        room_assignments[room.id].add(str(time_slot))
                        scheduled_count += 1
        
        return self._convert_schedule_for_json(schedule)

    def calculate_weekly_classes(self, total_hours: int) -> int:
        weeks_in_semester = 16
        return max(1, round(total_hours / weeks_in_semester))

    def find_available_slot(self, course, faculty_slots, section_id, room_assignments):
        if not self.data["time_slots"]["times"]:
            return None
            
        days = [str(d) for d in range(1, 6)]  # Monday to Friday
        times = self.data["time_slots"]["times"]
        
        for day in days:
            for time in times:
                time_slot = TimeSlot(day, time)
                
                if str(time_slot) in faculty_slots:
                    continue
                
                for room in self.rooms:
                    if str(time_slot) in room_assignments[room.id]:
                        continue
                        
                    if (course.requires_lab and room.room_type == 'lab') or \
                       (not course.requires_lab and room.room_type == 'classroom'):
                        return time_slot, room
        
        return None
