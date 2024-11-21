import express from 'express';
import { add_section, listofsection, specific_section_details } from '../controllers/section.controller.js';

const router = express.Router();

router.get("/:section_id",specific_section_details)
router.post("/add-section",add_section)
router.get("/list-of-section",listofsection)

export default router