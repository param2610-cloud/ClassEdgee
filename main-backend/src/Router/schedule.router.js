import { generateSchedule, getLatestSchedule, getAllSchedules } from "../controllers/schedule/schedule.controller2.js";
import express from "express";
const router = express.Router();



router.post("/generate", generateSchedule);
router.get("/:department_id/:academic_year/:batch_year/:semester/:section_id", getLatestSchedule);
router.get("/all-schedules", getAllSchedules);

export default router;