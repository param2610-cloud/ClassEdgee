import express from 'express'
import { createCourse, createCourseSyllabus, getAllCourses, getCourseById } from '../../controllers/academy/course.controller.js';
const router = express.Router();


router.post('/', createCourse);
router.get('/', getAllCourses);
router.get('/:id', getCourseById);
router.post('/:id/syllabus/batch', createCourseSyllabus);


export default router