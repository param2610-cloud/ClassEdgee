import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const list_of_department = async (req, res) => {
    const institute_id = req.headers["X-Institution-Id"];
    try {
        const department = await prisma.departments.findMany({
            where: {
                institute_id: institute_id,
            },
            select: {
                department_id: true,
                department_name: true,
                department_code: true,
                users: {
                    select: {
                        first_name: true,
                        last_name: true,
                        college_uid: true,
                    },
                },
            },
        });
        res.status(200).send({
            department,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Internal Server Error",
        });
    }
};
const add_department = async (req, res) => {
    try {
        const {
            department_name,
            department_code,
            contact_phone,
            contact_email,
            hod_college_uid,
            institute_id,
        } = req.body;

        if (!department_name || !department_code || !institute_id) {
            return res
                .status(400)
                .json({
                    message: "department_name and department_code are required",
                });
        }
        if (!contact_phone || !contact_email || !hod_college_uid) {
            await prisma.departments.create({
                data: {
                    department_name: department_name,
                    department_code: department_code,
                    institution_id: institute_id,
                },
            });
        } else {
            const hod_data = await prisma.users.findUnique({
                where: {
                    college_uid: str(hod_college_uid),
                },
                select: {
                    phone_number: true,
                    user_id: true,
                    email: true,
                },
            });
            await prisma.departments.create({
                data: {
                    department_name: department_name,
                    department_code: department_code,
                    contact_phone: hod_data.phone_number,
                    contact_email: hod_data.email,
                    hod_user_id: hod_data.user_id,
                    institution_id: institute_id,
                },
            });
        }
        res.status(200).json({ message: "Department added successfully" });
    } catch (error) {
        console.error("Error adding department:", error);
        res.status(500).json({ message: "An error occurred" });
    }
};

const specific_department_details = async (req, res) => {
    try {
        const { department_id, institute_id } = req.params;
        const department = await prisma.departments.findUnique({
            where: {
                department_id: parseInt(department_id),
                institution_id: parseInt(institute_id),
            },
            include: {
                users: true,
                announcements: true,
                courses: true,
                sections: true,
                students: true,
                faculty: true,
            },
        });
        res.status(200).send({
            department,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Internal Server Error",
        });
    }
};
const list_of_faculty = async (req, res) => {
    try {
        const { department_id, institute_id } = req.params;
        const faculty = await prisma.faculty.findMany({
            where: {
                users: {
                    institution_id: parseInt(institute_id),
                },
            },
            include: {
                users: true,
                departments: true,
            },
        });
        res.status(200).send({
            faculty,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Internal Server Error",
        });
    }
};
const add_hod_to_department = async (req, res) => {
    try {
        console.log(req.body);
        
        const { department_id, institute_id } = req.params;
        const { hod_user_id } = req.body;
        const hod_data = await prisma.users.findUnique({
            where: {
                user_id: parseInt(hod_user_id),
            },
            select: {
                phone_number: true,
                user_id: true,
                email: true,
            },
        });
        await prisma.departments.update({
            where: {
                department_id: parseInt(department_id),
                institution_id: parseInt(institute_id),
            },
            data: {
                contact_phone: hod_data.phone_number,
                contact_email: hod_data.email,
                hod_user_id: hod_data.user_id,
            },
        });
        res.status(200).json({ message: "HOD added successfully" });
    } catch (error) {
        console.error("Error adding HOD:", error);
        res.status(500).json({ message: "An error occurred" });
    }
};



//head of department controller 


export {
    list_of_department,
    add_department,
    specific_department_details,
    list_of_faculty,
    add_hod_to_department
};
