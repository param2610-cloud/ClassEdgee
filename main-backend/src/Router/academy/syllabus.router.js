import express from 'express';
import { createSyllabus, getSyllabusByCourse, getSyllabusIDByCourseANDSemester, getSyllabusSubjects, validateSyllabus } from '../../controllers/academy/syllabus.controller.js';

const router = express.Router();

router.post('/:courseId', createSyllabus);
router.get('/:courseId', getSyllabusByCourse);
router.get('/:courseId/:semester', getSyllabusIDByCourseANDSemester);
router.get('/:syllabusId/subjects', getSyllabusSubjects);
router.post('/validate', validateSyllabus);

export default router