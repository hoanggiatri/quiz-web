import axios from "axios";

const API_BASE_URL = "http://localhost:8080";

export interface PublicQuiz {
  examQuizzesId: string;
  classesId: string;
  title: string;
  startTime: string;
  endTime: string;
  createdBy: string;
  totalQuestions: number;
  createdAt: string;
  updatedAt: string;
  code: string;
  questions: Question[] | null;
}

export interface Question {
  id: string;
  content: string;
  type: "singleChoice" | "multipleChoice";
  difficultyLevel: "Easy" | "Medium" | "Hard";
  media_url: string | null;
  createdBy: string;
  categoryId: string;
  answers: Answer[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface Answer {
  id: string;
  content: string;
  questionId: string;
  correct: boolean;
}

export interface QuizResponse {
  status: number;
  message: string;
  data: PublicQuiz[];
  timestamp: string;
}

export interface QuizDetailResponse {
  status: number;
  message: string;
  data: PublicQuiz;
  timestamp: string;
}

export interface AnswerResponse {
  status: number;
  message: string;
  data: Answer[];
  timestamp: string;
}

export const quizService = {
  getAllPublicQuizzes: async (): Promise<QuizResponse> => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/teacher/get-all-public-quizzes`,
        {
          headers: {
            Accept: "*/*",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching public quizzes:", error);
      throw error;
    }
  },

  getQuizQuestions: async (
    examQuizzesId: string
  ): Promise<QuizDetailResponse> => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/teacher/get-all-question-in-public-quizzes/${examQuizzesId}`,
        {
          params: { examQuizzesId },
          headers: {
            Accept: "*/*",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching quiz questions:", error);
      throw error;
    }
  },

  getQuestionAnswers: async (questionId: string): Promise<AnswerResponse> => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/teacher/get-all-answer-by-questionId/${questionId}`,
        {
          params: { questionId },
          headers: {
            Accept: "*/*",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching question answers:", error);
      throw error;
    }
  },
};
