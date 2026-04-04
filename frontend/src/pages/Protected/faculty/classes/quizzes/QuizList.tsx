import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';
import { getClassQuizzes, Quiz } from '@/api/quiz.api';
import { ErrorState, EmptyState, LoadingSkeleton } from '@/components/shared';
import { BookOpen } from 'lucide-react';

const QuizList = ({ classId, refreshVersion = 0 }: { classId: string; refreshVersion?: number }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await getClassQuizzes(classId);
        setQuizzes(data);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load quizzes';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [classId, refreshVersion]);

  if (loading) return <LoadingSkeleton variant="table" rows={3} />;
  if (error) return <ErrorState message={error} />;

  if (!quizzes.length) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No quizzes published"
        description="Create the first quiz for this class to start assessments."
      />
    );
  }

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
                  {quiz.created_at
                    ? formatDistanceToNow(new Date(quiz.created_at), { addSuffix: true })
                    : "-"}
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