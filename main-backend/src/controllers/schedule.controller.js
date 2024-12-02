import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const validateResources = async (schedulingData, availableRooms, timeSlots, sections) => {
    const results = {
        isValid: true,
        messages: [],
        requiredResources: {
            facultyNeeded: 0,
            roomsNeeded: 0,
            timeslotsNeeded: 0
        }
    };
    
    // Calculate total required slots per week
    const totalWeeklySlots = schedulingData.reduce((sum, subject) => 
        sum + subject.weekly_classes, 0);
    
    // Calculate available resources
    const availableFacultyCount = new Set(
        schedulingData.flatMap(s => s.faculty_mappings.map(m => m.faculty_id))
    ).size;
    const availableRoomCount = availableRooms.length;
    const availableTimeslotCount = timeSlots.length * 5; // 5 days
    
    // Check faculty availability
    if (availableFacultyCount === 0) {
        results.isValid = false;
        results.messages.push("No faculty assigned to subjects");
        results.requiredResources.facultyNeeded = totalWeeklySlots;
    }

    // Check room availability
    if (availableRoomCount === 0) {
        results.isValid = false;
        results.messages.push("No rooms available");
        results.requiredResources.roomsNeeded = Math.ceil(totalWeeklySlots / 25); // Assuming 5 slots per day
    }

    // Check if enough timeslots
    if (availableTimeslotCount < totalWeeklySlots) {
        results.isValid = false;
        results.messages.push(`Insufficient timeslots. Need ${totalWeeklySlots} slots but only ${availableTimeslotCount} available`);
    }

    return results;
};

const generateSchedule = async (req, res) => {
    try {
        const { 
            batch_year, 
            semester, 
            course_id, 
            duration,
            department_id,
            academic_year,
            created_by 
        } = req.body;

        // 1. Validate and get timeslots
        const timeSlots = await prisma.timeslots.findMany({
            where: { 
                semester: parseInt(semester), 
                academic_year: parseInt(academic_year)
            },
            orderBy: [
                { day_of_week: 'asc' },
                { start_time: 'asc' }
            ]
        });

        if (!timeSlots.length) {
            return res.status(400).json({ 
                message: "No timeslots found for this semester and academic year"
            });
        }

        // 2. Get all required data
        const [courseData, sectionData, syllabusData, availableRooms] = await Promise.all([
            prisma.courses.findUnique({
                where: { course_id }
            }),
            prisma.sections.findMany({
                where: { batch_year, semester, department_id }
            }),
            prisma.syllabus_structure.findFirst({
                where: { course_id, semester }
            }),
            prisma.rooms.findMany({
                where: { status: 'available' }
            })
        ]);

        // Validate required data
        if (!syllabusData) {
            return res.status(404).json({ message: "Syllabus not found" });
        }
        if (!sectionData.length) {
            return res.status(404).json({ message: "No sections found" });
        }
        if (!availableRooms.length) {
            return res.status(404).json({ message: "No available rooms" });
        }

        // 3. Get subject details with faculty mappings
        const subjectsData = await prisma.subject_details.findMany({
            where: { syllabus_id: syllabusData.syllabus_id },
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

        if (!subjectsData.length) {
            return res.status(404).json({ message: "No subjects found in syllabus" });
        }

        // 4. Calculate scheduling requirements
        const totalWeeks = duration * 4;
        const schedulingData = subjectsData.map(subject => ({
            subject_id: subject.subject_id,
            subject_name: subject.subject_name,
            total_required_hours: subject.units.reduce((total, unit) => total + unit.required_hours, 0),
            faculty_mappings: subject.faculty_subject_mapping,
            weekly_classes: Math.ceil(
                Math.ceil(subject.units.reduce((total, unit) => total + unit.required_hours, 0)) / totalWeeks
            )
        }));

        // 5. Generate schedule for each section
        const scheduleResults = [];
        for (const section of sectionData) {
            const sectionSchedule = await generateSectionSchedule(
                section,
                schedulingData,
                timeSlots,
                availableRooms
            );
            if (sectionSchedule.schedule.length > 0) {
                scheduleResults.push(sectionSchedule);
            }
        }

        if (scheduleResults.length === 0) {
            return res.status(400).json({ 
                message: "Could not generate valid schedules for any section" 
            });
        }

        // 6. Save the schedule
        const savedSchedule = await saveScheduleToDatabase(
            scheduleResults,
            courseData,
            sectionData,
            department_id,
            academic_year,
            semester,
            batch_year,
            created_by
        );

        return res.status(200).json({
            success: true,
            message: "Schedule generated successfully",
            schedule: savedSchedule
        });

    } catch (error) {
        console.error("Schedule generation error:", error);
        res.status(500).json({
            success: false,
            message: "Error generating schedule",
            error: error.message
        });
    }
};


const generateSectionSchedule = async (section, schedulingData, timeSlots, availableRooms) => {
    const schedule = [];
    const assignments = {
        faculty: new Map(),    // tracks faculty assignments
        rooms: new Map(),      // tracks room assignments
        slots: new Map(),      // tracks slot usage
    };

    // Sort subjects by complexity (more hours = higher priority)
    const prioritizedSubjects = [...schedulingData]
        .sort((a, b) => b.weekly_classes - a.weekly_classes);

    for (const subject of prioritizedSubjects) {
        let assignedSlots = 0;
        let attempts = 0;
        const maxAttempts = timeSlots.length * 5; // Prevent infinite loops

        while (assignedSlots < subject.weekly_classes && attempts < maxAttempts) {
            attempts++;
            
            const assignment = findValidAssignment(
                subject,
                timeSlots,
                availableRooms,
                assignments
            );

            if (assignment) {
                schedule.push(assignment);
                updateAssignments(assignments, assignment);
                assignedSlots++;
            }
        }
    }

    return {
        section_id: section.section_id,
        schedule
    };
};
const findValidAssignment = (subject, timeSlots, availableRooms, assignments) => {
    for (let day = 1; day <= 5; day++) {
        for (const timeslot of timeSlots) {
            for (const faculty of subject.faculty_mappings) {
                for (const room of availableRooms) {
                    // Check if this combination is available
                    if (isValidAssignment(day, timeslot, faculty, room, assignments)) {
                        return {
                            day,
                            slot_id: timeslot.slot_id,
                            subject_id: subject.subject_id,
                            faculty_id: faculty.faculty_id,
                            room_id: room.room_id
                        };
                    }
                }
            }
        }
    }
    return null;
};
const isValidAssignment = (day, timeslot, faculty, room, assignments) => {
    const slotKey = `${day}_${timeslot.slot_id}`;
    const facultyKey = `${faculty.faculty_id}_${slotKey}`;
    const roomKey = `${room.room_id}_${slotKey}`;

    return !assignments.slots.has(slotKey) &&
           !assignments.faculty.has(facultyKey) &&
           !assignments.rooms.has(roomKey);
};

const updateAssignments = (assignments, assignment) => {
    const slotKey = `${assignment.day}_${assignment.slot_id}`;
    const facultyKey = `${assignment.faculty_id}_${slotKey}`;
    const roomKey = `${assignment.room_id}_${slotKey}`;

    assignments.slots.set(slotKey, true);
    assignments.faculty.set(facultyKey, true);
    assignments.rooms.set(roomKey, true);
};
const findOptimalSlot = async (subject, timeSlots, availableRooms, assignments, conflicts) => {
    // Score each possible slot based on constraints
    const slotScores = [];
    
    for (let day = 1; day <= 5; day++) {
        for (const slot of timeSlots) {
            const score = calculateSlotScore(
                day,
                slot,
                subject,
                assignments
            );
            
            if (score > 0) {
                slotScores.push({
                    day,
                    slot,
                    score,
                    faculty: findBestFaculty(subject, day, slot, assignments),
                    room: findBestRoom(availableRooms, day, slot, assignments)
                });
            }
        }
    }

    // Sort by score and pick the best valid option
    slotScores.sort((a, b) => b.score - a.score);
    
    for (const option of slotScores) {
        if (option.faculty && option.room) {
            return {
                day: option.day,
                slot_id: option.slot.slot_id,
                faculty_id: option.faculty.faculty_id,
                room_id: option.room.room_id,
                subject_id: subject.subject_id
            };
        }
    }

    return null;
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

const saveScheduleToDatabase = async (scheduleResults, courseData, sectionData, department_id, academic_year, semester, batch_year, created_by) => {
    const scheduleMeta = await prisma.schedule_meta.create({
        data: {
            department_id,
            academic_year,
            semester: parseInt(semester),
            batch_year,
            created_by,
            status: 'draft'
        }
    });

    const processedCombinations = new Set();

    for (const sectionSchedule of scheduleResults) {
        for (const detail of sectionSchedule.schedule) {
            const timeslot = await prisma.timeslots.findUnique({
                where: { slot_id: detail.slot_id }
            });

            if (!timeslot) continue;

            const combinationKey = `${detail.faculty_id}_${detail.slot_id}_${detail.day}`;
            if (processedCombinations.has(combinationKey)) continue;

            try {
                const classEntry = await prisma.classes.create({
                    data: {
                        course_id: courseData.course_id,
                        faculty_id: detail.faculty_id,
                        room_id: detail.room_id,
                        section_id: sectionSchedule.section_id,
                        semester: parseInt(semester),
                        academic_year,
                        start_date: timeslot.start_time,
                        end_date: timeslot.end_time,
                        is_active: true,
                        slot_id: detail.slot_id
                    }
                });

                await prisma.schedule_details.create({
                    data: {
                        schedule_id: scheduleMeta.schedule_id,
                        class_id: classEntry.class_id,
                        faculty_id: detail.faculty_id,
                        room_id: detail.room_id,
                        timeslot_id: detail.slot_id,
                        day_of_week: detail.day
                    }
                });

                processedCombinations.add(combinationKey);
            } catch (error) {
                if (error.code === 'P2002') continue;
                throw error;
            }
        }
    }

    return scheduleMeta;
};
const getScheduleBySection = async (req, res) => {
    try {
        const { section_id } = req.params;
        const classes = await prisma.classes.findMany({
            where: { section_id:parseInt(section_id) },
            include: {
                faculty: true,
                rooms: true,
                timeslots: true
            }
        });
        res.status(200).json({
            success: true,
            classes
        });
    } catch (error) {
        console.error("Error fetching schedule:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching schedule",
            error: error.message
        });
        
    }
}

export { generateSchedule,getScheduleBySection };