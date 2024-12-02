import express from 'express';
import { generateSchedule, getScheduleBySection } from '../controllers/schedule.controller.js';

const router = express.Router();

router.post("/generate",generateSchedule)
router.get("/section/:section_id",getScheduleBySection)

export default router