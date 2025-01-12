import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const specific_section_details = async (req, res) => {
    try {
        const { section_id } = req.params;
        const section = await prisma.sections.findUnique({
            where: {
                section_id: parseInt(section_id),
            },
            include: {
                departments: true,
                students: {
                    include:{
                        users:{
                            select:{
                                first_name:true,
                                last_name:true,
                                email:true,
                                phone_number:true,
                            }
                        }
                    }
                },
                
            },
        });
        res.status(200).send({
            success: true,
            data: section,
        });
    } catch (error) {
        console.error("Error fetching section:", error);
        res.status(500).send({
            success: false,
            message: "Failed to fetch section",
            error: error.message,
        });
    }
};
const listofsection = async (req, res) => {
    try {
        console.log("list of section");
        const sections = await prisma.sections.findMany({
            include: {
                departments: true,
                students: true,
            },
        });
        res.status(200).send({
            success: true,
            data: sections,
        });
    } catch (error) {
        console.error("Error fetching sections:", error);
        res.status(500).send({
            success: false,
            message: "Failed to fetch sections",
            error: error.message,
        });
    }
};
const add_section = async (req, res) => {
    try {
        const {
            section_name,
            batch_year,
            department_id,
            student_count,
            max_capacity,
            academic_year,
            semester,
            institution_id,
        } = req.body;

        // Enhanced validation
        if (!section_name || !department_id || !institution_id || !academic_year || !semester) {
            return res.status(400).send({
                success: false,
                message: "Missing required fields. Please check all required information is provided.",
                required: {
                    section_name: !!section_name,
                    department_id: !!department_id,
                    institution_id: !!institution_id,
                    academic_year: !!academic_year,
                    semester: !!semester
                }
            });
        }

        // Validate department exists
        const departmentExists = await prisma.departments.findUnique({
            where: {
                department_id: parseInt(department_id),
            }
        });

        if (!departmentExists) {
            return res.status(404).send({
                success: false,
                message: "Department not found"
            });
        }

        // Create section with validated data
        const section = await prisma.sections.create({
            data: {
                section_name,
                batch_year: parseInt(batch_year),
                department_id: parseInt(department_id),
                student_count: student_count || 0,
                max_capacity: parseInt(max_capacity),
                academic_year: parseInt(academic_year),
                semester: parseInt(semester),
                institution_id: parseInt(institution_id),
            },
        });

        res.status(200).send({
            success: true,
            message: "Section created successfully",
            data: section,
        });
    } catch (error) {
        console.error("Error adding section:", error);
        res.status(500).send({
            success: false,
            message: "Failed to add section",
            error: error.message,
        });
    }
};
const assignManyStudentsToSingleSection = async (req, res) => {
    try {
        const { section_id } = req.body;
        // Find the section data with current student count
        const sectionData = await prisma.sections.findUnique({
            where: {
                section_id: parseInt(section_id),
            },
        });

        if (!sectionData) {
            return res.status(404).json({
                success: false,
                message: "Section not found",
            });
        }

        // Double check current count by actually counting students
        const currentCount = await prisma.students.count({
            where: {
                section_id: parseInt(section_id),
            },
        });

        // Update section's student_count if it's incorrect
        if (currentCount !== sectionData.student_count) {
            await prisma.sections.update({
                where: { section_id: parseInt(section_id) },
                data: { student_count: currentCount },
            });
            sectionData.student_count = currentCount;
        }

        // Calculate remaining capacity
        const remainingCapacity =
            sectionData.max_capacity - sectionData.student_count;

        if (remainingCapacity <= 0) {
            return res.status(400).json({
                success: false,
                message: "Section is already at maximum capacity",
            });
        }

        // Find eligible students from the same batch and department who aren't assigned to any section
        const eligibleStudents = await prisma.students.findMany({
            where: {
                batch_year: sectionData.batch_year,
                department_id: sectionData.department_id,
                section_id: null, // Only get students not assigned to any section
            },
            take: remainingCapacity, // Ensure we don't select more than remaining capacity
        });

        if (eligibleStudents.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No eligible students found for assignment",
            });
        }

        // Final capacity check just before transaction
        const finalCountCheck = await prisma.students.count({
            where: {
                section_id: parseInt(section_id),
            },
        });

        if (
            finalCountCheck + eligibleStudents.length >
            sectionData.max_capacity
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Cannot assign students as it would exceed section capacity",
                current_count: finalCountCheck,
                max_capacity: sectionData.max_capacity,
            });
        }

        // Perform the assignment in a transaction
        const CHUNK_SIZE = 100; // Adjust based on your database performance
        const assignments = await prisma.$transaction(async (prisma) => {
            let totalAssignedCount = 0;

            // Process students in chunks
            for (let i = 0; i < eligibleStudents.length; i += CHUNK_SIZE) {
                const chunk = eligibleStudents.slice(i, i + CHUNK_SIZE);

                const bulkUpdateResult = await prisma.students.updateMany({
                    where: {
                        student_id: {
                            in: chunk.map((student) => student.student_id),
                        },
                    },
                    data: {
                        section_id: parseInt(section_id),
                    },
                });

                totalAssignedCount += bulkUpdateResult.count;
            }

            // Update section's student count
            const updatedSection = await prisma.sections.update({
                where: { section_id: parseInt(section_id) },
                data: {
                    student_count: finalCountCheck + totalAssignedCount,
                },
            });

            return {
                updateCount: totalAssignedCount,
                section: updatedSection,
            };
        });

        res.status(200).json({
            success: true,
            message: `Successfully assigned ${eligibleStudents.length} students to section`,
            data: {
                assigned_count: eligibleStudents.length,
                section_id: section_id,
                current_count: finalCountCheck + eligibleStudents.length,
                max_capacity: sectionData.max_capacity,
                remaining_capacity:
                    sectionData.max_capacity -
                    (finalCountCheck + eligibleStudents.length),
            },
        });
    } catch (error) {
        console.error("Error assigning students to section:", error);
        res.status(500).json({
            success: false,
            message: "Failed to assign students to section",
            error: error.message,
        });
    }
};




export {
    specific_section_details,
    listofsection,
    add_section,
    assignManyStudentsToSingleSection,
};
