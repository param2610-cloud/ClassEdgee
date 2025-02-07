import e from 'express';
import courseRouter from './academy/course.router.js';
import syllabusRouter from './academy/syllabus.router.js';
import subjectRouter from './academy/subject.router.js';
import unitRouter from './academy/unit.router.js';
import topicRouter from './academy/topic.router.js';
import { upload } from '../utils/multer.js';
import { batchUploadController } from '../controllers/academy/batch.controller.js';

const router =e.Router();

//course router
router.use('/course',courseRouter)


//syllabus router
router.use('/syllabus',syllabusRouter)


//subject router
router.use('/subject',subjectRouter)


//unit router
router.use('/unit',unitRouter)


//topic router
router.use('/topic',topicRouter)


router.post('/batch',batchUploadController)
export default router;