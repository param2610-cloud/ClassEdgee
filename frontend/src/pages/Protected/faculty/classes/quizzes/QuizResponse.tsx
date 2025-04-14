import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { domain } from '@/lib/constant';
import axios from 'axios';

interface QuizResponseData {
  student_id: number;
  first_name: string;
  last_name: string;
  college_uid: string;
  is_correct: boolean;
}

interface QuizResult {
  quiz_id: number;
  title: string;
  quiz_responses: QuizResponseData[];
}

const QuizResults = ({ classId }: { classId: string }) => {
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuizResults = async () => {
      try {
        const response = await axios.get(`${domain}/api/v1/quizzes/${classId}/results`);
        if (response.data.success) {
          setQuizResults(response.data.data);
        }
      } catch (err) {
        setError('Failed to fetch quiz results');
      } finally {
        setLoading(false);
      }
    };

    if (classId) {
      fetchQuizResults();
    }
  }, [classId]);

  if (loading) return <div className="text-center p-4">Loading results...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quiz Results</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible>
          {quizResults.map((quiz) => (
            <AccordionItem key={quiz.quiz_id} value={quiz.quiz_id.toString()}>
              <AccordionTrigger className="text-lg font-semibold">
                {quiz.title}
              </AccordionTrigger>
              <AccordionContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>College UID</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quiz.quiz_responses.map((response: QuizResponseData) => (
                      <TableRow key={`${quiz.quiz_id}-${response.student_id}`}>
                        <TableCell>{response.student_id}</TableCell>
                        <TableCell>{`${response.first_name} ${response.last_name}`}</TableCell>
                        <TableCell>{response.college_uid}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded ${
                            response.is_correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {response.is_correct ? 'Correct' : 'Incorrect'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default QuizResults;