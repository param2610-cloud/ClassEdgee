import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

const quizData: QuizQuestion[] = [
  {
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: "Paris"
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: "Mars"
  },
  {
    question: "What is the largest mammal in the world?",
    options: ["African Elephant", "Blue Whale", "Giraffe", "Hippopotamus"],
    correctAnswer: "Blue Whale"
  }
];

const InteractiveQuiz: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [showScore, setShowScore] = useState<boolean>(false);

  const handleAnswerClick = (selectedAnswer: string) => {
    if (selectedAnswer === quizData[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }

    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < quizData.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      setShowScore(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Interactive Quiz</CardTitle>
      </CardHeader>
      <CardContent>
        {showScore ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Quiz Completed!</h2>
            <p className="text-xl mb-4">You scored {score} out of {quizData.length}</p>
            <Button onClick={restartQuiz}>Restart Quiz</Button>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold mb-4">Question {currentQuestion + 1}/{quizData.length}</h2>
            <p className="mb-4">{quizData[currentQuestion].question}</p>
            <div className="space-y-2">
              {quizData[currentQuestion].options.map((option, index) => (
                <Button
                  key={index}
                  className="w-full text-left justify-start"
                  onClick={() => handleAnswerClick(option)}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InteractiveQuiz; 