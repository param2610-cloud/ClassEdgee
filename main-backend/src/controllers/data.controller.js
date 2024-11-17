import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const list_of_department = async (req, res) => {
    try {
        const department = await prisma.departments.findMany();
        res.status(200).send({
            department
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            message:"Internal Server Error"
        })
    }
};
export {
    list_of_department
}