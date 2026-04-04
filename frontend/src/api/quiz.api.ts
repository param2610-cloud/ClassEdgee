import api from "@/api/axios";

export interface QuizQuestionInput {
  question_text: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
}

export interface QuizQuestion {
  question_id: number;
  question_text: string;
  options: string[];
  correct_answer?: number;
  explanation?: string;
}

export interface Quiz {
  quiz_id: number;
  title: string;
  description?: string;
  created_at?: string;
  quiz_questions: QuizQuestion[];
}

export interface CreateQuizPayload {
  title: string;
  class_id: number;
  questions: QuizQuestionInput[];
}

export interface SubmitQuizPayload {
  student_id: number;
  quizResponses: Array<{
    question_id: number;
    selected_option: number;
  }>;
}

export interface QuizResultRow {
  student_id: number;
  first_name: string;
  last_name: string;
  college_uid: string;
  is_correct: boolean;
}

export interface QuizResult {
  quiz_id: number;
  title: string;
  quiz_responses: QuizResultRow[];
}

export const createQuiz = async (payload: CreateQuizPayload): Promise<Quiz> => {
  const response = await api.post("/api/v1/quizzes/create", payload);

  if (!response.data?.success) {
    throw new Error(response.data?.message || "Failed to create quiz");
  }

  return response.data.data as Quiz;
};

export const getClassQuizzes = async (classId: number | string): Promise<Quiz[]> => {
  const response = await api.get(`/api/v1/quizzes/${classId}`);

  if (!response.data?.success) {
    throw new Error(response.data?.message || "Failed to fetch quizzes");
  }

  const payload = response.data?.data;
  return Array.isArray(payload) ? (payload as Quiz[]) : [];
};

export const getQuizResultsByClass = async (
  classId: number | string
): Promise<QuizResult[]> => {
  const response = await api.get(`/api/v1/quizzes/${classId}/results`);

  if (!response.data?.success) {
    throw new Error(response.data?.message || "Failed to fetch quiz results");
  }

  const payload = response.data?.data;
  return Array.isArray(payload) ? (payload as QuizResult[]) : [];
};

export const submitQuizResponse = async (
  quizId: number,
  payload: SubmitQuizPayload
): Promise<void> => {
  const response = await api.post(`/api/v1/quizzes/${quizId}/submit`, payload);

  if (!response.data?.success) {
    throw new Error(response.data?.message || "Failed to submit quiz");
  }
};
