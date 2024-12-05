// import React, { useState } from 'react';
// import axios from 'axios';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { domain } from '@/lib/constant';

// const QuizDashboard = () => {
//   const [quizData, setQuizData] = useState({
//     title: '',
//     class_id: '',
//     questions: [{ 
//       question_text: '', 
//       options: [], 
//       correct_answer: 0 , 
//       explanation: '' 
//     }]
//   });
//   const [quizResults, setQuizResults] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const handleCreateQuiz = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.post(`${domain}/api/v1/quizzes/create`, quizData);
//       if (response.data.success) {
//         setQuizData({
//           title: '',
//           class_id: '',
//           questions: [{ question_text: '', options: [], correct_answer: 0, explanation: '' }]
//         });
//         setError('');
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || 'Error creating quiz');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchQuizResults = async (quiz_id) => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`${domain}/api/v1/quizzes/quiz/${quiz_id}/results`);
//       if (response.data.success) {
//         setQuizResults(response.data.data);
//         setError('');
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || 'Error fetching results');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const addQuestion = () => {
//     setQuizData(prev => ({
//       ...prev,
//       questions: [...prev.questions, { 
//         question_text: '', 
//         options: [], 
//         correct_answer: '', 
//         explanation: '' 
//       }]
//     }));
//   };

//   return (
//     <div className="space-y-8">
//       <Card>
//         <CardHeader>
//           <CardTitle>Create Quiz</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-4">
//             <Input
//               placeholder="Quiz Title"
//               value={quizData.title}
//               onChange={(e) => setQuizData(prev => ({...prev, title: e.target.value}))}
//             />
//             <Input
//               placeholder="Class ID"
//               value={quizData.class_id}
//               onChange={(e) => setQuizData(prev => ({...prev, class_id: e.target.value}))}
//             />
            
//             {quizData.questions.map((q, idx) => (
//               <div key={idx} className="space-y-2 p-4 border rounded">
//                 <Input
//                   placeholder="Question"
//                   value={q.question_text}
//                   onChange={(e) => {
//                     const newQuestions = [...quizData.questions];
//                     newQuestions[idx].question_text = e.target.value;
//                     setQuizData(prev => ({...prev, questions: newQuestions}));
//                   }}
//                 />
//                 <Input
//                   placeholder="Options (comma-separated)"
//                   value={q.options.join(',')}
//                   onChange={(e) => {
//                     const newQuestions = [...quizData.questions];
//                     newQuestions[idx].options = e.target.value.split(',');
//                     setQuizData(prev => ({...prev, questions: newQuestions}));
//                   }}
//                 />
//                 <Input
//                   placeholder="Correct Answer"
//                   value={q.correct_answer}
//                   onChange={(e) => {
//                     const newQuestions = [...quizData.questions];
//                     newQuestions[idx].correct_answer = e.target.value;
//                     setQuizData(prev => ({...prev, questions: newQuestions}));
//                   }}
//                 />
//                 <Input
//                   placeholder="Explanation"
//                   value={q.explanation}
//                   onChange={(e) => {
//                     const newQuestions = [...quizData.questions];
//                     newQuestions[idx].explanation = e.target.value;
//                     setQuizData(prev => ({...prev, questions: newQuestions}));
//                   }}
//                 />
//               </div>
//             ))}
            
//             <div className="space-x-4">
//               <Button onClick={addQuestion}>Add Question</Button>
//               <Button onClick={handleCreateQuiz} disabled={loading}>
//                 Create Quiz
//               </Button>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle>Quiz Results</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <Input
//             placeholder="Quiz ID"
//             onChange={(e) => fetchQuizResults(e.target.value)}
//           />
          
//           {quizResults.length > 0 && (
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Student Name</TableHead>
//                   <TableHead>Correct Answers</TableHead>
//                   <TableHead>Total Questions</TableHead>
//                   <TableHead>Score (%)</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {quizResults.map((result) => (
//                   <TableRow key={result.student_id}>
//                     <TableCell>{result.student_name}</TableCell>
//                     <TableCell>{result.correct_answers}</TableCell>
//                     <TableCell>{result.total_questions}</TableCell>
//                     <TableCell>{result.score.toFixed(2)}%</TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           )}
          
//           {error && <p className="text-red-500 mt-2">{error}</p>}
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default QuizDashboard;








import React, { useState } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { domain } from '@/lib/constant';

const QuizDashboard = () => {
  const [quizData, setQuizData] = useState({
    title: '',
    class_id: null,
    questions: [{ 
      question_text: '', 
      options: ['', '', '', ''],
      correct_answer: 0,
      explanation: '' 
    }]
  });
  const [quizResults, setQuizResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateQuiz = async () => {
    try {
      setLoading(true);
      const formattedData = {
        ...quizData,
        class_id: quizData.class_id !== null ? Number(quizData.class_id) : null,
        questions: quizData.questions.map(q => ({
          ...q,
          correct_answer: Number(q.correct_answer)
        }))
      };
      console.log('Sending quiz data:', formattedData);
      const response = await axios.post(`${domain}/api/v1/quizzes/create`, formattedData);
      if (response.data.success) {
        setQuizData({
          title: '',
          class_id: null,
          questions: [{ question_text: '', options: ['', '', '', ''], correct_answer: 0, explanation: '' }]
        });
        setError('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating quiz');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizResults = async (quiz_id) => {
    try {
      setLoading(true);
      const response = await axios.get(`${domain}/api/v1/quizzes/quiz/${quiz_id}/results`);
     

      if (response.data.success) {
        setQuizResults(response.data.data);
        setError('');
      }
    } catch (err) {
      console.error(error);
      setError(err.response?.data?.message || 'Error fetching results');
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    setQuizData(prev => ({
      ...prev,
      questions: [...prev.questions, { 
        question_text: '', 
        options: ['', '', '', ''],
        correct_answer: 0,
        explanation: '' 
      }]
    }));
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Create Quiz</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Quiz Title"
              value={quizData.title}
              onChange={(e) => setQuizData(prev => ({...prev, title: e.target.value}))}
            />
            <Input
              placeholder="Class ID"
              type="number"
              value={quizData.class_id ?? ''}
              onChange={(e) => {
                // Convert to number or null
                const value = e.target.value === '' ? null : Number(e.target.value);
                setQuizData(prev => ({...prev, class_id: value}))
              }}
              
              
            />
            
            {quizData.questions.map((q, idx) => (
              <div key={idx} className="space-y-2 p-4 border rounded">
                <Input
                  placeholder="Question"
                  value={q.question_text}
                  onChange={(e) => {
                    const newQuestions = [...quizData.questions];
                    newQuestions[idx].question_text = e.target.value;
                    setQuizData(prev => ({...prev, questions: newQuestions}));
                  }}
                />
                {q.options.map((option, optionIdx) => (
                  <Input
                    key={optionIdx}
                    placeholder={`Option ${optionIdx + 1}`}
                    value={option}
                    onChange={(e) => {
                      const newQuestions = [...quizData.questions];
                      newQuestions[idx].options[optionIdx] = e.target.value;
                      setQuizData(prev => ({...prev, questions: newQuestions}));
                    }}
                  />
                ))}
                <Select 
                  value={q.correct_answer.toString()}
                  onValueChange={(value) => {
                    const newQuestions = [...quizData.questions];
                    newQuestions[idx].correct_answer = Number(value);
                    setQuizData(prev => ({...prev, questions: newQuestions}));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select correct answer" />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        Option {num + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Explanation"
                  value={q.explanation}
                  onChange={(e) => {
                    const newQuestions = [...quizData.questions];
                    newQuestions[idx].explanation = e.target.value;
                    setQuizData(prev => ({...prev, questions: newQuestions}));
                  }}
                />
              </div>
            ))}
            
            <div className="space-x-4">
              <Button onClick={addQuestion}>Add Question</Button>
              <Button onClick={handleCreateQuiz} disabled={loading}>
                Create Quiz
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quiz Results</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Quiz ID"
            onChange={(e) => fetchQuizResults(e.target.value)}
          />
          
          {quizResults.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Correct Answers</TableHead>
                  <TableHead>Total Questions</TableHead>
                  <TableHead>Score (%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quizResults.map((result) => (
                  <TableRow key={result.student_id}>
                    <TableCell>{result.student_name}</TableCell>
                    <TableCell>{result.correct_answers}</TableCell>
                    <TableCell>{result.total_questions}</TableCell>
                    <TableCell>{result.score.toFixed(2)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizDashboard;