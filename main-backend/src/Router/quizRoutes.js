import express from 'express';
import QuizController, { createQuiz, getQuizResults, SubmitquizResponse } from '../controllers/Quiz.Controller.js';
import validateQuiz from '../middlewares/validateQuiz.js';
// import auth from '../middlewares/auth.js'; // Your existing auth middleware

const router = express.Router();

// Teacher routes
router.post('/create', createQuiz);
router.get('/:class_id/results', getQuizResults);

// Student routes
router.get('/:quiz_id', QuizController.getQuiz);
router.post('/:quiz_id/submit', SubmitquizResponse);

export default router;