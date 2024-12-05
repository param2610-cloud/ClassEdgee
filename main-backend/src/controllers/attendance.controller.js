import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getActiveClass = async (req, res) => {
    try {
        const currentTime = new Date();
        const activeClass = await prisma.classes.findFirst({
            where: {
                faculty_id: parseInt(req.params.facultyId),
                date_of_class: currentTime.toISOString(),
                is_active: true
            },
            include: {
                sections: {
                    include: {
                        students_sections: {
                            include: { students: true }
                        }
                    }
                }
            }
        });
        res.json({ activeClass });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const markAttendance = async (req, res) => {
    try {
        const { class_id, attendance_data } = req.body;
        const currentDate = new Date().toISOString();
        
        const records = await Promise.all(
            attendance_data.map(record => 
                prisma.attendance.create({
                    data: {
                        class_id,
                        student_id: record.student_id,
                        date: currentDate,
                        status: record.status,
                        verification_method: 'manual'
                    }
                })
            )
        );
        res.json({ success: true, records });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAttendanceHistory = async (req, res) => {
    try {
        const history = await prisma.attendance.findMany({
            where: { class_id: parseInt(req.params.classId) },
            include: { students: true },
            orderBy: { date: 'desc' }
        });
        res.json({ history });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};