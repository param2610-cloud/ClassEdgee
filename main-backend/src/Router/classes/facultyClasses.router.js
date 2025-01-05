import express from 'express';
import { getUpcomingClassesOfFaculty, pastClasses_faculty } from '../../controllers/classroom/classes.controller.js';

const router = express.Router();

// Route to get upcoming classes of a faculty
router.get('/upcoming-classes/:facultyId/:number_of_class', getUpcomingClassesOfFaculty);
router.get("/list-of-past-classes/:facultyId",pastClasses_faculty)
export default router;