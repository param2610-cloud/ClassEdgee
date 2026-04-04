import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const toDateBounds = (startDateInput, endDateInput) => {
    const today = new Date();
    const fallbackStart = new Date(today);
    fallbackStart.setDate(fallbackStart.getDate() - 30);

    const startDate = startDateInput ? new Date(startDateInput) : fallbackStart;
    const endDate = endDateInput ? new Date(endDateInput) : today;

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        return null;
    }

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    return { startDate, endDate };
};

const toDateKey = (value) => {
    const date = new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

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

export const getCoordinatorAttendanceDashboard = async (req, res) => {
    try {
        const {
            department_id,
            section_id,
            start_date,
            end_date,
            threshold = 75,
        } = req.query;

        const bounds = toDateBounds(start_date, end_date);
        if (!bounds) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date range provided',
            });
        }

        const parsedDepartmentId = department_id ? parseInt(department_id) : null;
        const parsedSectionId = section_id ? parseInt(section_id) : null;
        const parsedThreshold = Number(threshold);

        if ((department_id && Number.isNaN(parsedDepartmentId)) || (section_id && Number.isNaN(parsedSectionId))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid department_id or section_id',
            });
        }

        const classWhere = {
            date_of_class: {
                gte: bounds.startDate,
                lte: bounds.endDate,
            },
            ...(parsedSectionId ? { section_id: parsedSectionId } : {}),
            ...(parsedDepartmentId
                ? {
                    sections: {
                        department_id: parsedDepartmentId,
                    },
                }
                : {}),
        };

        const classes = await prisma.classes.findMany({
            where: classWhere,
            select: {
                class_id: true,
                date_of_class: true,
                section_id: true,
                sections: {
                    select: {
                        section_id: true,
                        section_name: true,
                        department_id: true,
                        departments: {
                            select: {
                                department_name: true,
                            },
                        },
                    },
                },
                courses: {
                    select: {
                        course_name: true,
                    },
                },
            },
        });

        const classIds = classes.map((classItem) => classItem.class_id);

        if (!classIds.length) {
            return res.status(200).json({
                success: true,
                stats: {
                    overallAttendancePercentage: 0,
                    studentsBelowThreshold: 0,
                    classesWithoutAttendanceToday: 0,
                    totalClasses: 0,
                },
                records: [],
            });
        }

        const attendanceRows = await prisma.attendance.findMany({
            where: {
                class_id: {
                    in: classIds,
                },
                date: {
                    gte: bounds.startDate,
                    lte: bounds.endDate,
                },
            },
            select: {
                class_id: true,
                student_id: true,
                date: true,
                status: true,
                verification_method: true,
            },
        });

        const classById = new Map(classes.map((classItem) => [classItem.class_id, classItem]));
        const recordMap = new Map();

        attendanceRows.forEach((row) => {
            if (!row.class_id) return;

            const classMeta = classById.get(row.class_id);
            if (!classMeta) return;

            const dateKey = toDateKey(row.date);
            const method = String(row.verification_method || 'manual').toLowerCase();
            const key = `${row.class_id}|${dateKey}|${method}`;
            const existing = recordMap.get(key) || {
                classId: row.class_id,
                className: classMeta.courses?.course_name || 'Class',
                section: classMeta.sections?.section_name || 'N/A',
                department: classMeta.sections?.departments?.department_name || 'N/A',
                date: dateKey,
                presentCount: 0,
                absentCount: 0,
                method,
            };

            const status = String(row.status || '').toLowerCase();
            if (status === 'present') {
                existing.presentCount += 1;
            } else {
                existing.absentCount += 1;
            }

            recordMap.set(key, existing);
        });

        const records = Array.from(recordMap.values()).sort((left, right) => {
            if (left.date === right.date) return right.classId - left.classId;
            return left.date < right.date ? 1 : -1;
        });

        const totalPresent = attendanceRows.filter(
            (row) => String(row.status || '').toLowerCase() === 'present'
        ).length;
        const totalAttendanceRows = attendanceRows.length;
        const overallAttendancePercentage = totalAttendanceRows
            ? Number(((totalPresent / totalAttendanceRows) * 100).toFixed(2))
            : 0;

        const todayKey = toDateKey(new Date());
        const todayClassIds = new Set(
            classes
                .filter((classItem) => classItem.date_of_class && toDateKey(classItem.date_of_class) === todayKey)
                .map((classItem) => classItem.class_id)
        );
        const classesWithAttendanceToday = new Set(
            attendanceRows
                .filter((row) => toDateKey(row.date) === todayKey)
                .map((row) => row.class_id)
        );

        const classesWithoutAttendanceToday = Array.from(todayClassIds).filter(
            (classId) => !classesWithAttendanceToday.has(classId)
        ).length;

        const studentWhere = {
            ...(parsedDepartmentId ? { department_id: parsedDepartmentId } : {}),
            ...(parsedSectionId ? { section_id: parsedSectionId } : {}),
        };

        const students = await prisma.students.findMany({
            where: studentWhere,
            select: {
                student_id: true,
                section_id: true,
            },
        });

        const classesBySection = classes.reduce((accumulator, classItem) => {
            const sectionId = classItem.section_id;
            if (!sectionId) return accumulator;
            accumulator[sectionId] = (accumulator[sectionId] || 0) + 1;
            return accumulator;
        }, {});

        const presentByStudent = attendanceRows.reduce((accumulator, row) => {
            if (!row.student_id) return accumulator;
            if (String(row.status || '').toLowerCase() !== 'present') return accumulator;
            accumulator[row.student_id] = (accumulator[row.student_id] || 0) + 1;
            return accumulator;
        }, {});

        const studentsBelowThreshold = students.reduce((count, student) => {
            const sectionClassCount = student.section_id ? classesBySection[student.section_id] || 0 : 0;
            if (!sectionClassCount) return count;

            const presentCount = presentByStudent[student.student_id] || 0;
            const attendancePercentage = (presentCount / sectionClassCount) * 100;

            return attendancePercentage < parsedThreshold ? count + 1 : count;
        }, 0);

        return res.status(200).json({
            success: true,
            stats: {
                overallAttendancePercentage,
                studentsBelowThreshold,
                classesWithoutAttendanceToday,
                totalClasses: classes.length,
            },
            records,
        });
    } catch (error) {
        console.error('Error in getCoordinatorAttendanceDashboard:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to load coordinator attendance dashboard',
            error: error.message,
        });
    }
};

export const getStudentAttendanceSummary = async (req, res) => {
    try {
        const { studentId } = req.params;
        const parsedStudentId = parseInt(studentId);

        if (!parsedStudentId || Number.isNaN(parsedStudentId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid studentId provided',
            });
        }

        const records = await prisma.attendance.findMany({
            where: {
                student_id: parsedStudentId,
            },
            select: {
                status: true,
                class_id: true,
                classes: {
                    select: {
                        course_id: true,
                        courses: {
                            select: {
                                course_name: true,
                                course_code: true,
                            },
                        },
                    },
                },
            },
        });

        if (!records.length) {
            return res.status(200).json({
                success: true,
                summary: {
                    overallPercentage: 0,
                    totalClasses: 0,
                    attendedClasses: 0,
                    atRisk: true,
                },
                subjects: [],
            });
        }

        const subjectMap = new Map();

        records.forEach((record) => {
            const courseId = record.classes?.course_id || 0;
            const fallbackClassId = record.class_id || 0;
            const key = courseId ? `course-${courseId}` : `class-${fallbackClassId}`;
            const subjectName =
                record.classes?.courses?.course_name ||
                record.classes?.courses?.course_code ||
                (fallbackClassId ? `Class ${fallbackClassId}` : 'Unknown Subject');

            const subjectData = subjectMap.get(key) || {
                subjectId: courseId || fallbackClassId,
                subjectName,
                totalClasses: 0,
                attendedClasses: 0,
            };

            subjectData.totalClasses += 1;
            if (String(record.status || '').toLowerCase() === 'present') {
                subjectData.attendedClasses += 1;
            }

            subjectMap.set(key, subjectData);
        });

        const subjects = Array.from(subjectMap.values())
            .map((subject) => {
                const percentage = subject.totalClasses
                    ? Number(((subject.attendedClasses / subject.totalClasses) * 100).toFixed(2))
                    : 0;

                return {
                    ...subject,
                    attendancePercentage: percentage,
                    status: percentage < 75 ? 'at-risk' : 'good',
                };
            })
            .sort((left, right) => left.subjectName.localeCompare(right.subjectName));

        const totalClasses = subjects.reduce((sum, subject) => sum + subject.totalClasses, 0);
        const attendedClasses = subjects.reduce((sum, subject) => sum + subject.attendedClasses, 0);
        const overallPercentage = totalClasses
            ? Number(((attendedClasses / totalClasses) * 100).toFixed(2))
            : 0;

        return res.status(200).json({
            success: true,
            summary: {
                overallPercentage,
                totalClasses,
                attendedClasses,
                atRisk: overallPercentage < 75,
            },
            subjects,
        });
    } catch (error) {
        console.error('Error in getStudentAttendanceSummary:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch student attendance summary',
            error: error.message,
        });
    }
};