import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class QuizController {
  async createQuiz(req, res) {
    try {
      const { title, class_id, questions } = req.body;
      const created_by = req.user?.id || 1;

      const quiz = await prisma.quizzes.create({
        data: {
          title,
          class_id,
          created_by,
          quiz_questions: {
            create: questions.map(q => ({
              question_text: q.question_text,
              options: q.options,
              correct_answer: q.correct_answer,
              explanation: q.explanation
            }))
          }
        },
        include: {
          quiz_questions: true
        }
      });

      res.status(201).json({ 
        success: true, 
        message: 'Quiz created successfully', 
        data: quiz 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Error creating quiz', 
        error: error.message 
      });
    }
  }

  async getQuiz(req, res) {
    try {
        // Parse quiz_id as an integer from req.params
        const quiz_id = parseInt(req.params.quiz_id, 10);
        
        // Validate if quiz_id is a valid number
        if (isNaN(quiz_id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid quiz ID provided'
            });
        }

        // Fetch quiz with its questions
        const quiz = await prisma.quizzes.findUnique({
            where: { quiz_id },
            include: {
                quiz_questions: {
                    select: {
                        question_id: true,
                        question_text: true,
                        options: true
                    }
                }
            }
        });

        // If the quiz doesn't exist, return a 404 error
        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        // Respond with the quiz data
        res.json({
            success: true,
            data: quiz
        });
    } catch (error) {
        // Handle unexpected errors
        console.error('Error fetching quiz:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching quiz',
            error: error.message
        });
    }
}


  // async submitQuiz(req, res) {
    // try {
      // const { quiz_id } = req.params;
      // const student_id = req.user.id;
      // const { responses } = req.body;

      // const questions = await prisma.quiz_questions.findMany({
        // where: { quiz_id: parseInt(quiz_id) }
      // });

      // const quiz_responses = await Promise.all(
        // responses.map(async (response) => {
          // const question = questions.find(q => q.question_id === response.question_id);
          // const is_correct = question.correct_answer === response.selected_option;

          // return prisma.quiz_responses.create({
            // data: {
              // quiz_id: parseInt(quiz_id),
              // student_id,
              // question_id: response.question_id,
              // selected_option: response.selected_option,
              // is_correct
            // }
          // });
        // })
      // );

      // res.json({ 
        // success: true, 
        // message: 'Quiz submitted successfully', 
        // data: quiz_responses 
      // });
    // } catch (error) {
      // res.status(500).json({ 
        // success: false, 
        // message: 'Error submitting quiz',  
        // error: error.message 
      // });
    // }
  // }

  async submitQuiz(req, res) {
    try {
      // Extract parameters and user data
      const quiz_id = parseInt(req.params.quiz_id, 10);
      if (isNaN(quiz_id)) {
        return res.status(400).json({ success: false, message: 'Invalid quiz ID' });
      }
  
      const student_id = req.user?.id;
      if (!student_id) {
        return res.status(401).json({ success: false, message: 'Unauthorized user' });
      }
  
      const { responses } = req.body;
      if (!responses || !Array.isArray(responses) || responses.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid responses data' });
      }
  
      // Fetch quiz questions
      const questions = await prisma.quiz_questions.findMany({
        where: { quiz_id },
      });
  
      if (!questions || questions.length === 0) {
        return res.status(404).json({ success: false, message: 'Quiz not found' });
      }
  
      // Process responses
      const quiz_responses = await Promise.all(
        responses.map(async (response) => {
          const question = questions.find(q => q.question_id === response.question_id);
  
          // Handle missing question
          if (!question) {
            throw new Error(`Question ID ${response.question_id} not found in quiz ${quiz_id}`);
          }
  
          const is_correct = question.correct_answer === response.selected_option;
  
          return prisma.quiz_responses.create({
            data: {
              quiz_id,
              student_id,
              question_id: response.question_id,
              selected_option: response.selected_option,
              is_correct,
            },
          });
        })
      );
  
      // Success response
      res.json({
        success: true,
        message: 'Quiz submitted successfully',
        data: quiz_responses,
      });
  
    } catch (error) {
      // Catch and handle errors
      console.error(error); // Log for debugging
      res.status(500).json({
        success: false,
        message: 'Error submitting quiz',
        error: error.message,
      });
    }
  }
  


  async getQuizResults(req, res) {
    try {
      const { quiz_id } = req.params;

      const results = await prisma.$queryRaw`
        SELECT 
          s.student_id,
          s.name as student_name,
          COUNT(CASE WHEN qr.is_correct THEN 1 END) as correct_answers,
          COUNT(*) as total_questions,
          CAST(COUNT(CASE WHEN qr.is_correct THEN 1 END) AS FLOAT) / COUNT(*) * 100 as score
        FROM students s
        JOIN quiz_responses qr ON s.student_id = qr.student_id
        WHERE qr.quiz_id = ${parseInt(quiz_id)}
        GROUP BY s.student_id, s.name
      `;

      res.json({ 
        success: true, 
        data: results 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Error fetching quiz results', 
        error: error.message 
      });
    }
  }
}

export default new QuizController();