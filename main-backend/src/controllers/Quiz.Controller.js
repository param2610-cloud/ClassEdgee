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

const SubmitquizResponse =   async (req, res)=> {
  try {
    const {student_id,quizResponses} =req.body 
    console.log("body",req.body);
    
    const {quiz_id} = req.params;
    const questionsData = await prisma.quiz_questions.findMany({
      where: { quiz_id: parseInt(quiz_id) },
      select:{
        question_id:true,
        correct_answer:true
      }
    });
    console.log(questionsData);
    
    const quiz_responses = await Promise.all(
      quizResponses.map(async (response) => {
        const question = questionsData.find(q => q.question_id === response.question_id);
        const is_correct = question.correct_answer === response.selected_option;
        console.log(is_correct);
        
        return prisma.quiz_responses.create({
          data: {
            question_id: response.question_id,
            selected_option: response.selected_option,
            is_correct,
            quizzes: {
              connect: { quiz_id: parseInt(quiz_id) } 
            },
            students: {
              connect: { student_id: student_id }
            },
          }
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
const getQuizResults = async (req, res) => {
  const { class_id } = req.params;
  try {
    const quizData = await prisma.quizzes.findMany({
      where: {
        class_id: parseInt(class_id),
      },
      include: {
        quiz_responses: {
          include: {
            students: {
              include: {
                users: {
                  select: {
                    first_name: true,
                    last_name: true,
                    user_id: true,
                    college_uid: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    console.log(quizData);
    

    const quizResults = quizData.map((quiz) => {
      const quizResponses = quiz.quiz_responses.map((response) => {
        const { student_id, is_correct } = response;
        const { first_name, last_name, user_id, college_uid } = response.students.users;
        return {
          student_id,
          is_correct,
          first_name,
          last_name,
          user_id,
          college_uid,
        };
      });
      return {
        quiz_id: quiz.quiz_id,
        title: quiz.title,
        quiz_responses: quizResponses,
      };
    });
    res.json({
      success: true,
      data: quizResults,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quiz results',
      error: error.message,
    });
  }
};
const createQuiz = async (req, res) => {
  try {
    const { title, class_id, questions } = req.body;
    const created_by = req.user?.id || 1;

    const quiz = await prisma.quizzes.create({
      data: {
        title,
        class_id,
        created_by,
        quiz_questions: {
          create: questions.map((q) => ({
            question_text: q.question_text,
            options: q.options,
            correct_answer: q.correct_answer,
            explanation: q.explanation,
          })),
        },
      },
      include: {
        quiz_questions: true,
      },
    });
    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: quiz,
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating quiz',
      error: error.message,
    });
  }
}
const getQuiz = async (req, res) => {
  try {
    const { class_id } = req.params;
    

    const quiz = await prisma.quizzes.findMany({
      where: { class_id: parseInt(class_id) },
      include: {
        quiz_questions: true,
      }
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    res.json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quiz',
      error: error.message,
    });
  }
}
export {SubmitquizResponse,getQuizResults,createQuiz,getQuiz};



export default new QuizController();