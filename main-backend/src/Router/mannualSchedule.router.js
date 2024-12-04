import express from 'express';
import { assignSchedule, export_schedule, get_available_faculty, get_available_rooms, getTimeSlots, initSchedule, subjectTime } from '../controllers/schedule/mannualSchedule.controller.js';


const router = express.Router();

router.post('/init',initSchedule)
router.get('/grid',getTimeSlots)
router.get('/subjects',subjectTime)
router.get('/faculty',get_available_faculty)
router.get('/rooms',get_available_rooms)
router.post('/assign',assignSchedule)
router.get('/:scheduleId/export',export_schedule)

export default router;