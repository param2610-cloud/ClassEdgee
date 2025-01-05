
import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient()

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your SMTP configuration
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Helper function to calculate attendance percentage
const calculateAttendancePercentage = (totalClasses, attendedClasses) => {
  return (attendedClasses / totalClasses) * 100;
};

// Helper function to format date
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const attendanceEmailController = {
  /**
   * Send emails to students with attendance below 75%
   */
  sendLowAttendanceEmails: async (req, res) => {
    try {
      // Get current semester and academic year
      const currentDate = new Date();
      const academicYear = currentDate.getFullYear();
      
      // Get all students with their attendance records
      const studentsAttendance = await prisma.students.findMany({
        include: {
          attendance: true,
          users: true,
          departments: true
        }
      });

      const lowAttendanceStudents = [];

      // Calculate attendance percentage for each student
      for (const student of studentsAttendance) {
        const totalClasses = await prisma.classes.count({
          where: {
            academic_year: academicYear,
            semester: student.current_semester
          }
        });

        const attendedClasses = student.attendance.filter(
          record => record.status === 'present'
        ).length;

        const attendancePercentage = calculateAttendancePercentage(totalClasses, attendedClasses);

        if (attendancePercentage < 75) {
          lowAttendanceStudents.push({
            student,
            attendancePercentage: attendancePercentage.toFixed(2)
          });
        }
      }

      // Send emails to students with low attendance
      const emailPromises = lowAttendanceStudents.map(async ({ student, attendancePercentage }) => {
        const emailContent = {
          from: process.env.EMAIL_USER,
          to: student.users.email,
          subject: 'Low Attendance Alert',
          html: `
            <h2>Low Attendance Notice</h2>
            <p>Dear ${student.users.first_name} ${student.users.last_name},</p>
            <p>This is to inform you that your attendance is below the required minimum of 75%.</p>
            <p><strong>Current Attendance:</strong> ${attendancePercentage}%</p>
            <p><strong>Department:</strong> ${student.departments.department_name}</p>
            <p><strong>Enrollment Number:</strong> ${student.enrollment_number}</p>
            <p><strong>Semester:</strong> ${student.current_semester}</p>
            <p>Please note that maintaining minimum attendance is mandatory as per institution policy. 
            We strongly advise you to improve your attendance to avoid any academic complications.</p>
            <p>If you have any concerns or require any clarification, please contact your department coordinator.</p>
            <br>
            <p>Best Regards,<br>
            Academic Administration</p>
          `
        };

        return transporter.sendMail(emailContent);
      });

      // Wait for all emails to be sent
      await Promise.all(emailPromises);

      // Log the activity
      await prisma.activitylogs.create({
        data: {
          activity_type: 'ATTENDANCE_EMAIL',
          description: `Low attendance emails sent to ${lowAttendanceStudents.length} students`,
          ip_address: req.ip
        }
      });

      return res.status(200).json({
        success: true,
        message: `Low attendance emails sent to ${lowAttendanceStudents.length} students`,
        affectedStudents: lowAttendanceStudents.map(({ student }) => ({
          id: student.student_id,
          name: `${student.users.first_name} ${student.users.last_name}`,
          email: student.users.email
        }))
      });

    } catch (error) {
      console.error('Error sending attendance emails:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to send attendance emails',
        error: error.message
      });
    }
  },

  /**
   * Get a report of students with low attendance
   */
  getLowAttendanceReport: async (req, res) => {
    try {
      const { semester, department_id, threshold = 75 } = req.query;

      // Build the where clause based on query parameters
      const whereClause = {
        ...(semester && { current_semester: parseInt(semester) }),
        ...(department_id && { department_id: parseInt(department_id) })
      };

      const studentsAttendance = await prisma.students.findMany({
        where: whereClause,
        include: {
          attendance: true,
          users: true,
          departments: true
        }
      });

      const lowAttendanceReport = [];

      for (const student of studentsAttendance) {
        const totalClasses = await prisma.classes.count({
          where: {
            academic_year: new Date().getFullYear(),
            semester: student.current_semester
          }
        });

        const attendedClasses = student.attendance.filter(
          record => record.status === 'present'
        ).length;

        const attendancePercentage = calculateAttendancePercentage(totalClasses, attendedClasses);

        if (attendancePercentage < threshold) {
          lowAttendanceReport.push({
            studentId: student.student_id,
            enrollmentNumber: student.enrollment_number,
            name: `${student.users.first_name} ${student.users.last_name}`,
            email: student.users.email,
            department: student.departments.department_name,
            semester: student.current_semester,
            attendancePercentage: attendancePercentage.toFixed(2),
            totalClasses,
            attendedClasses
          });
        }
      }

      return res.status(200).json({
        success: true,
        totalStudents: lowAttendanceReport.length,
        data: lowAttendanceReport
      });

    } catch (error) {
      console.error('Error generating low attendance report:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate attendance report',
        error: error.message
      });
    }
  }
};
export default attendanceEmailController