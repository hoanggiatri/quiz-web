import axios from "axios";
import type {
  ExamUserQuizzesResponse,
  CreateSubmissionResponse,
  SubmitAnswerRequest,
  SubmitSingleAnswerRequest,
  SubmitSingleAnswerResponse,
  FinishSubmissionResponse,
} from "@/types/quiz";

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
      const response = await axios.get(`${API_BASE_URL}/get-all-exam-quizzes`, {
        headers: {
          Accept: "*/*",
        },
      });
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
        `${API_BASE_URL}/get-all-question-in-exam-quizzes/${examQuizzesId}`,
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

  // API để lấy bộ đề câu hỏi của user
  getExamUserQuizzes: async (
    userId: string,
    examQuizzesId: string
  ): Promise<ExamUserQuizzesResponse> => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/exam-user-quizzes/get-exam-user-quizzes/${userId}/${examQuizzesId}`,
        {
          headers: {
            Accept: "*/*",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching exam user quizzes:", error);
      throw error;
    }
  },

  // API để tạo submission cho user
  createSubmission: async (
    userId: string,
    examQuizzesId: string
  ): Promise<CreateSubmissionResponse> => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/submit-answer/create-submission/${userId}/${examQuizzesId}`,
        {},
        {
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating submission:", error);
      throw error;
    }
  },

  // API để submit single answer (auto-save mỗi lần click)
  submitSingleAnswer: async (
    submitData: SubmitSingleAnswerRequest
  ): Promise<SubmitSingleAnswerResponse> => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/submit-answer/submit`,
        submitData,
        {
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error submitting single answer:", error);
      throw error;
    }
  },

  // API để finish submission (nộp bài)
  finishSubmission: async (
    submissionId: string
  ): Promise<FinishSubmissionResponse> => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/submit-answer/finish/${submissionId}`,
        {},
        {
          headers: {
            Accept: "*/*",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error finishing submission:", error);
      throw error;
    }
  },

  // API để submit answers (deprecated - sử dụng finishSubmission thay thế)
  submitAnswers: async (submitData: SubmitAnswerRequest): Promise<any> => {
    try {
      // TODO: Implement submit answers API call
      console.log("Submitting answers:", submitData);

      // Mock response for now
      return {
        status: 200,
        message: "Answers submitted successfully",
        data: {
          submissionId: submitData.submissionId,
          totalAnswers: submitData.answers.length,
          submittedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error("Error submitting answers:", error);
      throw error;
    }
  },
};
