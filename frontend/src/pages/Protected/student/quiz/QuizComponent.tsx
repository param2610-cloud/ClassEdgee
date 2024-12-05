import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { domain } from '@/lib/constant';


// TypeScript interfaces for type safety
interface QuizQuestion {
  question_id: number;
  question_text: string;
  options: string[];
}

interface Quiz {
  quiz_id: number;
  quiz_questions: QuizQuestion[];
}

interface QuizResponse {
  question_id: number;
  selected_option: string;
}

const QuizComponent: React.FC = () => {
  const { quiz_id } = useParams<{ quiz_id: string }>();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [responses, setResponses] = useState<{ [key: number]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);



  const studentId = localStorage.getItem('student_id');

  // Fetch quiz on component mount
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${domain}/api/v1/quizzes/7`);
        
        if (response.data.success) {
          setQuiz(response.data.data);
        } else {
          setError(response.data.message || 'Failed to fetch quiz');
        }
      } catch (err) {
        setError('Error fetching quiz. Please try again.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [quiz_id, studentId]);

  // Handle option selection
  const handleOptionSelect = (questionId: number, option: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  // Submit quiz
  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      // Prepare responses in the format expected by backend
      const quizResponses: QuizResponse[] = Object.entries(responses).map(
        ([question_id, selected_option]) => ({
          question_id: parseInt(question_id),
          selected_option
        })
      );

      const response = await axios.post(`${domain}/api/v1/quizzes/7/submit`, {
        student_id: studentId,
        responses: quizResponses
      });

      if (response.data.success) {
        setSubmitted(true);
        setSubmissionResult(response.data);
      } else {
        setError(response.data.message || 'Quiz submission failed');
      }
    } catch (err) {
      setError('Error submitting quiz. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Render loading state
  if (isLoading) {
    return <div className="text-center p-4">Loading quiz...</div>;
  }

  // Render error state
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        {error}
      </div>
    );
  }

  // Render submitted state
  if (submitted) {
    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Quiz Submitted</h2>
        <p>Thank you for completing the quiz!</p>
        {submissionResult && (
          <div>
            <h3 className="text-xl mt-4">Submission Details:</h3>
            <pre>{JSON.stringify(submissionResult, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  }

  // Render quiz questions
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Quiz</h1>
      {quiz?.quiz_questions.map((question) => (
        <div key={question.question_id} className="mb-6 p-4 border rounded">
          <h2 className="text-xl font-semibold mb-4">{question.question_text}</h2>
          <div className="space-y-2">
            {question.options.map((option) => (
              <label 
                key={option} 
                className={`block p-2 border rounded cursor-pointer 
                  ${responses[question.question_id] === option 
                    ? 'bg-blue-100 border-blue-300' 
                    : 'hover:bg-gray-100'}`}
              >
                <input
                  type="radio"
                  name={`question_${question.question_id}`}
                  value={option}
                  checked={responses[question.question_id] === option}
                  onChange={() => handleOptionSelect(question.question_id, option)}
                  className="mr-2"
                />
                {option}
              </label>
            ))}
          </div>
        </div>
      ))}
      <button
        onClick={handleSubmit}
        disabled={
          isLoading || 
          Object.keys(responses).length !== quiz?.quiz_questions.length
        }
        className={`w-full p-3 rounded text-white font-bold 
          ${Object.keys(responses).length === quiz?.quiz_questions.length 
            ? 'bg-blue-500 hover:bg-blue-600' 
            : 'bg-gray-400 cursor-not-allowed'}`}
      >
        {isLoading ? 'Submitting...' : 'Submit Quiz'}
      </button>
    </div>
  );
};

export default QuizComponent;