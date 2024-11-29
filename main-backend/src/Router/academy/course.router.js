import express from 'express'
import { createCourse, createCourseSyllabus, getAllCourses, getCoursebyDepartmentId, getCourseById } from '../../controllers/academy/course.controller.js';
const router = express.Router();


router.post('/', createCourse);
router.get('/', getAllCourses);
router.get('/:id', getCourseById);
router.post('/:id/syllabus/batch', createCourseSyllabus);
router.get("/getcourse-by-department-id/:department_id",getCoursebyDepartmentId);


export default router