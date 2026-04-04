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
                        facultyavailability: true,
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
        const timeSlots = await prisma.timeslots.findMany({
            where: {
                day_of_week: {
                    gte: 1,
                    lte: 5,
                },
            },
            orderBy: [
                { day_of_week: "asc" },
                { start_time: "asc" },
            ],
        });

        const result = {
            departments: {},
            rooms: [],
            time_slots: [],
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
                    ).filter(Boolean),
                    max_hours_per_day:
                        fac.max_classes_per_day ||
                        Math.ceil((fac.max_weekly_hours || 40) / 5),
                    max_weekly_hours: fac.max_weekly_hours || 40,
                    availability_windows: fac.facultyavailability
                        .filter((availability) => availability.day_of_week !== null)
                        .map((availability) => ({
                            day_of_week: Number(availability.day_of_week),
                            start_time: availability.start_time
                                .toISOString()
                                .split("T")[1]
                                .split(".")[0],
                            end_time: availability.end_time
                                .toISOString()
                                .split("T")[1]
                                .split(".")[0],
                            is_preferred: Boolean(availability.is_preferred),
                        })),
                    preferred_slots: fac.preferred_slots || [],
                })),
                subjects: department.courses.flatMap((course) =>
                    course.subject_details.map((subject) => ({
                        code: subject.subject_code,
                        name: subject.subject_name,
                        subject_id: subject.subject_id.toString(),
                        course_id: course.course_id.toString(),
                        department: deptCode,
                        semester: subject.syllabus_structure.semester,
                        credits: course.credits,
                        requires_lab: subject.subject_type === "lab",
                        preferred_faculty: subject.faculty_subject_mapping.map(
                            (mapping) => mapping.faculty.faculty_id.toString()
                        ),
                        total_hours: subject.units.reduce(
                            (acc, unit) => acc + unit.required_hours,
                            0
                        ),
                        department_id: department.department_id.toString(),
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
            result.time_slots.push({
                slot_id: slot.slot_id.toString(),
                day: Number(slot.day_of_week),
                time: slot.start_time.toISOString().split("T")[1].split(".")[0],
            });
        });

        return result;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
};


const generateSchedule = async (req, res) => {
    try {
        const { created_by, semester_weeks } = req.body;
        if (!created_by) {
            return res.status(400).json({
                success: false,
                message: "Created by is required",
            });
        }

        // Fetch data using existing function
        const data = await fetchData();
        data.semester_weeks =
            Number.isFinite(Number(semester_weeks)) && Number(semester_weeks) > 0
                ? Number(semester_weeks)
                : 16;

        // Validate fetched data
        if (!data || !data.departments || Object.keys(data.departments).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No data available for schedule generation",
            });
        }

        try {
            // Send data to Python FastAPI backend
            const response = await axios.post(
                `${fastapidomain}/generate-schedule`,
                data
            );

            // Validate response from FastAPI
            if (!response.data) {
                throw new Error("Invalid response from schedule generator");
            }

            const solverStatus = response.data.status || "feasible";
            const solverMessage = response.data.message || null;

            if (solverStatus === "infeasible") {
                return res.status(422).json({
                    success: false,
                    message: solverMessage || "No feasible schedule could be generated for the given constraints.",
                    solver_status: "infeasible",
                });
            }

            const generatedSchedule = response.data.schedule || response.data;

            if (
                !generatedSchedule ||
                typeof generatedSchedule !== "object" ||
                Object.keys(generatedSchedule).length === 0
            ) {
                return res.status(422).send({
                    success: false,
                    message: "Schedule solver returned an empty result.",
                    solver_status: solverStatus,
                });
            }

            // Save schedule to database
            const savedSchedule = await saveScheduleToDatabase(
                generatedSchedule,
                Number(created_by),
                data.semester_weeks
            );

            return res.status(200).send({
                success: true,
                message: "Schedule generated successfully",
                solver_status: solverStatus,
                data: savedSchedule,
            });
        } catch (error) {
            console.error("Error in schedule generation process:", error);
            return res.status(500).send({
                success: false,
                message: "Error in schedule generation process",
                error: error.message,
            });
        }
    } catch (error) {
        console.error("Error in overall schedule generation:", error);
        return res.status(500).send({
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
// Helper function to get the first occurrence of a weekday from start date
const getFirstOccurrence = (startDate, targetDay) => {
    const date = new Date(startDate);
    const currentDay = date.getDay() || 7; // Convert Sunday (0) to 7
    const daysUntilTarget = (targetDay - currentDay + 7) % 7;
    date.setDate(date.getDate() + daysUntilTarget);
    return date;
};

const generateWeeklyDates = (startDate, dayOfWeek, totalWeeks = 16) => {
    const dates = [];
    const firstOccurrence = getFirstOccurrence(startDate, dayOfWeek);
    
    for (let i = 0; i < totalWeeks; i++) {
        const classDate = new Date(firstOccurrence);
        classDate.setDate(classDate.getDate() + (i * 7));
        dates.push(classDate);
    }
    
    return dates;
};

const saveScheduleToDatabase = async (schedule, user_id, semesterWeeks = 16) => {
    try {
        const startDate = new Date();
        const batchSize = 100; // Process in smaller batches
        let allClasses = [];

        const allTimeSlots = await prisma.timeslots.findMany({
            select: {
                slot_id: true,
                day_of_week: true,
                start_time: true,
            },
        });

        const timeSlotById = new Map();
        const timeSlotByKey = new Map();

        allTimeSlots.forEach((slot) => {
            const normalizedTime = slot.start_time
                .toISOString()
                .split("T")[1]
                .split(".")[0];

            timeSlotById.set(slot.slot_id, {
                slot_id: slot.slot_id,
                day_of_week: slot.day_of_week,
            });
            timeSlotByKey.set(`${slot.day_of_week}-${normalizedTime}`, {
                slot_id: slot.slot_id,
                day_of_week: slot.day_of_week,
            });
        });

        // Process each section in separate transactions
        for (const [sectionKey, timeSlots] of Object.entries(schedule)) {
            const [dept, batch, section] = sectionKey.split("_");
            const firstClassInfo = Object.values(timeSlots)[0];

            if (!firstClassInfo) {
                continue;
            }
            
            // Get department info outside transaction
            const department = await prisma.departments.findFirst({
                where: {
                    department_code: dept
                }
            });

            if (!department) {
                throw new Error(`Department not found for code: ${dept}`);
            }

            // Process this section's schedule in a transaction
            const sectionClasses = await prisma.$transaction(async (tx) => {
                const classes = [];
                // Find or create schedule meta
                let schedule_meta = await tx.schedule_meta.findFirst({
                    where: {
                        department_id: department.department_id,
                        batch_year: parseInt(batch),
                        semester: parseInt(firstClassInfo.semester),
                        academic_year: Number(firstClassInfo.academic_year),
                        section_id: parseInt(section)
                    }
                });

                if (!schedule_meta) {
                    schedule_meta = await tx.schedule_meta.create({
                        data: {
                            department_id: department.department_id,
                            batch_year: parseInt(batch),
                            semester: parseInt(firstClassInfo.semester),
                            academic_year: Number(firstClassInfo.academic_year),
                            created_by: user_id,
                            section_id: parseInt(section)
                        }
                    });
                }

                // Process time slots in batches
                const timeSlotEntries = Object.entries(timeSlots);
                for (let i = 0; i < timeSlotEntries.length; i += batchSize) {
                    const batchEntries = timeSlotEntries.slice(i, i + batchSize);
                    
                    for (const [timeSlot, classInfo] of batchEntries) {
                        const [day, time] = timeSlot.split(" ");
                        const parsedSlotId = classInfo.slot_id
                            ? Number(classInfo.slot_id)
                            : null;

                        let slotInfo =
                            (parsedSlotId && timeSlotById.get(parsedSlotId)) ||
                            timeSlotByKey.get(`${parseInt(day)}-${time}`);

                        if (!slotInfo) {
                            console.warn(`Time slot not found for ${timeSlot}`);
                            continue;
                        }

                        const slotId = slotInfo.slot_id;
                        const resolvedDayOfWeek = Number(slotInfo.day_of_week || parseInt(day));

                        if (!Number.isFinite(resolvedDayOfWeek)) {
                            console.warn(`Invalid day_of_week resolved for ${timeSlot}`);
                            continue;
                        }

                        const facultyId = Number(classInfo.faculty_id);
                        const roomId = Number(classInfo.room_id);
                        const sectionId = Number(classInfo.section_id);

                        if (
                            !Number.isFinite(facultyId) ||
                            !Number.isFinite(roomId) ||
                            !Number.isFinite(sectionId)
                        ) {
                            console.warn(`Invalid schedule payload for ${timeSlot}`);
                            continue;
                        }

                        // Find or create schedule details
                        let schedule_details = await tx.schedule_details.findFirst({
                            where: {
                                schedule_id: schedule_meta.schedule_id,
                                faculty_id: facultyId,
                                room_id: roomId,
                                timeslot_id: slotId,
                            }
                        });

                        if (!schedule_details) {
                            const parsedSubjectId = classInfo.subject_id
                                ? Number(classInfo.subject_id)
                                : null;

                            schedule_details = await tx.schedule_details.create({
                                data: {
                                    schedule_id: schedule_meta.schedule_id,
                                    faculty_id: facultyId,
                                    room_id: roomId,
                                    timeslot_id: slotId,
                                    subject_id: Number.isFinite(parsedSubjectId)
                                        ? parsedSubjectId
                                        : null,
                                }
                            });
                        }

                        const classDates = generateWeeklyDates(
                            startDate,
                            resolvedDayOfWeek,
                            semesterWeeks
                        );

                        const parsedCourseId = classInfo.course_id
                            ? Number(classInfo.course_id)
                            : null;

                        // Create classes in bulk
                        const classCreations = classDates.map(classDate => ({
                            academic_year: Number(classInfo.academic_year),
                            semester: Number(classInfo.semester),
                            section_id: sectionId,
                            faculty_id: facultyId,
                            room_id: roomId,
                            slot_id: slotId,
                            is_active: true,
                            course_id: Number.isFinite(parsedCourseId)
                                ? parsedCourseId
                                : null,
                            detail_id: schedule_details.detail_id,
                            date_of_class: classDate
                        }));

                        const createdClasses = await tx.classes.createMany({
                            data: classCreations
                        });

                        classes.push(...classCreations);
                    }
                }

                return classes;
            }, {
                maxWait: 10000,  // 5 seconds max wait
                timeout: 60000  // 10 seconds timeout
            });

            allClasses.push(...sectionClasses);
        }

        return allClasses;
    } catch (error) {
        console.error("Error saving schedule to database:", error);
        throw error;
    }
};

const getLatestSchedule = async (req, res) => {
    try {
        const { department_id, academic_year, batch_year, semester, section_id } = req.params;

        // Validate required parameters
        if (!department_id || !academic_year || !batch_year || !semester || !section_id) {
            return res.status(400).json({
                success: false,
                message: "Missing required parameters",
            });
        }

        // Get schedule metadata with proper filtering
        const schedule_meta_details = await prisma.schedule_meta.findMany({
            where: {
                department_id: parseInt(department_id),
                academic_year: parseInt(academic_year),
                batch_year: parseInt(batch_year),
                semester: parseInt(semester),
                sections: {
                    section_id: parseInt(section_id)
                }
            },
            orderBy: {
                created_at: 'desc'
            },
            take: 1,
            include: {
                sections: true
            }
        });

        if (!schedule_meta_details?.length) {
            return res.status(404).json({
                success: false,
                message: "No schedule found",
                debug: {
                    department_id,
                    academic_year,
                    batch_year,
                    semester,
                    section_id
                }
            });
        }

        // Get schedule details with related data
        const schedule_details = await prisma.schedule_details.findMany({
            where: {
                schedule_id: schedule_meta_details[0].schedule_id,
            },
            include: {
                faculty_schedule_details_faculty_idTofaculty: {
                    include: {
                        users: {
                            select: {
                                first_name: true,
                                last_name: true,
                            }
                        }
                    }
                },
                rooms_schedule_details_room_idTorooms: true,
                timeslots: true,
                subject_details: {
                    select: {
                        subject_name: true,
                        subject_code: true
                    }
                }
            }
        });

        return res.status(200).json({
            success: true,
            data: schedule_details,
            meta: schedule_meta_details[0]
        });
    } catch (error) {
        console.error("Error fetching schedule:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching schedule",
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Add this new function
const getAllSchedules = async (req, res) => {
    try {
        const schedules = await prisma.schedule_meta.findMany({
            include: {
                departments: {
                    select: {
                        department_name: true,
                        department_code: true
                    }
                },
                sections: {
                    select: {
                        section_name: true,
                        batch_year: true
                    }
                },
                schedule_details: {
                    include: {
                        faculty_schedule_details_faculty_idTofaculty: {
                            include: {
                                users: {
                                    select: {
                                        first_name: true,
                                        last_name: true
                                    }
                                }
                            }
                        },
                        rooms_schedule_details_room_idTorooms: true,
                        timeslots: true,
                        subject_details: {
                            select: {
                                subject_name: true,
                                subject_code: true
                            }
                        }
                    }
                },
                users: {
                    select: {
                        first_name: true,
                        last_name: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        // Group schedules by department and academic year
        const groupedSchedules = schedules.reduce((acc, schedule) => {
            const deptCode = schedule.departments.department_code;
            const academicYear = schedule.academic_year;
            
            if (!acc[deptCode]) {
                acc[deptCode] = {};
            }
            if (!acc[deptCode][academicYear]) {
                acc[deptCode][academicYear] = [];
            }
            
            acc[deptCode][academicYear].push(schedule);
            return acc;
        }, {});

        return res.status(200).json({
            success: true,
            data: groupedSchedules
        });
    } catch (error) {
        console.error("Error fetching schedules:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching schedules",
            error: error.message
        });
    }
};

export { generateSchedule, getLatestSchedule, getAllSchedules };
