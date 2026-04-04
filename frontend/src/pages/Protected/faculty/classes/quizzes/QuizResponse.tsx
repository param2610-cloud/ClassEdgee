import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getQuizResultsByClass, QuizResult, QuizResultRow } from '@/api/quiz.api';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/shared';
import { BarChart3 } from 'lucide-react';

interface StudentScore {
  student_id: number;
  first_name: string;
  last_name: string;
  college_uid: string;
  correct_answers: number;
  total_questions: number;
  score_percentage: number;
}

const aggregateScores = (responses: QuizResultRow[]): StudentScore[] => {
  const grouped = new Map<number, StudentScore>();

  responses.forEach((response) => {
    const existing = grouped.get(response.student_id);

    if (!existing) {
      grouped.set(response.student_id, {
        student_id: response.student_id,
        first_name: response.first_name,
        last_name: response.last_name,
        college_uid: response.college_uid,
        correct_answers: response.is_correct ? 1 : 0,
        total_questions: 1,
        score_percentage: 0,
      });
      return;
    }

    existing.total_questions += 1;
    if (response.is_correct) {
      existing.correct_answers += 1;
    }
  });

  return Array.from(grouped.values()).map((row) => ({
    ...row,
    score_percentage: row.total_questions
      ? Number(((row.correct_answers / row.total_questions) * 100).toFixed(1))
      : 0,
  }));
};

const QuizResults = ({ classId }: { classId: string }) => {
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuizResults = async () => {
      try {
        const data = await getQuizResultsByClass(classId);
        setQuizResults(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch quiz results';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    if (classId) {
      fetchQuizResults();
    }
  }, [classId]);

  if (loading) return <LoadingSkeleton variant="table" rows={4} />;
  if (error) return <ErrorState message={error} />;
  if (!quizResults.length) {
    return (
      <EmptyState
        icon={BarChart3}
        title="No results yet"
        description="Quiz results will appear here once students submit responses."
      />
    );
  }

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
                      <TableHead>Correct</TableHead>
                      <TableHead>Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {aggregateScores(quiz.quiz_responses).map((student) => (
                      <TableRow key={`${quiz.quiz_id}-${student.student_id}`}>
                        <TableCell>{student.student_id}</TableCell>
                        <TableCell>{`${student.first_name} ${student.last_name}`}</TableCell>
                        <TableCell>{student.college_uid}</TableCell>
                        <TableCell>{`${student.correct_answers}/${student.total_questions}`}</TableCell>
                        <TableCell>
                          <span
                            className={`rounded px-2 py-1 text-xs font-medium ${
                              student.score_percentage >= 60
                                ? 'bg-green-100 text-green-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {student.score_percentage}%
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