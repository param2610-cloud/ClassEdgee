import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const batchUploadController = async (req, res) => {
    try {
        const { 
            department_id, 
            course_id, 
            semester,
            subjects 
        } = req.body;

        // Input validation remains the same
        if (!department_id || !course_id || !semester || !subjects || !Array.isArray(subjects)) {
            return res.status(400).json({ 
                error: 'Missing or invalid required parameters', 
                details: 'department_id, course_id, semester, and subjects (array) are required' 
            });
        }

        // Verification steps
        const departmentExists = await prisma.departments.findUnique({
            where: { 
                department_id: department_id,
                institution_id: 4
            }
        });

        const courseExists = await prisma.courses.findUnique({
            where: { 
                course_id: course_id,
                department_id: department_id 
            }
        });

        if (!departmentExists) {
            return res.status(404).json({ error: 'Department not found' });
        }

        if (!courseExists) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Separate transaction for syllabus structure
        const syllabusStructure = await prisma.syllabus_structure.upsert({
            where: {
                course_id_semester: {
                    course_id: course_id,
                    semester: semester
                }
            },
            update: {},
            create: {
                course_id: course_id,
                semester: semester
            }
        });

        // Process subjects sequentially instead of parallel
        const processedSubjects = [];
        for (const subject of subjects) {
            const subjectRecord = await prisma.subject_details.upsert({
                where: {
                    subject_id: subject.subject_id || undefined
                },
                update: {
                    syllabus_id: syllabusStructure.syllabus_id,
                    course_id: course_id,
                    subject_name: subject.subject_name,
                    subject_code: subject.subject_code,
                    subject_type: subject.subject_type,
                    preferred_faculty_specializations: 
                        subject.preferred_faculty_specializations || [],
                    resources_required: 
                        subject.resources_required || []
                },
                create: {
                    syllabus_id: syllabusStructure.syllabus_id,
                    course_id: course_id,
                    subject_name: subject.subject_name,
                    subject_code: subject.subject_code,
                    subject_type: subject.subject_type,
                    preferred_faculty_specializations: 
                        subject.preferred_faculty_specializations || [],
                    resources_required: 
                        subject.resources_required || []
                }
            });

            // Process units sequentially
            const processedUnits = [];
            for (const unit of (subject.units || [])) {
                const unitRecord = await prisma.units.upsert({
                    where: {
                        unit_id: unit.unit_id || undefined,
                        subject_id_unit_number: {
                            subject_id: subjectRecord.subject_id,
                            unit_number: unit.unit_number
                        }
                    },
                    update: {
                        subject_id: subjectRecord.subject_id,
                        unit_number: unit.unit_number,
                        unit_name: unit.unit_name,
                        required_hours: unit.required_hours,
                        learning_objectives: 
                            unit.learning_objectives || []
                    },
                    create: {
                        subject_id: subjectRecord.subject_id,
                        unit_number: unit.unit_number,
                        unit_name: unit.unit_name,
                        required_hours: unit.required_hours,
                        learning_objectives: 
                            unit.learning_objectives || []
                    }
                });

                // Process topics sequentially
                const processedTopics = [];
                for (const [index, topicName] of (unit.topics || []).entries()) {
                    const existingTopic = await prisma.topics.findFirst({
                        where: {
                            unit_id: unitRecord.unit_id,
                            topic_name: topicName
                        }
                    });
                    
                    const topicRecord = existingTopic 
                        ? await prisma.topics.update({
                            where: { topic_id: existingTopic.topic_id },
                            data: {
                                topic_description: `Topic ${index + 1} for ${unit.unit_name}`
                            }
                        })
                        : await prisma.topics.create({
                            data: {
                                unit_id: unitRecord.unit_id,
                                topic_name: topicName,
                                topic_description: `Topic ${index + 1} for ${unit.unit_name}`
                            }
                        });
                }

                processedUnits.push({
                    unit: unitRecord,
                    topics: processedTopics
                });
            }

            processedSubjects.push({
                subject: subjectRecord,
                units: processedUnits
            });
        }

        res.status(201).json({
            message: 'Semester syllabus uploaded successfully',
            processedData: processedSubjects
        });

    } catch (error) {
        console.error('Semester Syllabus Upload Error:', error);
        
        res.status(500).json({ 
            error: 'Internal Server Error', 
            message: error.message || 'An unexpected error occurred during syllabus upload' 
        });
    }
};

export { batchUploadController };