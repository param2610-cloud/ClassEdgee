import express from 'express';
import { generateSchedule } from '../controllers/schedule.controller.js';

const router = express.Router();

router.post("/generate",generateSchedule)

export default router