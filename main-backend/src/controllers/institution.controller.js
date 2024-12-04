import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const getInstitution = async (req, res) => {
    try {
        const {institutionId} = req.params;
        const institutions = await prisma.institutions.findMany({
            where: {
                institution_id: parseInt(institutionId),
            },
        });
        res.status(200).send({
            success: true,
            data: institutions,
        });
    } catch (error) {
        console.error("Error fetching institutions:", error);
        res.status(500).send({
            success: false,
            message: "Failed to fetch institutions",
            error: error.message,
        });
    }
}
export { getInstitution };