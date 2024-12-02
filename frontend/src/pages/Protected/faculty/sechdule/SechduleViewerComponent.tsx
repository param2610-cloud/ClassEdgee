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

const WeeklySchedule: React.FC = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [selectedDept, setSelectedDept] = useState<Department | null>(null);
    const [selectedSection, setSelectedSection] = useState<string | null>(null);
    const [schedule, setSchedule] = useState<ClassSchedule[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const [institution_id,setInstituteId] = useAtom(institutionIdAtom);

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const timeSlots = Array.from({ length: 8 }, (_, i) => {
        const hour = i + 9; // Starting from 9 AM
        return `${hour}:00 - ${hour + 1}:00`;
    });

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
            const response = await fetch(`${domain}/api/v1/schedule/latest/${sectionId}`);
            const data = await response.json();
            console.log(data);
            
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

    const getClassForTimeSlot = (day: string, time: string): ClassSchedule | undefined => {
        return schedule.find(
            (cls) =>
                cls.timeslots.day_of_week === days.indexOf(day) + 1 &&
                new Date(cls.timeslots.start_time).getHours() === parseInt(time.split(":")[0])
        );
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
                    </div>
                </CardContent>
            </Card>

            {loading && (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin" />
                </div>
            )}

            {!loading && schedule.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="border p-2 bg-gray-100">Time</th>
                                {days.map((day) => (
                                    <th key={day} className="border p-2 bg-gray-100">
                                        {day}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {timeSlots.map((timeSlot) => (
                                <tr key={timeSlot}>
                                    <td className="border p-2 font-medium">
                                        {timeSlot}
                                    </td>
                                    {days.map((day) => {
                                        const classInfo = getClassForTimeSlot(day, timeSlot);
                                        return (
                                            <td
                                                key={`${day}-${timeSlot}`}
                                                className="border p-2"
                                            >
                                                {classInfo && (
                                                    <div className="text-sm">
                                                        <div className="font-medium">
                                                            {classInfo.courses.course_name}
                                                        </div>
                                                        <div>
                                                            {classInfo.faculty.users.first_name}{" "}
                                                            {classInfo.faculty.users.last_name}
                                                        </div>
                                                        <div>
                                                            Room: {classInfo.rooms.room_number}
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
            )}
        </div>
    );
};

export default WeeklySchedule;