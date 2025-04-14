import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
let cachedDepartments = null;

export const getDepartments = async () => {
    if (!cachedDepartments) {
        cachedDepartments = await prisma.departments.findMany();
    }
    return cachedDepartments;
};
