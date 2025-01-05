import e from 'express'
import { createFeedback,getFeedback } from '../../controllers/InteractiveClassroom/feedback.controller.js';

const router = e.Router();

router.post('/createFeedback',createFeedback)
router.get('/getFeedback',getFeedback)

export default router;