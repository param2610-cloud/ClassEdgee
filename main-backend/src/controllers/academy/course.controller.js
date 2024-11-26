import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const createCourse = async (req, res) => {
    try {
        const {
            course_code,
            course_name,
            department_id,
            credits,
            description,
        } = req.body;
        console.log(req.body);
        
        // Basic validation
        if (!course_code || !course_name || !department_id || !credits) {
            return res.status(400).json({
                error: "Required fields missing",
            });
        }

        const course = await prisma.courses.create({
            data: {
                course_code,
                course_name,
                department_id,
                credits,
                description,
                is_active: true,
            },
        });

        res.status(201).json(course);
    } catch (error) {
        if (error.code === "P2002") {
            return res.status(400).json({
                error: "Course code already exists",
            });
        }
        res.status(500).json({
            error: "Failed to create course",
        });
    }
};

// Get all courses
const getAllCourses = async (req, res) => {
    try {
        const { department_id, is_active } = req.query;

        const where = {};
        if (department_id) where.department_id = parseInt(department_id);
        if (is_active) where.is_active = is_active === "true";

        const courses = await prisma.courses.findMany({
            where,
            include: {
                departments: {
                    select: {
                        department_name: true,
                    },
                },
            },
        });

        res.json(courses);
    } catch (error) {
        res.status(500).json({
            error: "Failed to fetch courses",
        });
    }
};

// Get course by ID
const getCourseById = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await prisma.courses.findUnique({
            where: { course_id: parseInt(id) },
            include: {
                departments: {
                    select: {
                        department_name: true,
                    },
                },
                syllabus_structure: {
                    include: {
                        subject_details: true,
                    },
                },
            },
        });

        if (!course) {
            return res.status(404).json({
                error: "Course not found",
            });
        }

        res.json(course);
    } catch (error) {
        res.status(500).json({
            error: "Failed to fetch course",
        });
    }
};

// Create complete course syllabus in batch
const createCourseSyllabus = async (req, res) => {
    try {
        const { id } = req.params;
        const { semesters } = req.body;

        if (!Array.isArray(semesters)) {
            return res.status(400).json({
                error: "Semesters must be an array",
            });
        }

        // Start a transaction since we're doing multiple operations
        const result = await prisma.$transaction(async (prisma) => {
            const syllabusStructures = [];

            for (const semester of semesters) {
                // Create syllabus structure for each semester
                const syllabusStructure =
                    await prisma.syllabus_structure.create({
                        data: {
                            course_id: parseInt(id),
                            semester: semester.semester,
                            subject_details: {
                                create: semester.subjects.map((subject) => ({
                                    subject_type: subject.subject_type,
                                    preferred_faculty_specializations:
                                        subject.preferred_faculty_specializations ||
                                        [],
                                    resources_required:
                                        subject.resources_required || [],
                                    course_id: parseInt(id),
                                    units: {
                                        create: subject.units.map(
                                            (unit, index) => ({
                                                unit_number: index + 1,
                                                unit_name: unit.unit_name,
                                                required_hours:
                                                    unit.required_hours,
                                                learning_objectives:
                                                    unit.learning_objectives ||
                                                    [],
                                                topics: {
                                                    create: unit.topics.map(
                                                        (topic) => ({
                                                            topic_name:
                                                                topic.topic_name,
                                                            topic_description:
                                                                topic.topic_description,
                                                        })
                                                    ),
                                                },
                                            })
                                        ),
                                    },
                                })),
                            },
                        },
                        include: {
                            subject_details: {
                                include: {
                                    units: {
                                        include: {
                                            topics: true,
                                        },
                                    },
                                },
                            },
                        },
                    });

                syllabusStructures.push(syllabusStructure);
            }

            return syllabusStructures;
        });

        res.status(201).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to create course syllabus",
        });
    }
};


export {
    createCourse,
    getAllCourses,
    getCourseById,
    createCourseSyllabus
}