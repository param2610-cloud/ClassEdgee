import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const generateSchedule = async (req, res) => {
    try {
        const { batch_year, semester, course_id, duration } = req.body;

        // 1. Collect all required data
        const [courseData, sectionData, syllabusData, timeSlots, availableRooms] = await Promise.all([
            // Get course information
            prisma.courses.findUnique({
                where: { course_id }
            }),
            // Get sections for the batch
            prisma.sections.findMany({
                where: { batch_year, semester }
            }),
            // Get syllabus structure
            prisma.syllabus_structure.findFirst({
                where: { course_id, semester }
            }),
            // Get available time slots
            prisma.timeslots.findMany({
                where: { semester, academic_year: new Date().getFullYear() }
            }),
            // Get available rooms
            prisma.rooms.findMany({
                where: { status: 'available' }
            })
        ]);

        if (!syllabusData) {
            return res.status(404).json({ message: "Syllabus not found for the given course and semester" });
        }

        // 2. Get subject details with faculty mappings
        const subjectsData = await prisma.subject_details.findMany({
            where: {
                syllabus_id: syllabusData.syllabus_id
            },
            include: {
                faculty_subject_mapping: {
                    include: {
                        faculty: {
                            include: {
                                users: true,
                                facultyavailability: true
                            }
                        }
                    }
                },
                units: true
            }
        });

        // 3. Calculate required hours and classes
        const totalWeeks = duration * 4;
        const schedulingData = subjectsData.map(subject => {
            const totalRequiredHours = subject.units.reduce(
                (total, unit) => total + unit.required_hours, 0
            );
            const totalClasses = Math.ceil(totalRequiredHours / 1); // 1 hour per class
            const weeklyClasses = Math.ceil(totalClasses / totalWeeks);

            return {
                subject_id: subject.subject_id,
                subject_name: subject.subject_name,
                total_required_hours: totalRequiredHours,
                total_classes: totalClasses,
                weekly_classes: weeklyClasses,
                faculty_mappings: subject.faculty_subject_mapping
            };
        });

        // 4. Generate schedule for each section
        const scheduleResults = [];
        for (const section of sectionData) {
            const sectionSchedule = await generateSectionSchedule(
                section,
                schedulingData,
                timeSlots,
                availableRooms
            );
            scheduleResults.push(sectionSchedule);
        }

        // 5. Save the generated schedule
        const savedSchedule = await saveScheduleToDatabase(scheduleResults, courseData, sectionData, duration);

        res.status(200).json({
            message: "Schedule generated successfully",
            schedule: savedSchedule
        });

    } catch (error) {
        console.error("Schedule generation error:", error);
        res.status(500).json({ 
            message: "Error generating schedule",
            error: error.message 
        });
    }
};

const generateSectionSchedule = async (section, schedulingData, timeSlots, availableRooms) => {
    const schedule = [];
    const daysInWeek = 5;
    const slotsPerDay = timeSlots.length / daysInWeek;

    // Track assigned slots to avoid conflicts
    const assignedSlots = new Map();
    const facultyAssignments = new Map();
    const roomAssignments = new Map();

    for (const subject of schedulingData) {
        let classesScheduled = 0;
        const weeklyTarget = subject.weekly_classes;

        while (classesScheduled < weeklyTarget) {
            // Try to find a suitable slot, faculty, and room
            const assignment = await findAvailableSlot(
                subject,
                timeSlots,
                availableRooms,
                assignedSlots,
                facultyAssignments,
                roomAssignments
            );

            if (assignment) {
                schedule.push(assignment);
                classesScheduled++;

                // Update tracking maps
                const slotKey = `${assignment.day}_${assignment.slot_id}`;
                assignedSlots.set(slotKey, true);
                facultyAssignments.set(`${slotKey}_${assignment.faculty_id}`, true);
                roomAssignments.set(`${slotKey}_${assignment.room_id}`, true);
            } else {
                // Could not find a suitable slot for this class
                console.warn(`Could not schedule all classes for subject ${subject.subject_name}`);
                break;
            }
        }
    }

    return {
        section_id: section.section_id,
        schedule: schedule
    };
};

const findAvailableSlot = async (
    subject,
    timeSlots,
    availableRooms,
    assignedSlots,
    facultyAssignments,
    roomAssignments
) => {
    for (let day = 1; day <= 5; day++) {
        for (const slot of timeSlots) {
            const slotKey = `${day}_${slot.slot_id}`;
            
            // Check if slot is already assigned
            if (assignedSlots.get(slotKey)) continue;

            // Try to find an available faculty
            const availableFaculty = subject.faculty_mappings.find(mapping => {
                const facultyKey = `${slotKey}_${mapping.faculty_id}`;
                return !facultyAssignments.get(facultyKey);
            });

            if (!availableFaculty) continue;

            // Try to find an available room
            const availableRoom = availableRooms.find(room => {
                const roomKey = `${slotKey}_${room.room_id}`;
                return !roomAssignments.get(roomKey);
            });

            if (!availableRoom) continue;

            // We found a valid combination
            return {
                day,
                slot_id: slot.slot_id,
                subject_id: subject.subject_id,
                faculty_id: availableFaculty.faculty_id,
                room_id: availableRoom.room_id
            };
        }
    }

    return null;
};

const saveScheduleToDatabase = async (scheduleResults, courseData, sectionData, duration) => {
    const scheduleMeta = await prisma.schedule_meta.create({
        data: {
            department_id: 1, // Replace with actual department_id
            academic_year: new Date().getFullYear(),
            semester: 1, // Replace with actual semester
            batch_year: 2024, // Replace with actual batch_year
            created_by: 1, // Replace with actual user_id
            status: 'draft'
        }
    });

    for (const sectionSchedule of scheduleResults) {
        const section = sectionData.find(s => s.section_id === sectionSchedule.section_id);
        
        // Create classes for each unique subject-faculty combination
        const uniqueSubjectFacultyCombinations = new Map();
        
        sectionSchedule.schedule.forEach(detail => {
            const key = `${detail.subject_id}_${detail.faculty_id}`;
            if (!uniqueSubjectFacultyCombinations.has(key)) {
                uniqueSubjectFacultyCombinations.set(key, detail);
            }
        });

        // Create classes
        for (const [key, detail] of uniqueSubjectFacultyCombinations) {
            // Create class entry
            // Get timeslot details for this schedule
            const timeslot = await prisma.timeslots.findUnique({
                where: {
                    slot_id: detail.slot_id
                }
            });

            const classEntry = await prisma.classes.create({
                data: {
                    course_id: courseData.course_id,
                    faculty_id: detail.faculty_id,
                    section_id: section.section_id,
                    semester: section.semester,
                    academic_year: new Date().getFullYear(),
                    start_date: timeslot.start_time,
                    end_date: timeslot.end_time,
                    is_active: true,
                    slot_id: detail.slot_id
                }
            });

            // Create schedule details for this class
            const classSchedules = sectionSchedule.schedule.filter(
                s => s.subject_id === detail.subject_id && s.faculty_id === detail.faculty_id
            );

            for (const schedule of classSchedules) {
                await prisma.schedule_details.create({
                    data: {
                        schedule_id: scheduleMeta.schedule_id,
                        class_id: classEntry.class_id,
                        faculty_id: schedule.faculty_id,
                        room_id: schedule.room_id,
                        timeslot_id: schedule.slot_id,
                        day_of_week: schedule.day
                    }
                });
            }
        }
    }

    return scheduleMeta;
};

export { generateSchedule };