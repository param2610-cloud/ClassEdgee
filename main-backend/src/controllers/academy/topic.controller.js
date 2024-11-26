import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const createTopic = async (req, res) => {
    try {
        const { unitId } = req.params;
        const { topic_name, topic_description } = req.body;

        // Basic validation
        if (!topic_name) {
            return res.status(400).json({
                error: "Missing required field: topic_name",
            });
        }

        const topic = await prisma.topics.create({
            data: {
                unit_id: parseInt(unitId),
                topic_name,
                topic_description: topic_description || null,
            },
        });

        res.status(201).json(topic);
    } catch (error) {
        console.error("Error creating topic:", error);
        res.status(500).json({ error: "Failed to create topic" });
    }
};

const getTopics = async (req, res) => {
    try {
        const { unitId } = req.params;

        const topics = await prisma.topics.findMany({
            where: {
                unit_id: parseInt(unitId),
            },
        });

        res.json(topics);
    } catch (error) {
        console.error("Error fetching topics:", error);
        res.status(500).json({ error: "Failed to fetch topics" });
    }
};

// Delete routes for cleanup
const deleteSubject = async (req, res) => {
    try {
        const { subjectId } = req.params;

        await prisma.subject_details.delete({
            where: {
                subject_id: parseInt(subjectId),
            },
        });

        res.status(204).send();
    } catch (error) {
        console.error("Error deleting subject:", error);
        res.status(500).json({ error: "Failed to delete subject" });
    }
};

const deleteUnit = async (req, res) => {
    try {
        const { unitId } = req.params;

        await prisma.units.delete({
            where: {
                unit_id: parseInt(unitId),
            },
        });

        res.status(204).send();
    } catch (error) {
        console.error("Error deleting unit:", error);
        res.status(500).json({ error: "Failed to delete unit" });
    }
};

const deleteTopic = async (req, res) => {
    try {
        const { topicId } = req.params;

        await prisma.topics.delete({
            where: {
                topic_id: parseInt(topicId),
            },
        });

        res.status(204).send();
    } catch (error) {
        console.error("Error deleting topic:", error);
        res.status(500).json({ error: "Failed to delete topic" });
    }
};
export { createTopic, getTopics, deleteSubject, deleteUnit, deleteTopic };
