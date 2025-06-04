import axios from "axios";
import type { PublicQuiz } from "./quizService";

const API_BASE_URL = "http://localhost:8080";

export interface QuizSession {
  sessionId: string;
  examQuizzesId: string;
  userId: string;
  startTime: string;
  endTime?: string;
  status: "active" | "completed" | "expired";
  currentQuestionIndex: number;
  answers: Record<string, string[]>; // questionId -> selectedAnswerIds
  flaggedQuestions: string[];
  timeRemaining: number; // in seconds
}

export interface QuizSubmission {
  sessionId: string;
  examQuizzesId: string;
  userId: string;
  answers: Record<string, string[]>;
  submittedAt: string;
  timeSpent: number; // in seconds
}

export interface QuizResult {
  submissionId: string;
  examQuizzesId: string;
  userId: string;
  score: number;
  maxScore: number;
  percentage: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  submittedAt: string;
  gradedAt: string;
  answers: {
    questionId: string;
    selectedAnswers: string[];
    correctAnswers: string[];
    isCorrect: boolean;
    points: number;
  }[];
}

export interface StartQuizResponse {
  status: number;
  message: string;
  data: {
    sessionId: string;
    quiz: PublicQuiz;
    timeLimit: number; // in seconds
    startTime: string;
  };
  timestamp: string;
}

export interface SubmitQuizResponse {
  status: number;
  message: string;
  data: QuizResult;
  timestamp: string;
}

export interface SaveAnswerRequest {
  sessionId: string;
  questionId: string;
  selectedAnswers: string[];
  isFlagged?: boolean;
}

export interface SaveAnswerResponse {
  status: number;
  message: string;
  data: {
    saved: boolean;
    timestamp: string;
  };
}

class QuizSubmissionService {
  /**
   * Start a new quiz session
   */
  async startQuiz(examQuizzesId: string): Promise<StartQuizResponse> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/quiz/start`,
        { examQuizzesId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.getAuthToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error starting quiz:", error);
      throw error;
    }
  }

  /**
   * Save answer for a question
   */
  async saveAnswer(request: SaveAnswerRequest): Promise<SaveAnswerResponse> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/quiz/save-answer`,
        request,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.getAuthToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error saving answer:", error);
      throw error;
    }
  }

  /**
   * Submit quiz for grading
   */
  async submitQuiz(sessionId: string): Promise<SubmitQuizResponse> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/quiz/submit`,
        { sessionId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.getAuthToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error submitting quiz:", error);
      throw error;
    }
  }

  /**
   * Get quiz session status
   */
  async getQuizSession(sessionId: string): Promise<QuizSession> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/quiz/session/${sessionId}`,
        {
          headers: {
            Authorization: `Bearer ${this.getAuthToken()}`,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error getting quiz session:", error);
      throw error;
    }
  }

  /**
   * Get quiz result
   */
  async getQuizResult(submissionId: string): Promise<QuizResult> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/quiz/result/${submissionId}`,
        {
          headers: {
            Authorization: `Bearer ${this.getAuthToken()}`,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error getting quiz result:", error);
      throw error;
    }
  }

  /**
   * Flag/unflag a question
   */
  async toggleQuestionFlag(
    sessionId: string,
    questionId: string,
    isFlagged: boolean
  ): Promise<void> {
    try {
      await axios.post(
        `${API_BASE_URL}/quiz/flag-question`,
        { sessionId, questionId, isFlagged },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.getAuthToken()}`,
          },
        }
      );
    } catch (error) {
      console.error("Error toggling question flag:", error);
      throw error;
    }
  }

  /**
   * Get auth token from storage
   */
  private getAuthToken(): string | null {
    return sessionStorage.getItem("quiz_app_access_token");
  }

  /**
   * Mock implementation for development
   */
  async mockStartQuiz(examQuizzesId: string): Promise<StartQuizResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const sessionId = `session_${Date.now()}`;
    const startTime = new Date().toISOString();

    return {
      status: 200,
      message: "Quiz started successfully",
      data: {
        sessionId,
        quiz: {
          examQuizzesId,
          classesId: "class_1",
          title: "Mock Quiz",
          startTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          endTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
          createdBy: "Teacher",
          totalQuestions: 10,
          createdAt: startTime,
          updatedAt: startTime,
          code: "QUIZ001",
          questions: null,
        },
        timeLimit: 3600, // 1 hour
        startTime,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Mock save answer
   */
  async mockSaveAnswer(
    request: SaveAnswerRequest
  ): Promise<SaveAnswerResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    return {
      status: 200,
      message: "Answer saved successfully",
      data: {
        saved: true,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Mock submit quiz
   */
  async mockSubmitQuiz(sessionId: string): Promise<SubmitQuizResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const score = Math.floor(Math.random() * 30) + 70; // Random score 70-100
    const totalQuestions = 10;
    const correctAnswers = Math.floor((score / 100) * totalQuestions);

    const result: QuizResult = {
      submissionId: `submission_${Date.now()}`,
      examQuizzesId: "quiz_1",
      userId: "user_1",
      score,
      maxScore: 100,
      percentage: score,
      correctAnswers,
      totalQuestions,
      timeSpent: 1800, // 30 minutes
      submittedAt: new Date().toISOString(),
      gradedAt: new Date().toISOString(),
      answers: Array.from({ length: totalQuestions }, (_, i) => ({
        questionId: `question_${i + 1}`,
        selectedAnswers: [`answer_${i + 1}_1`],
        correctAnswers: [`answer_${i + 1}_1`],
        isCorrect: i < correctAnswers,
        points: i < correctAnswers ? 10 : 0,
      })),
    };

    return {
      status: 200,
      message: "Quiz submitted successfully",
      data: result,
      timestamp: new Date().toISOString(),
    };
  }
}

// Export singleton instance
export const quizSubmissionService = new QuizSubmissionService();

// Export class for testing
export { QuizSubmissionService };
