import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Search } from "lucide-react";
import { useAtom } from "jotai";
import { institutionIdAtom } from "@/store/atom";
import { domain } from "@/lib/constant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ScheduleDetail {
    timeslots: {
        start_time: string;
        end_time: string;
        day_of_week: number;
    };
    faculty_schedule_details_faculty_idTofaculty: {
        users: {
            first_name: string;
            last_name: string;
        };
    };
    rooms_schedule_details_room_idTorooms: {
        room_number: string;
        wing: string;
        room_type: string;
    };
    subject_details: {
        subject_name: string;
        subject_code: string;
    };
}

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
    faculty_schedule_details_faculty_idTofaculty: {
        users: {
            first_name: string;
            last_name: string;
        };
    };
    rooms_schedule_details_room_idTorooms: {
        room_number: string;
        wing: string;
        room_type: string;
    };
    subject_details: {
        subject_name: string;
        subject_code: string;
    };
}

// interface GroupedSchedule {
//     [department: string]: {
//         [academicYear: string]: ScheduleMeta[];
//     };
// }

interface ScheduleMeta {
    schedule_id: number;
    department_id: number;
    academic_year: number;
    semester: number;
    batch_year: number;
    departments: {
        department_name: string;
        department_code: string;
    };
    sections: {
        section_name: string;
        batch_year: number;
    };
    schedule_details: ScheduleDetail[];
    users: {
        first_name: string;
        last_name: string;
    };
}

// Component
const WeeklySchedule: React.FC = () => {
    // const navigate = useNavigate();
    const [departments, setDepartments] = useState<Department[]>([]);
    const [selectedDept, setSelectedDept] = useState<Department | null>(null);
    const [selectedSection, setSelectedSection] = useState<string | null>(null);
    const [schedule, setSchedule] = useState<ClassSchedule[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [academic_year, setAcademicYear] = useState<number | null>(null);
    const [semester, setSemester] = useState<number | null>(null);
    const [batch_year, setBatchYear] = useState<number | null>(null);

    const [institution_id, setInstituteId] = useAtom(institutionIdAtom);

    useEffect(() => {
        if (institution_id) {
            fetchDepartments();
        } else {
            setInstituteId(localStorage.getItem("institution_id") ? Number(localStorage.getItem("institution_id")) : null);
        }
    }, [institution_id]);

    const fetchDepartments = async (): Promise<void> => {
        try {
            setLoading(true);
            const response = await fetch(
                `${domain}/api/v1/department/list-of-department`,
                {
                    headers: {
                        "X-Institution-Id": `${institution_id}`,
                    },
                }
            );
            const data = await response.json();
            setDepartments(data.department);
        } catch (error) {
            console.error("Error fetching departments:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSchedule = async (sectionId: string): Promise<void> => {
        if (
            !selectedDept?.department_id ||
            !academic_year ||
            !batch_year ||
            !semester ||
            !sectionId
        ) {
            console.error("Missing required parameters");
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(
                `${domain}/api/v1/schedule/${selectedDept.department_id}/${academic_year}/${batch_year}/${semester}/${sectionId}`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch schedule");
            }

            // Validate and transform schedule data with better error handling
            const validScheduleData =
                data.data
                    ?.map((item: any) => {
                        try {
                            return {
                                ...item,
                                faculty_schedule_details_faculty_idTofaculty: {
                                    ...item.faculty_schedule_details_faculty_idTofaculty,
                                    users: item
                                        .faculty_schedule_details_faculty_idTofaculty
                                        ?.users || {
                                        first_name: "Unknown",
                                        last_name: "Faculty",
                                    },
                                },
                                rooms_schedule_details_room_idTorooms:
                                    item.rooms_schedule_details_room_idTorooms || {
                                        room_number: "TBD",
                                        wing: "",
                                        room_type: "classroom",
                                    },
                                timeslots: item.timeslots || {
                                    start_time: "",
                                    end_time: "",
                                    day_of_week: 1,
                                },
                                subject_details: item.subject_details || {
                                    subject_name: "Unknown Subject",
                                    subject_code: "N/A",
                                },
                            };
                        } catch (err) {
                            console.error(
                                "Error processing schedule item:",
                                err
                            );
                            return null;
                        }
                    })
                    .filter(Boolean) || [];

            setSchedule(validScheduleData);
        } catch (error) {
            console.error("Error fetching schedule:", error);
            setSchedule([]);
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

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const timeSlots = [
        "10:00 - 11:00",
        "11:00 - 12:00",
        "12:00 - 13:00",
        "14:00 - 15:00",
        "15:00 - 16:00",
        "16:00 - 17:00",
    ];

    const getClassForTimeSlot = (dayIndex: number, timeSlot: string) => {
        try {
            const [startHour] = timeSlot.split(" - ")[0].split(":");
            const hour = parseInt(startHour);

            return schedule.find((cls) => {
                if (!cls.timeslots?.start_time) return false;

                const slotStartTime = new Date(`1970-01-01T${cls.timeslots.start_time}`);
                const slotHour = slotStartTime.getHours();
                return (
                    cls.timeslots.day_of_week === dayIndex && 
                    slotHour === hour
                );
            });
        } catch (error) {
            console.error("Error processing time slot:", error);
            return null;
        }
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
                                onValueChange={(value) =>
                                    setAcademicYear(parseInt(value))
                                }
                                disabled={loading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Academic Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[2021, 2022, 2023, 2024].map((year) => (
                                        <SelectItem
                                            key={year}
                                            value={year.toString()}
                                        >
                                            {year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                onValueChange={(value) =>
                                    setSemester(parseInt(value))
                                }
                                disabled={loading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Semester" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                                        <SelectItem
                                            key={sem}
                                            value={sem.toString()}
                                        >
                                            Semester {sem}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                onValueChange={(value) =>
                                    setBatchYear(parseInt(value))
                                }
                                disabled={loading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Batch Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[2021, 2022, 2023, 2024].map((year) => (
                                        <SelectItem
                                            key={year}
                                            value={year.toString()}
                                        >
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
                                        {section.section_name}{" "}
                                        {section.batch_year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            onClick={() =>
                                selectedSection &&
                                fetchSchedule(selectedSection)
                            }
                            disabled={
                                !selectedSection ||
                                loading ||
                                !academic_year ||
                                !semester ||
                                !batch_year
                            }
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
                                        <th className="border p-2 bg-gray-100">
                                            Time
                                        </th>
                                        {days.map((day) => (
                                            <th
                                                key={day}
                                                className="border p-2 bg-gray-100 min-w-[200px]"
                                            >
                                                {day}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {timeSlots.map((timeSlot) => (
                                        <tr key={timeSlot}>
                                            <td className="border p-2 font-medium whitespace-nowrap">
                                                {timeSlot}
                                            </td>
                                            {days.map((day, dayIndex) => {
                                                const classInfo =
                                                    getClassForTimeSlot(
                                                        dayIndex + 1,
                                                        timeSlot
                                                    );
                                                return (
                                                    <td
                                                        key={`${day}-${timeSlot}`}
                                                        className="border p-2"
                                                    >
                                                        {classInfo && (
                                                            <div className="text-sm">
                                                                <div className="font-medium">
                                                                    Faculty:{" "}
                                                                    {
                                                                        classInfo
                                                                            .faculty_schedule_details_faculty_idTofaculty
                                                                            .users
                                                                            .first_name
                                                                    }{" "}
                                                                    {
                                                                        classInfo
                                                                            .faculty_schedule_details_faculty_idTofaculty
                                                                            .users
                                                                            .last_name
                                                                    }
                                                                </div>
                                                                <div className="text-gray-600">
                                                                    Room:{" "}
                                                                    {
                                                                        classInfo
                                                                            .rooms_schedule_details_room_idTorooms
                                                                            .room_number
                                                                    }
                                                                    {classInfo
                                                                        .rooms_schedule_details_room_idTorooms
                                                                        .wing &&
                                                                        ` (${classInfo.rooms_schedule_details_room_idTorooms.wing} Wing)`}
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    {classInfo
                                                                        .rooms_schedule_details_room_idTorooms
                                                                        .room_type ===
                                                                    "lab"
                                                                        ? "Lab Session"
                                                                        : "Classroom"}
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

const ScheduleViewer: React.FC = () => {
    const navigate = useNavigate();
    const [filteredSchedules, setFilteredSchedules] = useState<ScheduleMeta[]>([]);
    // const [loading, setLoading] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState<string>("");
    const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [allSchedules, setAllSchedules] = useState<ScheduleMeta[]>([]);

    useEffect(() => {
        // In your actual implementation, you'll get this from your API/state management
        const mockSchedules: ScheduleMeta[] = [
            // Your schedule data array
        ];
        setAllSchedules(mockSchedules);
        setFilteredSchedules(mockSchedules);
    }, []);

    useEffect(() => {
        filterSchedules();
    }, [selectedDepartment, selectedAcademicYear, searchTerm]);

    const filterSchedules = () => {
        let filtered = [...allSchedules];

        // Filter by department
        if (selectedDepartment) {
            filtered = filtered.filter(
                schedule => schedule.departments.department_code === selectedDepartment
            );
        }

        // Filter by academic year
        if (selectedAcademicYear) {
            filtered = filtered.filter(
                schedule => schedule.academic_year.toString() === selectedAcademicYear
            );
        }

        // Filter by search term
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(schedule => 
                schedule.departments.department_name.toLowerCase().includes(searchLower) ||
                schedule.sections.section_name.toLowerCase().includes(searchLower) ||
                schedule.users.first_name.toLowerCase().includes(searchLower) ||
                schedule.users.last_name.toLowerCase().includes(searchLower)
            );
        }

        setFilteredSchedules(filtered);
    };

    return (
        <div className="p-4">
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Schedule Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search schedules..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-8"
                                />
                            </div>
                        </div>
                        <Select
                            value={selectedDepartment}
                            onValueChange={setSelectedDepartment}
                        >
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Department" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Departments</SelectItem>
                                {/* Add your department options */}
                            </SelectContent>
                        </Select>
                        <Select
                            value={selectedAcademicYear}
                            onValueChange={setSelectedAcademicYear}
                        >
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Academic Year" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Years</SelectItem>
                                {[2021, 2022, 2023, 2024].map(year => (
                                    <SelectItem key={year} value={year.toString()}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredSchedules.map((schedule) => (
                            <Card
                                key={schedule.schedule_id}
                                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => navigate(`/schedule/${schedule.schedule_id}`)}
                            >
                                {/* Existing card content */}
                                {/* ...existing card JSX... */}
                            </Card>
                        ))}
                    </div>

                    {filteredSchedules.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No schedules found matching your criteria
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default WeeklySchedule;
export { ScheduleViewer };
