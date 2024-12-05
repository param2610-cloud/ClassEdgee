import express from 'express';
import { getUpcomingClassesOfFaculty } from '../../controllers/classroom/classes.controller.js';

const router = express.Router();

// Route to get upcoming classes of a faculty
router.get('/upcoming-classes/:facultyId/:number_of_class', getUpcomingClassesOfFaculty);

export default router;