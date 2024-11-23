import e from 'express';

import { addCourse, getAllCourse } from '../../controllers/InteractiveClassroom/course.controller';

const router = e.Router();
router.get('/getallcourse',getAllCourse);
router.post('/addcourse',addCourse);

export default router;