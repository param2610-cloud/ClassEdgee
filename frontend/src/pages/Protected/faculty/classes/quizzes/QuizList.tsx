import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';
import { domain } from '@/lib/constant';
import axios from 'axios';

// Define the structure of a quiz object
interface Quiz {
  quiz_id: number;
  title: string;
  quiz_questions: any[]; // Use a more specific type if the structure of questions is known
  created_at: string; // Or Date if you parse it immediately
}

const QuizList = ({ classId }: { classId: string }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await axios.get(`${domain}/api/v1/quizzes/${classId}`);
        if (response.data.success) {
          setQuizzes(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [classId]);

  if (loading) return <div>Loading quizzes...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Quizzes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Questions</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quizzes.map((quiz) => (
              <TableRow key={quiz.quiz_id}>
                <TableCell className="font-medium">{quiz.title}</TableCell>
                <TableCell>{quiz.quiz_questions.length}</TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(quiz.created_at), { addSuffix: true })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default QuizList;