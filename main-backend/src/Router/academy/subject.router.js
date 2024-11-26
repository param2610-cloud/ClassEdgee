import express from 'express'
import { createSubject, getSubject } from '../../controllers/academy/subject.controller.js';

const router = express.Router();


router.post("/:syllabusId",createSubject)
router.get("/:subjectId",getSubject)

export default router