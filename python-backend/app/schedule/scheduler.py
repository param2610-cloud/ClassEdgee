from typing import List, Dict
import json
from dataclasses import dataclass
import random
from collections import defaultdict

@dataclass
class TimeSlot:
    day: str
    time: str

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
                faculty_id = random.choice(subject["preferred_faculty_specializations"])
                self.courses.append(Course(
                    code=subject["code"],
                    name=subject["name"],
                    department=dept_code,
                    semester=subject["semester"],
                    credits=subject["credits"],
                    requires_lab=subject["requires_lab"],
                    faculty_id=faculty_id,
                    total_hours=subject["total_hours"]
                ))

    def generate_schedule(self) -> Dict:
        schedule = defaultdict(dict)
        
        # Track assignments
        faculty_assignments = defaultdict(set)  # faculty_id -> set of timeslots
        room_assignments = defaultdict(set)     # room_id -> set of timeslots
        
        for dept_code, dept_data in self.data["departments"].items():
            for section_id, section_data in dept_data["sections"].items():
                dept_courses = [c for c in self.courses if c.department == dept_code]
                
                for course in dept_courses:
                    # Calculate weekly class requirements
                    classes_per_week = self.calculate_weekly_classes(course.total_hours)
                    
                    # Schedule classes
                    scheduled_count = 0
                    while scheduled_count < classes_per_week:
                        # Find available slot
                        slot = self.find_available_slot(
                            course, 
                            faculty_assignments[course.faculty_id], 
                            section_id, 
                            room_assignments
                        )
                        
                        if slot:
                            time_slot, room = slot
                            key = f"{dept_code}_{section_data['batch']}_{section_data['section']}"
                            
                            schedule[key][str(time_slot)] = {
                                "course": course.name,
                                "faculty_id": course.faculty_id,
                                "room_id": room.id
                            }
                            
                            faculty_assignments[course.faculty_id].add(str(time_slot))
                            room_assignments[room.id].add(str(time_slot))
                            scheduled_count += 1
                            
                        else:
                            break  # Cannot schedule more classes for this course
        
        return schedule

    def calculate_weekly_classes(self, total_hours: int) -> int:
        weeks_in_semester = 16
        return round(total_hours / weeks_in_semester)

    def find_available_slot(self, course, faculty_slots, section_id, room_assignments):
        for day in range(1, 6):  # Monday to Friday
            for time in self.data["time_slots"]["times"]:
                time_slot = TimeSlot(str(day), time)
                
                # Check faculty availability
                if str(time_slot) in faculty_slots:
                    continue
                
                # Find available room
                for room in self.rooms:
                    if str(time_slot) in room_assignments[room.id]:
                        continue
                        
                    if (course.requires_lab and room.room_type == 'lab') or \
                       (not course.requires_lab and room.room_type == 'classroom'):
                        return time_slot, room
        
        return None