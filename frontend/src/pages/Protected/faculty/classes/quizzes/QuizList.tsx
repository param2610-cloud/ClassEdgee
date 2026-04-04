import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';
import { getClassQuizzes } from '@/api/quiz.api';
import { ErrorState, EmptyState, LoadingSkeleton } from '@/components/shared';
import { BookOpen } from 'lucide-react';

const QuizList = ({ classId }: { classId: string }) => {
  const quizzesQuery = useQuery({
    queryKey: ['class-quizzes', classId],
    queryFn: () => getClassQuizzes(classId),
    enabled: Boolean(classId),
  });

  if (quizzesQuery.isLoading) return <LoadingSkeleton variant="table" rows={3} />;

  if (quizzesQuery.isError) {
    const message =
      quizzesQuery.error instanceof Error
        ? quizzesQuery.error.message
        : 'Failed to load quizzes';
    return (
      <ErrorState
        message={message}
        onRetry={() => { quizzesQuery.refetch(); }}
      />
    );
  }

  const quizzes = quizzesQuery.data ?? [];

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
