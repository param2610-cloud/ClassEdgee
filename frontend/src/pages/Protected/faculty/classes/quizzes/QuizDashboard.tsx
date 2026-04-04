import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Plus, Save } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import QuizList from './QuizList';
import QuizResults from './QuizResponse';
import { useParams } from 'react-router-dom';
import { createQuiz } from '@/api/quiz.api';
import { useToast } from '@/hooks/use-toast';

// Define the type for a single question
interface Question {
  question_text: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

// Define the type for the quiz data
interface QuizData {
  title: string;
  class_id: string | undefined;
  questions: Question[];
}

const emptyQuizData = (class_id: string | undefined): QuizData => ({
  title: '',
  class_id,
  questions: [{ question_text: '', options: ['', '', '', ''], correct_answer: 0, explanation: '' }],
});

const QuizManagement = () => {
  const { toast } = useToast();
  const { class_id } = useParams();
  const queryClient = useQueryClient();
  const [quizData, setQuizData] = useState<QuizData>(emptyQuizData(class_id));
  const [isOpen, setIsOpen] = useState(false);

  const createMutation = useMutation({
    mutationFn: () =>
      createQuiz({
        title: quizData.title,
        class_id: Number(quizData.class_id),
        questions: quizData.questions,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['class-quizzes', class_id] });
      setIsOpen(false);
      setQuizData(emptyQuizData(class_id));
      toast({
        title: 'Quiz created',
        description: 'The quiz has been published for this class.',
      });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Unable to create quiz';
      toast({
        title: 'Create failed',
        description: message,
        variant: 'destructive',
      });
    },
  });

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

  const updateQuestion = (index: number, field: keyof Question, value: string | number) => {
    setQuizData((prev) => {
      const questions = prev.questions.map((question, questionIndex) => {
        if (questionIndex !== index) return question;
        return {
          ...question,
          [field]: value,
        } as Question;
      });

      return {
        ...prev,
        questions,
      };
    });
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...quizData.questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuizData(prev => ({ ...prev, questions: newQuestions }));
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="quizzes">
        <TabsList>
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="quizzes">
          <div className="flex justify-end mb-4">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" /> Create Quiz</Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Quiz</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Input
                    placeholder="Quiz Title"
                    value={quizData.title}
                    onChange={(e) => setQuizData(prev => ({ ...prev, title: e.target.value }))}
                  />
                  
                  {quizData.questions.map((question, qIndex) => (
                    <Card key={qIndex} className="p-4">
                      <CardHeader>
                        <CardTitle className="text-lg">Question {qIndex + 1}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Input
                          placeholder="Question Text"
                          value={question.question_text}
                          onChange={(e) => updateQuestion(qIndex, 'question_text', e.target.value)}
                        />
                        
                        {question.options.map((option, oIndex) => (
                          <Input
                            key={oIndex}
                            placeholder={`Option ${oIndex + 1}`}
                            value={option}
                            onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                          />
                        ))}
                        
                        <Select
                          value={question.correct_answer.toString()}
                          onValueChange={(value) => updateQuestion(qIndex, 'correct_answer', Number(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Correct Answer" />
                          </SelectTrigger>
                          <SelectContent>
                            {question.options.map((_, index) => (
                              <SelectItem key={index} value={index.toString()}>
                                Option {index + 1}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Input
                          placeholder="Explanation"
                          value={question.explanation}
                          onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                        />
                      </CardContent>
                    </Card>
                  ))}
                  
                  <div className="flex justify-between">
                    <Button onClick={addQuestion} variant="outline">
                      <Plus className="mr-2 h-4 w-4" /> Add Question
                    </Button>
                    <Button
                      onClick={() => { createMutation.mutate(); }}
                      disabled={createMutation.isPending || !quizData.title.trim() || !quizData.class_id}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {createMutation.isPending ? 'Creating...' : 'Create Quiz'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {class_id && <QuizList classId={class_id} />}
        </TabsContent>

        <TabsContent value="results">
          {
            class_id &&<QuizResults classId={class_id} />
          }
          
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuizManagement;