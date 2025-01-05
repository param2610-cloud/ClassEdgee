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
        const {created_by} = req.body;
        // Fetch data using existing function
        const data = await fetchData();
        const user_id = created_by;
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
        const savedSchedule = await saveScheduleToDatabase(schedule,user_id);

        return res.status(200).send({
            success: true,
            message: "Schedule generated successfully",
            data: savedSchedule,
        });
    } catch (error) {
        console.error("Error generating schedule:", error);
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

// Helper function to generate 4 weekly dates
const generateWeeklyDates = (startDate, dayOfWeek) => {
    const dates = [];
    const firstOccurrence = getFirstOccurrence(startDate, dayOfWeek);
    
    for (let i = 0; i < 4; i++) {
        const classDate = new Date(firstOccurrence);
        classDate.setDate(classDate.getDate() + (i * 7));
        dates.push(classDate);
    }
    
    return dates;
};

const saveScheduleToDatabase = async (schedule, user_id) => {
    try {
        const startDate = new Date();
        const batchSize = 100; // Process in smaller batches
        let allClasses = [];

        // Pre-fetch time slots outside the transaction
        const timeSlotMap = new Map();
        const uniqueTimeSlots = new Set();
        
        Object.entries(schedule).forEach(([_, timeSlots]) => {
            Object.keys(timeSlots).forEach(timeSlot => {
                const [day, time] = timeSlot.split(" ");
                uniqueTimeSlots.add(`${day}-${time}`);
            });
        });

        // Fetch all required time slots at once
        for (const timeSlotKey of uniqueTimeSlots) {
            const [day, time] = timeSlotKey.split("-");
            const startTime = new Date(`1970-01-01T${time}`);
            const timeSlot = await prisma.timeslots.findFirst({
                where: {
                    day_of_week: parseInt(day),
                    start_time: startTime,
                },
                select: {
                    slot_id: true
                }
            });
            if (timeSlot) {
                timeSlotMap.set(timeSlotKey, timeSlot.slot_id);
            }
        }

        // Process each section in separate transactions
        for (const [sectionKey, timeSlots] of Object.entries(schedule)) {
            const [dept, batch, section] = sectionKey.split("_");
            
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
                        semester: parseInt(Object.values(timeSlots)[0].semester),
                        academic_year: Object.values(timeSlots)[0].academic_year,
                        section_id: parseInt(section)
                    }
                });

                if (!schedule_meta) {
                    schedule_meta = await tx.schedule_meta.create({
                        data: {
                            department_id: department.department_id,
                            batch_year: parseInt(batch),
                            semester: parseInt(Object.values(timeSlots)[0].semester),
                            academic_year: Object.values(timeSlots)[0].academic_year,
                            created_by: user_id,
                            section_id: parseInt(section)
                        }
                    });
                }

                // Process time slots in batches
                const timeSlotEntries = Object.entries(timeSlots);
                for (let i = 0; i < timeSlotEntries.length; i += batchSize) {
                    const batch = timeSlotEntries.slice(i, i + batchSize);
                    
                    for (const [timeSlot, classInfo] of batch) {
                        const [day, time] = timeSlot.split(" ");
                        const timeSlotKey = `${day}-${time}`;
                        const slotId = timeSlotMap.get(timeSlotKey);

                        if (!slotId) {
                            console.warn(`Time slot not found for ${timeSlotKey}`);
                            continue;
                        }

                        // Find or create schedule details
                        let schedule_details = await tx.schedule_details.findFirst({
                            where: {
                                schedule_id: schedule_meta.schedule_id,
                                faculty_id: parseInt(classInfo.faculty_id),
                                room_id: parseInt(classInfo.room_id),
                                timeslot_id: slotId,
                            }
                        });

                        if (!schedule_details) {
                            schedule_details = await tx.schedule_details.create({
                                data: {
                                    schedule_id: schedule_meta.schedule_id,
                                    faculty_id: parseInt(classInfo.faculty_id),
                                    room_id: parseInt(classInfo.room_id),
                                    timeslot_id: slotId,
                                }
                            });
                        }

                        // Generate weekly dates
                        const classDates = generateWeeklyDates(startDate, parseInt(day));

                        // Create classes in bulk
                        const classCreations = classDates.map(classDate => ({
                            academic_year: classInfo.academic_year,
                            semester: classInfo.semester,
                            section_id: parseInt(classInfo.section_id),
                            faculty_id: parseInt(classInfo.faculty_id),
                            room_id: parseInt(classInfo.room_id),
                            slot_id: slotId,
                            is_active: true,
                            course_id: parseInt(classInfo.course_id),
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
        console.log(req.params);
        
        const {department_id,academic_year,batch_year,semester,section_id} = req.params;
        console.log(section_id);
        
        const schedule_meta_details = await prisma.schedule_meta.findMany({
            where: {
                section_id:parseInt(section_id),
            }
        });
        console.log(schedule_meta_details);
        
        if(!schedule_meta_details[0].schedule_id){
            return res.status(404).json({
                success: false,
                message: "No schedule found",
            });
        }
        const schedule_details = await prisma.schedule_details.findMany({
            where: {
                schedule_id:schedule_meta_details[0].schedule_id
            },
            include:{
                faculty_schedule_details_faculty_idTofaculty:{
                    include:{
                        users:true
                    }
                },
                rooms_schedule_details_room_idTorooms:true,
                timeslots:true,

            }
        });

        if (!schedule_details || schedule_details.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No schedule found",
            });
        }
        


        return res.status(200).json({
            success: true,
            data: schedule_details,
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
