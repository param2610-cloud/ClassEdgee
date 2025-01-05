import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const fetchStudentData = (student_id)=>{
    try {
        if(!student_id){
            return null
        }
        const studentData = prisma.students.findUnique({
            where:{
                student_id: student_id
            },
            include:{
                users:{
                    include:{
                        alertnotifications:true,
                        events:true,
                        emergencyalerts:true,
                        institutions:true,
                    }
                },
                departments:true,
                sections:{
                    include:{
                        classes:true,
                    }
                },
                attendances:true
            }
        })
        return studentData
    } catch (error) {
        console.log(error)
    }
}