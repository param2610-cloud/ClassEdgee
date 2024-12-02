import { generateSchedule, getLatestSchedule } from "../controllers/schedule/schedule.controller2.js";
import express from "express";
const router = express.Router();



router.post("/generate", generateSchedule);
router.get("/latest",getLatestSchedule)

export default router;