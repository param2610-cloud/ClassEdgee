import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const specific_section_details = async (req, res) => {
    try {
        const { section_id } = req.params;
        const section = await prisma.sections.findUnique({
            where: {
                section_id: parseInt(section_id),
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
}
const listofsection = async (req, res) => {
    try {
        const sections = await prisma.sections.findMany();
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
}
const add_section = async (req, res) => {
    try {
        const { section_name,batch_year,department_id,student_count,max_capacity,academic_year,semester } = req.body;
        const section = await prisma.sections.create({
            data: {
                section_name: section_name,
                batch_year,
                department_id:parseInt(department_id),
                student_count,
                max_capacity,
                academic_year,
                semester
            },
        });
        res.status(200).send({
            success: true,
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
}
export {
    specific_section_details,
    listofsection,
    add_section
}