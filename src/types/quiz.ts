export enum QuestionType {
  SINGLE_CHOICE = "single_choice",
  MULTIPLE_CHOICE = "multiple_choice",
}

// Kiểu dữ liệu cho đáp án
export interface Answer {
  id: string;
  content: string;
  isCorrect: boolean;
}

// Kiểu dữ liệu cho câu hỏi
export interface Question {
  id: number;
  type: QuestionType;
  content: string; // Đổi từ 'text' thành 'content'. Có thể chứa Markdown, LaTeX, URL ảnh (qua thẻ <img>)
  answers: Answer[];
}

// Kiểu dữ liệu cho trạng thái câu trả lời của người dùng
export interface UserAnswer {
  questionId: number;
  selectedAnswerIds: string[];
  isMarkedForReview: boolean;
}

// Kiểu dữ liệu cho trạng thái câu hỏi trong bản đồ
export interface QuestionStatus {
  id: string;
  isAnswered: boolean;
  isFlagged: boolean;
  isActive: boolean;
}

// Kiểu dữ liệu cho phân trang
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  questionsPerPage: number;
  totalQuestions: number;
}

// Kiểu dữ liệu cho bài thi
export interface Quiz {
  id: number;
  title: string;
  subject: string;
  description: string;
  timeLimit: number; // Tính bằng phút
  questions: Question[];
}

// Types cho API exam user quizzes
export interface ExamUserQuizzesAnswer {
  id: string;
  content: string;
  questionId: string | null;
  correct: boolean;
}

export interface ExamUserQuizzesQuestion {
  id: string;
  content: string;
  type: "singleChoice" | "multipleChoice";
  difficultyLevel: "Easy" | "Medium" | "Hard";
  media_url: string | null;
  createdBy: string;
  categoryId: string;
  answers: ExamUserQuizzesAnswer[];
  createdAt: string;
  updatedAt: string;
}

export interface ExamUserQuizzesData {
  examUserQuizzesId: string;
  questions: ExamUserQuizzesQuestion[];
}

export interface ExamUserQuizzesResponse {
  status: number;
  message: string;
  data: ExamUserQuizzesData;
  timestamp: string;
}

// Types cho submission
export interface CreateSubmissionResponse {
  status: number;
  message: string;
  data: string; // submissionId được trả về trực tiếp dưới dạng string
  timestamp: string;
}

// Types cho user answer submission
export interface UserAnswerSubmission {
  questionId: string;
  selectedAnswerIds: string[];
  timeSpent?: number;
}

export interface SubmitAnswerRequest {
  submissionId: string;
  answers: UserAnswerSubmission[];
}

// Types cho API submit single answer
export interface SubmitSingleAnswerRequest {
  examQuizzSubmissionId: string;
  questionId: string;
  answerId: string[];
}

export interface SubmitSingleAnswerResponse {
  status: number;
  message: string;
  data?: any;
  timestamp: string;
}

// Types cho finish submission API
export interface FinishSubmissionResponse {
  status: number;
  message: string;
  data: {
    correct: number;
    score: number;
    wrong: number;
    total: number;
  };
  timestamp: string;
}

export const sampleQuiz: Quiz = {
  id: 1,
  title: "Kiểm tra giữa kỳ Đại số tuyến tính",
  subject: "Toán học",
  description: "Bài kiểm tra đánh giá kiến thức về Đại số tuyến tính",
  timeLimit: 45,
  questions: [
    {
      id: 1,
      type: QuestionType.SINGLE_CHOICE,
      content: "Nếu ma trận A là ma trận đơn vị, thì $\\det(A) = $ ?",
      answers: [
        { id: "1a", content: "0", isCorrect: false },
        { id: "1b", content: "1", isCorrect: true },
        { id: "1c", content: "-1", isCorrect: false },
        {
          id: "1d",
          content: "Phụ thuộc vào kích thước của A",
          isCorrect: false,
        },
      ],
    },
    {
      id: 2,
      type: QuestionType.MULTIPLE_CHOICE,
      content:
        "Chọn tất cả các tính chất đúng của **ma trận trực giao** (orthogonal matrix):", // Ví dụ Markdown
      answers: [
        { id: "2a", content: "$\\det(A) = \\pm1$", isCorrect: true },
        { id: "2b", content: "$A^T \\times A = I$", isCorrect: true },
        {
          id: "2c",
          content: "Các cột của ma trận tạo thành một cơ sở trực chuẩn",
          isCorrect: true,
        },
        {
          id: "2d",
          content: "Tổng các phần tử trên đường chéo chính luôn bằng 0",
          isCorrect: false,
        },
      ],
    },
    {
      id: 3,
      type: QuestionType.SINGLE_CHOICE,
      content:
        "Cho ma trận vuông A. Nếu $\\det(A) = 0$, thì điều gì sau đây là đúng?",
      answers: [
        { id: "3a", content: "A là ma trận khả nghịch", isCorrect: false },
        { id: "3b", content: "A là ma trận suy biến", isCorrect: true },
        { id: "3c", content: "A là ma trận đối xứng", isCorrect: false },
        { id: "3d", content: "A^2 = A", isCorrect: false },
      ],
    },
    {
      id: 4,
      type: QuestionType.SINGLE_CHOICE,
      content:
        "Nếu $\\lambda$ là trị riêng của ma trận A, thì $\\lambda^2$ là trị riêng của ma trận nào sau đây?",
      answers: [
        { id: "4a", content: "$A^2$", isCorrect: true },
        { id: "4b", content: "$2A$", isCorrect: false },
        { id: "4c", content: "$A + I$", isCorrect: false },
        { id: "4d", content: "$A^T$", isCorrect: false },
      ],
    },
    {
      id: 5,
      type: QuestionType.MULTIPLE_CHOICE,
      content:
        "Chọn tất cả các phát biểu đúng về **hệ phương trình tuyến tính** $Ax = b$:",
      answers: [
        {
          id: "5a",
          content: "Nếu $\\det(A) \\neq 0$, hệ có nghiệm duy nhất",
          isCorrect: true,
        },
        {
          id: "5b",
          content: "Nếu $\\text{rank}(A) < \\text{rank}([A|b])$, hệ vô nghiệm",
          isCorrect: true,
        },
        {
          id: "5c",
          content: "Nếu $\\det(A) = 0$, hệ vô nghiệm",
          isCorrect: false,
        },
        {
          id: "5d",
          content:
            "Nếu $\\text{rank}(A) = \\text{rank}([A|b]) < n$, hệ có vô số nghiệm",
          isCorrect: true,
        },
      ],
    },
  ],
};
