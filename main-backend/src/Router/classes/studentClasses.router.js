import express from 'express';
import { getUpcomingClassesOfStudent } from '../../controllers/classroom/classes.controller.js';

const router = express.Router();

// Route to get upcoming classes of a faculty
router.get('/upcoming-classes/:studentId/:number_of_class', getUpcomingClassesOfStudent);

export default router;