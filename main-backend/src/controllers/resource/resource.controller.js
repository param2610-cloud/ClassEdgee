import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const parseOptionalInt = (value) => {
    if (value === undefined || value === null || value === '') {
        return undefined;
    }

    const parsed = Number.parseInt(String(value), 10);
    return Number.isNaN(parsed) ? undefined : parsed;
};

const normalizeTags = (rawTags) => {
    if (Array.isArray(rawTags)) {
        return rawTags.map((tag) => String(tag).trim()).filter(Boolean);
    }

    if (typeof rawTags === 'string') {
        const value = rawTags.trim();
        if (!value) return [];

        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
                return parsed.map((tag) => String(tag).trim()).filter(Boolean);
            }
        } catch {
            // Fallback to comma-separated tags.
        }

        return value.split(',').map((tag) => tag.trim()).filter(Boolean);
    }

    return [];
};

// controllers/resourceController.js
export const createResource = async (req, res) => {
    try {
        const { title, description, course_id, uploaded_by, tags, visibility, resource_type, file_url } = req.body;
        const uploadedFileUrl = req.file ? `/uploads/${req.file.filename}` : null;

        const parsedCourseId = parseOptionalInt(course_id);
        const parsedUploadedBy = parseOptionalInt(uploaded_by);

        const resource = await prisma.resources.create({
            data: {
                title,
                description,
                file_url: uploadedFileUrl || file_url || null,
                resource_type: resource_type || req.file?.mimetype || 'application/octet-stream',
                course_id: parsedCourseId,
                uploaded_by: parsedUploadedBy,
                tags: normalizeTags(tags),
                visibility: visibility || 'section'
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
        const { title, description, course_id, tags, visibility, resource_type, file_url } = req.body;
        const parsedCourseId = parseOptionalInt(course_id);

        const updateData = {
            title,
            description,
            resource_type: resource_type || req.file?.mimetype,
            tags: normalizeTags(tags),
            visibility,
            version: { increment: 1 }
        };

        if (parsedCourseId !== undefined) {
            updateData.course_id = parsedCourseId;
        }

        if (req.file) {
            updateData.file_url = `/uploads/${req.file.filename}`;
        } else if (typeof file_url === 'string' && file_url.trim()) {
            updateData.file_url = file_url.trim();
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