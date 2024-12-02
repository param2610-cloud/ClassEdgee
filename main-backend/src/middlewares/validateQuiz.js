
const validateQuiz = (req, res, next) => {
    const { title, questions } = req.body;
  
    if (!title || !title.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Quiz title is required' 
      });
    }
  
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'At least one question is required' 
      });
    }
  
    for (const question of questions) {
      if (!question.question_text || !question.question_text.trim()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Question text is required' 
        });
      }
  
      if (!Array.isArray(question.options) || question.options.length !== 4) {
        return res.status(400).json({ 
          success: false, 
          message: 'Each question must have exactly 4 options' 
        });
      }
  
      if (typeof question.correct_answer !== 'number' || 
          question.correct_answer < 0 || 
          question.correct_answer > 3) {
        return res.status(400).json({ 
          success: false, 
          message: 'Valid correct answer index (0-3) is required' 
        });
      }
    }
  
    next();
  };
  
  export default validateQuiz;