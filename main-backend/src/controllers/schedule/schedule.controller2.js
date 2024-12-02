import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { fastapidomain } from "../lib/domain.js";

const prisma = new PrismaClient();

export const fetchData = async () => {
    try {
        const Department = await prisma.departments.findMany({
            include: {
                faculty: {
                    include: {
                        users: true,
                        faculty_subject_mapping: {
                            include: {
                                subject_details: true
                            }
                        }
                    },
                },
                courses: {
                    include: {
                        subject_details: {
                            include: {
                                faculty_subject_mapping: {
                                    include: {
                                        faculty: true
                                    }
                                },
                                units: true,
                                syllabus_structure: {
                                    select: {
                                        semester: true
                                    }
                                }
                            }
                        },
                    },
                },
                sections: true,
            },
        });
        
        const Rooms = await prisma.rooms.findMany();
        const timeSlots = await prisma.timeslots.findMany();

        const result = {
            departments: {},
            rooms: [],
            time_slots: {
                days: [],
                times: [],
            },
        };

        Department.forEach((department) => {
            const deptCode = department.department_code;
            result.departments[deptCode] = {
                name: department.department_name,
                faculty: department.faculty.map(fac => ({
                    id: fac.faculty_id.toString(),
                    name: `${fac.users.first_name} ${fac.users.last_name}`,
                    department: deptCode,
                    specializations: fac.faculty_subject_mapping.map(
                        mapping => mapping.subject_details.subject_code
                    ),
                    preferred_times: null,
                    max_hours_per_day: fac.max_weekly_hours / 5,
                    unavailable_days: null,
                })),
                subjects: department.courses.flatMap(course =>
                    course.subject_details.map(subject => ({
                        code: subject.subject_code,
                        name: subject.subject_name,
                        department: deptCode,
                        semester: subject.syllabus_structure.semester,
                        credits: course.credits,
                        requires_lab: subject.subject_type === "lab",
                        preferred_faculty_specializations: subject.faculty_subject_mapping.map(
                            mapping => mapping.faculty.faculty_id.toString()
                        ),
                        total_hours: subject.units.reduce((acc, unit) => acc + unit.required_hours, 0),
                    }))
                ),
                sections: department.sections.reduce((acc, section) => {
                    acc[section.section_id] = {
                        batch: section.batch_year,
                        section: section.section_name,
                        strength: section.student_count,
                        semester: section.semester,
                    };
                    return acc;
                }, {}),
            };
        });

        Rooms.forEach(room => {
            result.rooms.push({
                id: room.room_id.toString(),
                name: room.room_number,
                capacity: room.capacity,
                room_type: room.room_type,
                facilities: room.features,
                building: "Main Building",
            });
        });

        timeSlots.forEach(slot => {
            result.time_slots.days.push(slot.day_of_week.toString());
            const time = new Date(slot.start_time).toISOString().split("T")[1];
            result.time_slots.times.push(time);
        });

        return result;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
};

const generateSchedule = async (req, res) => {
    try {
        // Fetch data using existing function
        const data = await fetchData();
        
        if (!data || !data.departments || Object.keys(data.departments).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No data available for schedule generation"
            });
        }

        // Send data to Python FastAPI backend
        const response = await axios.post(`${fastapidomain}/generate-schedule`, data);
        const schedule = response.data;

        // Save schedule to database
        const savedSchedule = await saveScheduleToDatabase(schedule);

        return res.status(200).json({
            success: true,
            message: "Schedule generated successfully",
            data: savedSchedule
        });

    } catch (error) {
        console.error("Error generating schedule:", error);
        return res.status(500).json({
            success: false,
            message: "Error generating schedule",
            error: error.message
        });
    }
};

const saveScheduleToDatabase = async (schedule) => {
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

    const savedClasses = await prisma.$transaction(async (prisma) => {
        const classes = [];

        for (const [sectionKey, timeSlots] of Object.entries(schedule)) {
            const [dept, batch, section] = sectionKey.split('_');
            
            for (const [timeSlot, classInfo] of Object.entries(timeSlots)) {
                const [day, time] = timeSlot.split(' ');
                
                const classEntry = await prisma.classes.create({
                    data: {
                        faculty: {
                            connect: { 
                                faculty_id: parseInt(classInfo.faculty_id)
                            }
                        },
                        sections: {
                            connect: {
                                section_id: parseInt(section)
                            }
                        },
                        rooms: {
                            connect: {
                                room_id: parseInt(classInfo.room_id)
                            }
                        },
                        start_date: new Date(),
                        end_date: sixMonthsFromNow,
                        is_active: true
                    }
                });
                
                classes.push(classEntry);
            }
        }

        return classes;
    });

    return savedClasses;
};


const getLatestSchedule = async (req, res) => {
    try {
        const latestClasses = await prisma.classes.findMany({
            where: {
                is_active: true,
            },
            include: {
                faculty: {
                    include: {
                        users: true
                    }
                },
                sections: {
                    include: {
                        departments: true
                    }
                },
                rooms: true,
                courses: true,
                timeslots: true
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        if (!latestClasses || latestClasses.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No schedule found"
            });
        }

        const formattedSchedule = {};

        latestClasses.forEach(classEntry => {
            const sectionKey = `${classEntry.sections.departments.department_code}_${classEntry.sections.batch_year}_${classEntry.sections.section_name}`;
            
            if (!formattedSchedule[sectionKey]) {
                formattedSchedule[sectionKey] = {
                    sectionInfo: {
                        departmentName: classEntry.sections.departments.department_name,
                        batchYear: classEntry.sections.batch_year,
                        sectionName: classEntry.sections.section_name
                    },
                    classes: {}
                };
            }

            const timeKey = `${classEntry.timeslots.day_of_week} ${classEntry.timeslots.start_time}`;
            formattedSchedule[sectionKey].classes[timeKey] = {
                course: classEntry.courses.course_name,
                faculty: {
                    name: `${classEntry.faculty.users.first_name} ${classEntry.faculty.users.last_name}`,
                    id: classEntry.faculty.faculty_id
                },
                room: {
                    number: classEntry.rooms.room_number,
                    id: classEntry.rooms.room_id
                },
                startTime: classEntry.timeslots.start_time,
                endTime: classEntry.timeslots.end_time,
                dayOfWeek: classEntry.timeslots.day_of_week
            };
        });

        return res.status(200).json({
            success: true,
            data: formattedSchedule
        });

    } catch (error) {
        console.error("Error fetching latest schedule:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching schedule",
            error: error.message
        });
    }
};


export { generateSchedule,getLatestSchedule };