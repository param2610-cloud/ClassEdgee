// Types
interface User {
    first_name: string;
    last_name: string;
    college_uid: string;
}

interface Section {
    section_id: string;
    section_name: string;
    batch_year: number;
    course_id: string;
    department_id: string;
    student_count: number;
    max_capacity: number;
    is_combined: boolean;
    parent_section_id: string | null;
    academic_year: number;
    semester: number;
    courses?: Course;
}

interface Course {
    course_id: string;
    course_code: string;
    course_name: string;
    department_id: string;
    credits: number;
}

interface Department {
    department_id: string;
    department_name: string;
    department_code: string;
    users: User[];
    sections: Section[];
}

interface Room {
    room_id: string;
    room_number: string;
}

interface TimeSlot {
    slot_id: string;
    start_time: string;
    end_time: string;
    day_of_week: number;
}

interface Faculty {
    faculty_id: string;
    users: User;
}

interface ClassSchedule {
    class_id: string;
    courses: Course;
    faculty: Faculty;
    rooms: Room;
    timeslots: TimeSlot;
}

// Component
import React, { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useAtom } from "jotai";
import { institutionIdAtom } from "@/store/atom";
import { domain } from "@/lib/constant";
import { Button } from "@/components/ui/button";

const WeeklySchedule: React.FC = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [selectedDept, setSelectedDept] = useState<Department | null>(null);
    const [selectedSection, setSelectedSection] = useState<string | null>(null);
    const [schedule, setSchedule] = useState<ClassSchedule[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [academic_year, setAcademicYear] = useState<number | null>(null);
    const [semester, setSemester] = useState<number | null>(null);
    const [batch_year, setBatchYear] = useState<number | null>(null);

    const [institution_id,setInstituteId] = useAtom(institutionIdAtom);

    useEffect(() => {
        if (institution_id) {
            fetchDepartments();
        }else{
            setInstituteId(localStorage.getItem('institution_id'));
        }
    }, [institution_id]);

    const fetchDepartments = async (): Promise<void> => {
        try {
            setLoading(true);
            const response = await fetch(`${domain}/api/v1/department/list-of-department`, {
                headers: {
                    "X-Institution-Id": `${institution_id}`,
                }
            });
            const data = await response.json();
            setDepartments(data.department);
        } catch (error) {
            console.error("Error fetching departments:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSchedule = async (sectionId: string): Promise<void> => {
        try {
            setLoading(true);
            const response = await fetch(`${domain}/api/v1/schedule/${selectedDept?.department_id}/${academic_year}/${batch_year}/${semester}/${sectionId}`);
            const data = await response.json();
            if(!response?.ok){
                console.log("Error fetching schedule:", data);
                
            }
            console.log(data);
            // amar mote tor uchit ekbar redownload kora repo ta  // gi
            setSchedule(data.data);
        } catch (error) {
            console.error("Error fetching schedule:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDepartmentChange = (deptId: string): void => {
        const dept = departments.find((d) => d.department_id === deptId);
        setSelectedDept(dept || null);
        setSelectedSection(null);
        setSchedule([]);
    };

    const handleSectionChange = (sectionId: string): void => {
        setSelectedSection(sectionId);
        fetchSchedule(sectionId);
    };


  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = [
    '10:00 - 11:00',
    '11:00 - 12:00',
    '12:00 - 13:00',
    '14:00 - 15:00',
    '15:00 - 16:00',
    '16:00 - 17:00'
  ];

  const getClassForTimeSlot = (dayIndex, timeSlot) => {
    // Convert timeSlot string to hour for comparison
    const hour = parseInt(timeSlot.split(':')[0]);
    
    return schedule.find(cls => {
      const slotHour = new Date(cls.timeslots.start_time).getUTCHours();
      return cls.timeslots.day_of_week === dayIndex && slotHour === hour;
    });
  };
    

    return (
        <div className="p-4">
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Weekly Class Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            onValueChange={handleDepartmentChange}
                            disabled={loading}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Department" />
                            </SelectTrigger>
                            <SelectContent>
                                {departments.map((dept) => (
                                    <SelectItem
                                        key={dept.department_id}
                                        value={dept.department_id}
                                    >
                                        {dept.department_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Select
                                onValueChange={(value) => setAcademicYear(parseInt(value))}
                                disabled={loading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Academic Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[2021, 2022, 2023, 2024].map((year) => (
                                        <SelectItem key={year} value={year.toString()}>
                                            {year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                onValueChange={(value) => setSemester(parseInt(value))}
                                disabled={loading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Semester" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[1, 2,3,4,5,6,7,8].map((sem) => (
                                        <SelectItem key={sem} value={sem.toString()}>
                                            Semester {sem}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                onValueChange={(value) => setBatchYear(parseInt(value))}
                                disabled={loading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Batch Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[2021, 2022, 2023, 2024].map((year) => (
                                        <SelectItem key={year} value={year.toString()}>
                                            {year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Select
                            onValueChange={handleSectionChange}
                            disabled={!selectedDept || loading}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Section" />
                            </SelectTrigger>
                            <SelectContent>
                                {selectedDept?.sections.map((section) => (
                                    <SelectItem
                                        key={section.section_id}
                                        value={section.section_id}
                                    >
                                        {section.section_name} {section.batch_year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            onClick={() => selectedSection && fetchSchedule(selectedSection)}
                            disabled={!selectedSection || loading || !academic_year || !semester || !batch_year}
                            className="bg-blue-500 text-white px-4 py-2 rounded"
                        >
                            Fetch Schedule
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {loading && (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin" />
                </div>
            )}

            {!loading && schedule.length > 0 && (
                <Card className="w-full">
                <CardHeader>
                  <CardTitle>Weekly Class Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          <th className="border p-2 bg-gray-100">Time</th>
                          {days.map(day => (
                            <th key={day} className="border p-2 bg-gray-100 min-w-[200px]">
                              {day}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {timeSlots.map(timeSlot => (
                          <tr key={timeSlot}>
                            <td className="border p-2 font-medium whitespace-nowrap">
                              {timeSlot}
                            </td>
                            {days.map((day, dayIndex) => {
                              const classInfo = getClassForTimeSlot(dayIndex + 1, timeSlot);
                              return (
                                <td key={`${day}-${timeSlot}`} className="border p-2">
                                  {classInfo && (
                                    <div className="text-sm">
                                      <div className="font-medium">
                                        Faculty: {classInfo.faculty_schedule_details_faculty_idTofaculty.users.first_name}{' '}
                                        {classInfo.faculty_schedule_details_faculty_idTofaculty.users.last_name}
                                      </div>
                                      <div className="text-gray-600">
                                        Room: {classInfo.rooms_schedule_details_room_idTorooms.room_number}
                                        {classInfo.rooms_schedule_details_room_idTorooms.wing && 
                                          ` (${classInfo.rooms_schedule_details_room_idTorooms.wing} Wing)`}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {classInfo.rooms_schedule_details_room_idTorooms.room_type === 'lab' ? 'Lab Session' : 'Classroom'}
                                      </div>
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
        </div>
    );
};

export default WeeklySchedule;