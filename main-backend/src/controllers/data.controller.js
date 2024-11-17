import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const list_of_department = async (req, res) => {
    try {
        const departments = await prisma.departments.findMany();
        res.status(200).send(departments);
    } catch (error) {
        console.error("Error retrieving departments:", error);
        res.status(500).send({ error: "Failed to retrieve departments" });
    }
}
export {list_of_department}