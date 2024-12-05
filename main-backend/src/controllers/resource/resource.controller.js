
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// controllers/resourceController.js
export const createResource = async (req, res) => {
    try {
        const { title, description, course_id, uploaded_by, tags, visibility, resource_type } = req.body;
        const file_url = req.file ? req.file.path : null;

        const resource = await prisma.resources.create({
            data: {
                title,
                description,
                file_url,
                resource_type,
                course_id: parseInt(course_id),
                uploaded_by : parseInt(uploaded_by),
                tags,
                visibility
            }
        });
        res.json(resource);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getResources = async (req, res) => {
    try {
        const { course_id } = req.query;
        const where = {};

        if (course_id) {
            where.course_id = parseInt(course_id);
        }

        const resources = await prisma.resources.findMany({
            where,
            include: {
                courses: true,
                users: {
                    select: {
                        first_name: true,
                         last_name: true,
                        email: true
                    }
                }
            }
        });
        res.json(resources);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateResource = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, course_id, tags, visibility, resource_type } = req.body;
        const updateData = {
            title,
            description,
            resource_type,
            course_id: parseInt(course_id),
            tags,
            visibility,
            version: { increment: 1 }
        };

        if (req.file) {
            updateData.file_url = req.file.path;
        }

        const resource = await prisma.resources.update({
            where: { resource_id: parseInt(id) },
            data: updateData
        });
        res.json(resource);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteResource = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.resources.delete({
            where: { resource_id: parseInt(id) }
        });
        res.json({ message: 'Resource deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};