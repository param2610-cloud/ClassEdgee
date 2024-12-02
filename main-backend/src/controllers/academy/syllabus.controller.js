import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Create syllabus for a course
const createSyllabus = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { semester } = req.body;

        // Check if syllabus already exists for this semester
        const existingSyllabus = await prisma.syllabus_structure.findFirst({
            where: {
                course_id: parseInt(courseId),
                semester: semester,
            },
        });

        if (existingSyllabus) {
            return res.status(400).json({
                error: "Syllabus already exists for this semester",
            });
        }

        const syllabus = await prisma.syllabus_structure.create({
            data: {
                course_id: parseInt(courseId),
                semester: semester,
            },
        });

        res.status(201).json(syllabus);
    } catch (error) {
        res.status(500).json({
            error: "Failed to create syllabus",
        });
    }
};

// Get syllabus by course
const getSyllabusByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        const syllabus = await prisma.syllabus_structure.findMany({
            where: {
                course_id: parseInt(courseId),
            },
            include: {
                subject_details: {
                    include: {
                        units: {
                            include: {
                                topics: true,
                                unit_prerequisites_unit_prerequisites_unit_idTounits: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                semester: "asc",
            },
        });

        res.json(syllabus);
    } catch (error) {
        res.status(500).json({
            error: "Failed to fetch syllabus",
        });
    }
};

// Get subjects for a syllabus
const getSyllabusSubjects = async (req, res) => {
    try {
        const { syllabusId } = req.params;

        const subjects = await prisma.subject_details.findMany({
            where: {
                syllabus_id: parseInt(syllabusId),
            },
            include: {
                units: {
                    include: {
                        topics: true,
                    },
                },
            },
        });

        res.json(subjects);
    } catch (error) {
        res.status(500).json({
            error: "Failed to fetch subjects",
        });
    }
};

// Validate syllabus structure
const validateSyllabus = async (req, res) => {
    try {
        const { courseId, semester, subjects } = req.body;
        const errors = [];

        // Basic validation rules
        if (!subjects || !Array.isArray(subjects)) {
            errors.push("Subjects must be provided as an array");
        } else {
            subjects.forEach((subject, index) => {
                if (!subject.subject_type) {
                    errors.push(`Subject ${index + 1} must have a type`);
                }
                if (!subject.units || !Array.isArray(subject.units)) {
                    errors.push(`Subject ${index + 1} must have units array`);
                } else {
                    subject.units.forEach((unit, uIndex) => {
                        if (!unit.unit_name) {
                            errors.push(
                                `Unit ${uIndex + 1} in subject ${index + 1} must have a name`
                            );
                        }
                        if (!unit.required_hours || unit.required_hours <= 0) {
                            errors.push(
                                `Unit ${uIndex + 1} in subject ${index + 1} must have valid required hours`
                            );
                        }
                    });
                }
            });
        }

        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }

        res.json({ valid: true, message: "Syllabus structure is valid" });
    } catch (error) {
        res.status(500).json({
            error: "Validation failed",
        });
    }
};

export {
    createSyllabus,
    getSyllabusByCourse,
    getSyllabusSubjects,
    validateSyllabus,
};
