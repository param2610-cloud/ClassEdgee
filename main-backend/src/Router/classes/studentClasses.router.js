import express from 'express';
import { getUpcomingClassesOfStudent, pastClasses_student } from '../../controllers/classroom/classes.controller.js';

const router = express.Router();

// Route to get upcoming classes of a faculty
router.get('/upcoming-classes/:studentId/:number_of_class', getUpcomingClassesOfStudent);
router.get("/list-of-past-classes/:studentId",pastClasses_student)

export default router;