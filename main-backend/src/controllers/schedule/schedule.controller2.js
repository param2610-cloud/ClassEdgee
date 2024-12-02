import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { fastapidomain } from "../../lib/domain.js";

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
                                subject_details: true,
                            },
                        },
                    },
                },
                courses: {
                    include: {
                        subject_details: {
                            include: {
                                faculty_subject_mapping: {
                                    include: {
                                        faculty: true,
                                    },
                                },
                                units: true,
                                syllabus_structure: {
                                    select: {
                                        semester: true,
                                    },
                                },
                            },
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
                faculty: department.faculty.map((fac) => ({
                    id: fac.faculty_id.toString(),
                    name: `${fac.users.first_name} ${fac.users.last_name}`,
                    department: deptCode,
                    specializations: fac.faculty_subject_mapping.map(
                        (mapping) => mapping.subject_details.subject_code
                    ),
                    preferred_times: null,
                    max_hours_per_day: fac.max_weekly_hours / 5,
                    unavailable_days: null,
                })),
                subjects: department.courses.flatMap((course) =>
                    course.subject_details.map((subject) => ({
                        code: subject.subject_code,
                        name: subject.subject_name,
                        department: deptCode,
                        semester: subject.syllabus_structure.semester,
                        credits: course.credits,
                        requires_lab: subject.subject_type === "lab",
                        preferred_faculty_specializations:
                            subject.faculty_subject_mapping.map((mapping) =>
                                mapping.faculty.faculty_id.toString()
                            ),
                        course_id: course.course_id.toString(),
                        total_hours: subject.units.reduce(
                            (acc, unit) => acc + unit.required_hours,
                            0
                        ),
                    }))
                ),
                sections: department.sections.reduce((acc, section) => {
                    acc[section.section_id] = {
                        batch: section.batch_year,
                        section: section.section_name,
                        strength: section.student_count,
                        semester: section.semester,
                        academic_year: section.academic_year,
                        section_id: section.section_id.toString(),
                    };
                    return acc;
                }, {}),
            };
        });

        Rooms.forEach((room) => {
            result.rooms.push({
                id: room.room_id.toString(),
                name: room.room_number,
                capacity: room.capacity,
                room_type: room.room_type,
                facilities: room.features,
                building: "Main Building",
            });
        });

        timeSlots.forEach((slot) => {
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

        if (
            !data ||
            !data.departments ||
            Object.keys(data.departments).length === 0
        ) {
            return res.status(400).json({
                success: false,
                message: "No data available for schedule generation",
            });
        }

        // Send data to Python FastAPI backend
        const response = await axios.post(
            `${fastapidomain}/generate-schedule`,
            data
        );
        const schedule = response.data;

        // Save schedule to database
        const savedSchedule = await saveScheduleToDatabase(schedule);

        return res.status(200).json({
            success: true,
            message: "Schedule generated successfully",
            data: savedSchedule,
        });
    } catch (error) {
        console.error("Error generating schedule:", error);
        return res.status(500).json({
            success: false,
            message: "Error generating schedule",
            error: error.message,
        });
    }
};

// const saveScheduleToDatabase = async (schedule) => {
//     const sixMonthsFromNow = new Date();
//     sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
//     console.log(schedule);

// const savedClasses = await prisma.$transaction(async (prisma) => {
//     const classes = [];

//     for (const [sectionKey, timeSlots] of Object.entries(schedule)) {
//         const [dept, batch, section] = sectionKey.split('_');

//         for (const [timeSlot, classInfo] of Object.entries(timeSlots)) {
//             const [day, time] = timeSlot.split(' ');
//             console.log(section);
//             console.log(classInfo);
//             const classEntry = await prisma.classes.create({
//                 data: {
//                     faculty: {
//                         connect: {
//                             faculty_id: parseInt(classInfo.faculty_id)
//                         }
//                     },
//                     sections: {
//                         connect: {
//                             section_id: parseInt(section)
//                         }
//                     },
//                     rooms: {
//                         connect: {
//                             room_id: parseInt(classInfo.room_id)
//                         }
//                     },
//                     start_date: new Date(),
//                     end_date: ,
//                     is_active: true,
//                     semester: classInfo.semester,
//                     academic_year:classInfo.academic_year,
//                     section_id: parseInt(classInfo.section_id),
//                 }
//             });

//             classes.push(classEntry);
//         }
//     }

//     return classes;
// });

// return savedClasses;
// };
const saveScheduleToDatabase = async (schedule) => {
    try {
        // Get today's date
        const today = new Date();

        // Generate dates for next month (excluding weekends)
        const dates = [];
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() + i);
            // Only include weekdays (0 = Sunday, 6 = Saturday)
            if (date.getDay() !== 0 && date.getDay() !== 6) {
                dates.push(date);
            }
        }

        // For each section in the schedule
        for (const [sectionKey, sectionSchedule] of Object.entries(schedule)) {
            // Process each time slot for this section
            for (const [timeSlotKey, classInfo] of Object.entries(
                sectionSchedule
            )) {
                // Parse day and time from the key (e.g., '1 10:00:00.000Z')
                const [dayOfWeek, timeString] = timeSlotKey.split(" ");

                // Convert timeString to a time object
                const time = new Date(`1970-01-01T${timeString}`);

                // Find matching time slot
                const timeSlot = await prisma.timeslots.findFirst({
                    where: {
                        day_of_week: parseInt(dayOfWeek),
                        start_time: time,
                    },
                });

                if (!timeSlot) {
                    console.error(
                        `No matching timeslot found for day ${dayOfWeek} and time ${timeString}`
                    );
                    continue;
                }

                // Create class entries for all matching dates in the next month
                const classEntries = dates
                    .filter((date) => date.getDay() === parseInt(dayOfWeek))
                    .map((date) => ({
                        course_id: parseInt(classInfo.course_id),
                        faculty_id: parseInt(classInfo.faculty_id),
                        room_id: parseInt(classInfo.room_id),
                        section_id: parseInt(classInfo.section_id),
                        slot_id: timeSlot.slot_id,
                        semester: classInfo.semester,
                        academic_year: classInfo.academic_year,
                        date_of_class: date,
                        is_active: true,
                    }));

                // Batch create all classes
                if (classEntries.length > 0) {
                    await prisma.classes.createMany({
                        data: classEntries,
                    });
                }
            }
        }
        return true;
        console.log("Successfully saved schedule to database");
    } catch (error) {
        console.error("Error saving schedule to database:", error);
        throw error;
    }
};

const getLatestSchedule = async (req, res) => {
    try {
        const {section_id} = req.params;
        const latestClasses = await prisma.classes.findMany({
            where: {
                is_active: true,
                section_id: parseInt(section_id),
            },
            include: {
                faculty: {
                    include: {
                        users: true,
                    },
                },
                sections: {
                    include: {
                        departments: true,
                    },
                },
                rooms: true,
                courses: true,
                timeslots: true,
            },
            orderBy: {
                created_at: "desc",
            },
        });

        if (!latestClasses || latestClasses.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No schedule found",
            });
        }
        


        return res.status(200).json({
            success: true,
            data: latestClasses,
        });
    } catch (error) {
        console.error("Error fetching latest schedule:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching schedule",
            error: error.message,
        });
    }
};

export { generateSchedule, getLatestSchedule };
