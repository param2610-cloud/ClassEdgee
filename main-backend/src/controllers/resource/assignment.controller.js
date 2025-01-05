import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
// controllers/assignmentController.js
export const createAssignment = async (req, res) => {
    try {
        const { title, content, created_by, section_id, course_id, tags, is_private } = req.body;
        const assignment = await prisma.notes.create({
            data: {
                title,
                content,
                created_by,
                section_id,
                course_id,
                tags,
                is_private
            }
        });
        res.json(assignment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAssignments = async (req, res) => {
    try {
        const { course_id } = req.query;
        const where = {};

        if (course_id) {
            where.course_id = parseInt(course_id);
        }

        const assignments = await prisma.notes.findMany({
            where,
            include: {
                courses: true,
                sections: true,
                users: {
                    select: {
                      first_name: true,  last_name: true, 
                      
                        email: true
                    }
                }
            }
        });
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};