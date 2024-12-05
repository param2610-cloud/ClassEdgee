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

export default router;