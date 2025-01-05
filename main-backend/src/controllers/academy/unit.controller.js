import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


const createUnit = async (req, res) => {
    try {
        const { subjectId } = req.params;
        const { unit_number, unit_name, required_hours, learning_objectives } =
            req.body;

        // Basic validation
        if (!unit_number || !unit_name || !required_hours) {
            return res.status(400).json({
                error: "Missing required fields: unit_number, unit_name, and required_hours are required",
            });
        }

        // Check if unit_number already exists for this subject
        const existingUnit = await prisma.units.findFirst({
            where: {
                subject_id: parseInt(subjectId),
                unit_number: unit_number,
            },
        });

        if (existingUnit) {
            return res.status(400).json({
                error: "Unit number already exists for this subject",
            });
        }

        const unit = await prisma.units.create({
            data: {
                subject_id: parseInt(subjectId),
                unit_number,
                unit_name,
                required_hours,
                learning_objectives: learning_objectives || [],
            },
        });

        res.status(201).json(unit);
    } catch (error) {
        console.error("Error creating unit:", error);
        res.status(500).json({ error: "Failed to create unit" });
    }
};

const getUnits = async (req, res) => {
    try {
        const { subjectId } = req.params;

        const units = await prisma.units.findMany({
            where: {
                subject_id: parseInt(subjectId),
            },
            include: {
                topics: true,
                unit_prerequisites_unit_prerequisites_prerequisite_unit_idTounits: true,
            },
            orderBy: {
                unit_number: "asc",
            },
        });

        res.json(units);
    } catch (error) {
        console.error("Error fetching units:", error);
        res.status(500).json({ error: "Failed to fetch units" });
    }
};

// Unit Prerequisites Routes
const createUnitPrerequisite = async (req, res) => {
    try {
        const { unitId } = req.params;
        const { prerequisite_unit_id, prerequisite_type } = req.body;

        // Basic validation
        if (!prerequisite_unit_id) {
            return res.status(400).json({
                error: "Missing required field: prerequisite_unit_id",
            });
        }

        // Check if prerequisite already exists
        const existingPrereq = await prisma.unit_prerequisites.findUnique({
            where: {
                unit_id_prerequisite_unit_id: {
                    unit_id: parseInt(unitId),
                    prerequisite_unit_id: parseInt(prerequisite_unit_id),
                },
            },
        });

        if (existingPrereq) {
            return res.status(400).json({
                error: "Prerequisite already exists for this unit",
            });
        }

        const prerequisite = await prisma.unit_prerequisites.create({
            data: {
                unit_id: parseInt(unitId),
                prerequisite_unit_id: parseInt(prerequisite_unit_id),
                prerequisite_type: prerequisite_type || null,
            },
        });

        res.status(201).json(prerequisite);
    } catch (error) {
        console.error("Error creating unit prerequisite:", error);
        res.status(500).json({ error: "Failed to create unit prerequisite" });
    }
};

export { createUnit, getUnits, createUnitPrerequisite };