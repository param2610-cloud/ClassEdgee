import express from 'express'
import { createSubject, getSubject, getSubjectName, list_of_subject_for_semester } from '../../controllers/academy/subject.controller.js';

const router = express.Router();


router.post("/:syllabusId",createSubject)
router.get("/:subjectId",getSubject)
router.get("/get-subject-name/:subjectId",getSubjectName)
router.get("/list-of-subjects-for-semester/:course_id/:semester",list_of_subject_for_semester)

export default router