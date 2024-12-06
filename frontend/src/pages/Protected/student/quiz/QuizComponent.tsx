import React, { useState } from "react";
import { Class } from "@/interface/general";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { userDataAtom } from "@/store/atom";
import { useAtom } from "jotai";
import axios from "axios";
import { domain } from "@/lib/constant";

interface QuizQuestion {
  question_id: number;
  question_text: string;
  options: string[];
}

interface Quiz {
  quiz_id: number;
  title: string;
  description: string;
  quiz_questions: QuizQuestion[];
}

const QuizDrawerComponent = ({ classData }: { classData: Class }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [responses, setResponses] = useState<{ [key: number]: number }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [studentData] = useAtom(userDataAtom);

  const handleQuizStart = () => {
    if (classData?.quizzes?.[0]) {
      setCurrentQuiz(classData.quizzes[0]);
      setIsOpen(true);
    }
  };

  const handleOptionSelect = (questionId: number, optionIndex: number) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const quizResponses = Object.entries(responses).map(
        ([question_id, selected_option]) => ({
          question_id: parseInt(question_id),
          selected_option,
        })
      );
      if (!studentData?.students?.student_id) return;
      await axios.post(
        `${domain}/api/v1/quizzes/${currentQuiz?.quiz_id}/submit`,
        {
          student_id: studentData?.students?.student_id,
          quizResponses,
        }
      );

      setSubmitted(true);
    } catch (err) {
      setError("Failed to submit quiz");
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (!currentQuiz) return null;
    if (submitted) {
      return (
        <div className="p-6 text-center">
          <h3 className="text-xl font-semibold mb-4">
            Quiz Submitted Successfully
          </h3>
          <p className="text-gray-600">Your responses have been recorded.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6 p-4">
        {currentQuiz.quiz_questions.map((question) => (
          <div
            key={question.question_id}
            className="bg-white p-4 rounded-lg shadow-sm"
          >
            <h3 className="text-lg font-medium mb-4">
              {question.question_text}
            </h3>
            <div className="space-y-2">
              {question.options.map((option, index) => (
                <label
                  key={index}
                  className="flex items-center p-3 border rounded hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name={`question_${question.question_id}`}
                    checked={responses[question.question_id] === index}
                    onChange={() =>
                      handleOptionSelect(question.question_id, index)
                    }
                    className="mr-3"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button
          onClick={handleQuizStart}
          className="bg-blue-500 hover:bg-blue-600 text-white"
          disabled={!classData?.quizzes?.length}
        >
          Start Quiz
          {classData?.quizzes?.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {classData.quizzes.length}
            </Badge>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="w-4/5 mx-auto">
        <DrawerHeader>
          <DrawerTitle>{currentQuiz?.title || "Class Quiz"}</DrawerTitle>
          <DrawerDescription>
            {currentQuiz?.description || "Complete all questions to submit"}
          </DrawerDescription>
        </DrawerHeader>

        <div className="max-h-[70vh] overflow-y-auto">{renderContent()}</div>

        <DrawerFooter className="flex flex-row justify-between">
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
          {!submitted && currentQuiz && (
            <Button
              onClick={handleSubmit}
              disabled={
                isLoading ||
                Object.keys(responses).length !==
                  currentQuiz.quiz_questions.length
              }
            >
              {isLoading ? "Submitting..." : "Submit Quiz"}
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default QuizDrawerComponent;
