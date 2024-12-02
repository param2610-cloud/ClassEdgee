from typing import List, Dict, Set
import random
from dataclasses import dataclass
import json
from collections import defaultdict
import pandas as pd

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
    faculty: str
    total_hours: int

@dataclass
class Room:
    id: str
    name: str
    capacity: int
    room_type: str
    facilities: List[str]
    building: str

@dataclass
class Section:
    department: str
    batch: int
    section: str
    strength: int

class ScheduleGenerator:
    def __init__(self, test_data_file: str = "college_test_data.json"):
        self.days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
        self.times = ["9:00", "10:00", "11:00", "12:00", "2:00", "3:00", "4:00"]
        self.time_slots = [TimeSlot(day, time) for day in self.days for time in self.times]
        
        # Load test data
        with open(test_data_file, 'r') as f:
            self.test_data = json.load(f)
        
        self.departments = list(self.test_data["departments"].keys())
        
    def generate_sample_data(self):
        # Generate rooms from test data
        self.rooms = [
            Room(
                id=room["id"],
                name=room["name"],
                capacity=room["capacity"],
                room_type=room["room_type"],
                facilities=room["facilities"],
                building=room["building"]
            )
            for room in self.test_data["rooms"]
        ]
        
        # Generate courses and sections from test data
        self.courses = []
        self.sections = []
        
        for dept_code, dept_data in self.test_data["departments"].items():
            # Add courses
            for subject in dept_data["subjects"]:
                faculty = random.choice(dept_data["faculty"])
                course = Course(
                    code=subject["code"],
                    name=subject["name"],
                    department=dept_code,
                    semester=subject["semester"],
                    credits=subject["credits"],
                    requires_lab=subject["requires_lab"],
                    total_hours=subject["total_hours"],
                    faculty=faculty["name"]
                )
                self.courses.append(course)
            
            # Add sections
            for section_id, section_data in dept_data["sections"].items():
                section = Section(
                    department=dept_code,
                    batch=section_data["batch"],
                    section=section_data["section"],
                    strength=section_data["strength"]
                )
                self.sections.append(section)
    
    def calculate_class_limits(self, total_hours: int) -> tuple:
        """Calculate weekly and daily class limits based on total hours"""
        total_weeks = 12  # Assuming a 12-week semester
        classes_per_week = round(total_hours / (total_weeks * 1))  # Each class is 1 hour
        classes_per_day = round(classes_per_week / 5)  # 5 working days
        return classes_per_week, classes_per_day

    def generate_schedule(self) -> Dict:
        self.generate_sample_data()
        schedule = defaultdict(dict)
        faculty_schedule = set()
        room_schedule = set()
        
        # Track class frequencies
        weekly_class_count = defaultdict(int)  # (course_code, section) -> count
        daily_class_count = defaultdict(lambda: defaultdict(int))  # (course_code, section, day) -> count
        
        # For each section
        for section in self.sections:
            # Get relevant courses for this section's department
            dept_courses = [c for c in self.courses if c.department == section.department]
            
            # Calculate limits for each course
            course_limits = {
                course.code: self.calculate_class_limits(course.total_hours) 
                for course in dept_courses
            }
            
            # Schedule each course
            for course in dept_courses:
                scheduled = False
                random.shuffle(self.time_slots)
                
                weekly_limit, daily_limit = course_limits[course.code]
                course_section_key = (course.code, f"{section.department}_{section.batch}_{section.section}")
                
                # Skip if weekly limit reached
                if weekly_class_count[course_section_key] >= weekly_limit:
                    continue
                
                for time_slot in self.time_slots:
                    # Skip if daily limit reached
                    if daily_class_count[course_section_key][time_slot.day] >= daily_limit:
                        continue
                        
                    # Check faculty availability
                    if (course.faculty, str(time_slot)) in faculty_schedule:
                        continue
                    
                    # Find available room
                    available_room = None
                    for room in self.rooms:
                        if (room.name, str(time_slot)) not in room_schedule and \
                           room.capacity >= section.strength and \
                           ((course.requires_lab and room.room_type == 'lab') or \
                            (not course.requires_lab and room.room_type == 'classroom')):
                            available_room = room
                            break
                    
                    if available_room:
                        # Schedule the class
                        key = (section.department, section.batch, section.section)
                        if str(time_slot) not in schedule[key]:
                            schedule[key][str(time_slot)] = {
                                'course': course.name,
                                'faculty': course.faculty,
                                'room': available_room.name
                            }
                            faculty_schedule.add((course.faculty, str(time_slot)))
                            room_schedule.add((available_room.name, str(time_slot)))
                            
                            # Update counters
                            weekly_class_count[course_section_key] += 1
                            daily_class_count[course_section_key][time_slot.day] += 1
                            
                            scheduled = True
                            break
                
                if not scheduled:
                    print(f"Warning: Could not schedule {course.name} for {section}")
        
        return schedule
    def print_schedule(self, schedule: Dict):
        for (dept, batch, section), timeslots in schedule.items():
            print(f"\nSchedule for {dept} Batch {batch} Section {section}:")
            print("=" * 50)
            for day in self.days:
                print(f"\n{day}:")
                for time in self.times:
                    time_slot = str(TimeSlot(day, time))
                    if time_slot in timeslots:
                        class_info = timeslots[time_slot]
                        print(f"{time}: {class_info['course']} - {class_info['faculty']} - {class_info['room']}")
                    else:
                        print(f"{time}: ---")

    def _convert_schedule_for_json(self, schedule: Dict) -> Dict:
        """Convert schedule with tuple keys to JSON-serializable format"""
        converted_schedule = {}
        
        for key, value in schedule.items():
            # Convert tuple key to string
            json_key = f"{key[0]}_{key[1]}_{key[2]}"
            converted_schedule[json_key] = value
            
        return converted_schedule
    
    def _restore_schedule_from_json(self, json_schedule: Dict) -> Dict:
        """Restore schedule with tuple keys from JSON format"""
        restored_schedule = defaultdict(dict)
        
        for key, value in json_schedule.items():
            # Convert string key back to tuple
            dept, batch, section = key.split('_')
            restored_key = (dept, int(batch), section)
            restored_schedule[restored_key] = value
            
        return restored_schedule

    def save_schedule(self, schedule: Dict, filename: str = "generated_schedule.json") -> str:
        """Save the generated schedule to a JSON file"""
        converted_schedule = self._convert_schedule_for_json(schedule)
        with open(filename, 'w') as f:
            json.dump(converted_schedule, f, indent=2)
        return filename
    
    def load_schedule(self, filename: str) -> Dict:
        """Load a schedule from a JSON file"""
        with open(filename, 'r') as f:
            json_schedule = json.load(f)
        return self._restore_schedule_from_json(json_schedule)
    def save_schedule_excel(self, schedule: Dict, filename: str = "generated_schedule.xlsx") -> str:
        """
        Save the generated schedule to an Excel file with multiple sheets:
        1. One sheet per section with their weekly timetable
        2. One sheet for faculty schedules
        3. One sheet for room utilization
        """
        with pd.ExcelWriter(filename, engine='openpyxl') as writer:
            # Create section-wise timetables
            for (dept, batch, section), timeslots in schedule.items():
                # Create a DataFrame for this section
                df = pd.DataFrame(index=self.times, columns=self.days)
                
                # Fill in the schedule
                for time_slot, class_info in timeslots.items():
                    day, time = str(time_slot).split()
                    cell_content = (f"{class_info['course']}\n"
                                  f"Faculty: {class_info['faculty']}\n"
                                  f"Room: {class_info['room']}")
                    df.at[time, day] = cell_content
                
                # Fill NaN values with empty strings
                df = df.fillna("")
                
                # Save to sheet
                sheet_name = f"{dept}_{batch}_{section}"
                df.to_excel(writer, sheet_name=sheet_name)
                
                # Auto-adjust column widths
                worksheet = writer.sheets[sheet_name]
                for column in worksheet.columns:
                    max_length = max(len(str(cell.value or "")) for cell in column)
                    worksheet.column_dimensions[column[0].column_letter].width = max_length + 5

            # Create faculty schedule sheet
            faculty_schedules = defaultdict(lambda: pd.DataFrame(index=self.times, columns=self.days))
            room_schedules = defaultdict(lambda: pd.DataFrame(index=self.times, columns=self.days))
            
            # Collect faculty and room schedules
            for (dept, batch, section), timeslots in schedule.items():
                for time_slot, class_info in timeslots.items():
                    day, time = str(time_slot).split()
                    faculty = class_info['faculty']
                    room = class_info['room']
                    
                    # Add to faculty schedule
                    faculty_content = f"{class_info['course']}\n{dept} {batch} {section}\nRoom: {room}"
                    faculty_schedules[faculty].at[time, day] = faculty_content
                    
                    # Add to room schedule
                    room_content = f"{class_info['course']}\n{dept} {batch} {section}\nFaculty: {faculty}"
                    room_schedules[room].at[time, day] = room_content
            
            # Save faculty schedules
            for faculty, df in faculty_schedules.items():
                df = df.fillna("")
                sheet_name = f"Faculty_{faculty.replace(' ', '_')}"[:31]  # Excel sheet name length limit
                df.to_excel(writer, sheet_name=sheet_name)
                
                # Auto-adjust column widths
                worksheet = writer.sheets[sheet_name]
                for column in worksheet.columns:
                    max_length = max(len(str(cell.value or "")) for cell in column)
                    worksheet.column_dimensions[column[0].column_letter].width = max_length + 5
            
            # Save room schedules
            for room, df in room_schedules.items():
                df = df.fillna("")
                sheet_name = f"Room_{room.replace(' ', '_')}"[:31]  # Excel sheet name length limit
                df.to_excel(writer, sheet_name=sheet_name)
                
                # Auto-adjust column widths
                worksheet = writer.sheets[sheet_name]
                for column in worksheet.columns:
                    max_length = max(len(str(cell.value or "")) for cell in column)
                    worksheet.column_dimensions[column[0].column_letter].width = max_length + 5

        return filename
    def save_schedule_json(self, schedule: Dict, filename: str = "generated_schedule.json") -> str:
        """Save schedule to JSON with tuple keys converted to string format"""
        converted_schedule = {}
        for (dept, batch, section), value in schedule.items():
            json_key = f"{dept}_{batch}_{section}"
            converted_schedule[json_key] = value
            
        with open(filename, 'w') as f:
            json.dump(converted_schedule, f, indent=2)
        return filename

def main():
     # First ensure you have generated test data using TestDataGenerator
    scheduler = ScheduleGenerator("data.json")
    schedule = scheduler.generate_schedule()
    
    # Save the schedule to Excel
    json_file = scheduler.save_schedule_json(schedule)
    print(f"\nSchedule has been saved to {json_file}")
    
    # Print the schedule
    scheduler.print_schedule(schedule)



if __name__ == "__main__": main()