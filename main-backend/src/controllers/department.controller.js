import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const list_of_department = async (req, res) => {
    try {
        const department = await prisma.departments.findMany(
            {
                select:{
                    department_id:true,
                    department_name:true,
                    department_code:true,
                    users:{
                        select:{
                            first_name:true,
                            last_name:true,
                            college_uid:true
                        }
                    }
                }
            }
        );
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
const add_department =async (req,res)=>{
    try {
        const { department_name,department_code,contact_phone,contact_email,hod_college_uid } = req.body;
        if(!department_name || !department_code){
            return res.status(400).json({ message: "department_name and department_code are required" });
        }
        if(!contact_phone || !contact_email || !hod_college_uid){
        await prisma.departments.create({
            data: {
                department_name: department_name,
                department_code: department_code
            },
        });
    }else{
        
        const hod_data = await prisma.users.findUnique({
            where: {
                college_uid: str(hod_college_uid),
            },
            select: {
                phone_number: true,
                user_id: true,
                email:true
            },
        })
        await prisma.departments.create({
            data: {
                department_name: department_name,
                department_code: department_code,
                contact_phone: hod_data.phone_number,
                contact_email: hod_data.email,
                hod_user_id: hod_data.user_id
            },
        });
    }
        res.status(200).json({ message: "Department added successfully" });
    } catch (error) {
        console.error("Error adding department:", error);
        res.status(500).json({ message: "An error occurred" });
    }
}

const specific_department_details = async (req, res) => {
    try {
        const { department_id } = req.params;
        const department = await prisma.departments.findUnique({
            where: {
                department_id: parseInt(department_id),
            },
            include:{
                users:true,
                announcements:true,
                courses:true,
                sections:true,
                students:true,
                faculty:true
            }
        });
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
    list_of_department,
    add_department,
    specific_department_details
}