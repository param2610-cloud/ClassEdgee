import attendanceEmailController from '../controllers/lowAttendance.controller.js';
import e from 'express';
const router = e.Router();

import { 
    getActiveClass,
    markAttendance,
    getAttendanceHistory
} from '../controllers/attendance.controller.js';

router.get('/active-class/:facultyId', getActiveClass);
router.post('/mark-attendance', markAttendance);
router.get('/history/:classId', getAttendanceHistory);

router.post('/send-attendance-emails', attendanceEmailController.sendLowAttendanceEmails);
router.get('/low-attendance-report', attendanceEmailController.getLowAttendanceReport);

export default router;