import express from 'express';
import QuizController from '../controllers/QuizController.js';
import validateQuiz from '../middlewares/validateQuiz.js';
import validateQuizSubmission from '../middlewares/validateQuizSubmission.js';
// import auth from '../middlewares/auth.js'; // Your existing auth middleware

const router = express.Router();

// Teacher routes
router.post('/create', validateQuiz, QuizController.createQuiz);
router.get('/:quiz_id/results', QuizController.getQuizResults);

// Student routes
router.get('/:quiz_id', QuizController.getQuiz);
router.post('/:quiz_id/submit', validateQuizSubmission, QuizController.submitQuiz);

export default router;