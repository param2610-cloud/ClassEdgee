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
        // Get all attendance records for the class
        const history = await prisma.attendance.findMany({
            where: { class_id: parseInt(req.params.classId) },
            include: {
                students: {
                    include: {
                        users: {
                            select: {
                                first_name: true,
                                last_name: true,
                                profile_picture: true,
                                email: true,
                                college_uid: true,
                            }
                        }
                    }
                }
            },
            orderBy: { date: 'desc' }
        });

        // Get unique dates to calculate total classes
        const uniqueDates = [...new Set(history.map(record => record.date.toISOString().split('T')[0]))];
        const totalClasses = uniqueDates.length;

        // Group attendance by student
        const studentAttendance = history.reduce((acc, record) => {
            if (!record.students) return acc;
            
            const studentId = record.students.user_id;
            if (!acc[studentId]) {
                acc[studentId] = {
                    student: {
                        id: record.students.user_id,
                        name: `${record.students.users.first_name} ${record.students.users.last_name}`,
                        email: record.students.users.email,
                        college_uid: record.students.users.college_uid,
                        profile_picture: record.students.users.profile_picture
                    },
                    attendance: {
                        present: 0,
                        absent: 0,
                        total: totalClasses
                    },
                    records: []
                };
            }

            // Count attendance status
            if (record.status.toLowerCase() === 'present') {
                acc[studentId].attendance.present += 1;
            } else {
                acc[studentId].attendance.absent += 1;
            }

            // Add detailed record
            acc[studentId].records.push({
                date: record.date,
                status: record.status,
                verification_method: record.verification_method
            });

            return acc;
        }, {});

        // Calculate overall class statistics
        const overallStats = {
            totalClasses,
            averageAttendance: Object.values(studentAttendance).reduce((sum, student) => {
                return sum + (student.attendance.present / totalClasses * 100);
            }, 0) / Object.keys(studentAttendance).length,
            totalStudents: Object.keys(studentAttendance).length,
            attendanceByDate: uniqueDates.map(date => {
                const dayRecords = history.filter(record => 
                    record.date.toISOString().split('T')[0] === date
                );
                return {
                    date,
                    presentCount: dayRecords.filter(record => 
                        record.status.toLowerCase() === 'present'
                    ).length,
                    totalCount: dayRecords.length
                };
            })
        };

        // Calculate percentage and add to student records
        const studentAttendanceArray = Object.values(studentAttendance).map(student => ({
            ...student,
            attendance: {
                ...student.attendance,
                percentage: (student.attendance.present / totalClasses * 100).toFixed(2)
            }
        }));

        res.json({
            history: studentAttendanceArray,
            stats: overallStats
        });

    } catch (error) {
        console.error('Error in getAttendanceHistory:', error);
        res.status(500).json({ 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};