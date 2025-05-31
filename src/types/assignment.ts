export type AssignmentStatus = 
  | 'assigned'      // Đã giao
  | 'in_progress'   // Đang làm
  | 'submitted'     // Đã nộp
  | 'graded'        // Đã chấm điểm
  | 'overdue'       // Đã hết hạn
  | 'draft';        // Bản nháp

export type AssignmentType = 
  | 'quiz'          // Trắc nghiệm
  | 'exam'          // Thi
  | 'homework'      // Bài tập về nhà
  | 'project'       // Dự án
  | 'essay';        // Tiểu luận

export interface Assignment {
  id: string;
  title: string;
  description: string;
  type: AssignmentType;
  status: AssignmentStatus;
  
  // Thời gian
  assignedDate: string;
  dueDate: string;
  duration?: number; // Thời lượng làm bài (phút)
  
  // Điểm số
  maxScore: number;
  userScore?: number;
  
  // Thông tin bài tập
  questionCount: number;
  attempts: number;
  maxAttempts: number;
  
  // Metadata
  subject: string;
  instructor: string;
  difficulty: 'easy' | 'medium' | 'hard';
  
  // Files đính kèm
  attachments?: AssignmentAttachment[];
  
  // Kết quả
  result?: AssignmentResult;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface AssignmentResult {
  id: string;
  assignmentId: string;
  userId: string;
  score: number;
  maxScore: number;
  percentage: number;
  timeSpent: number; // Thời gian làm bài (phút)
  submittedAt: string;
  gradedAt?: string;
  feedback?: string;
  
  // Chi tiết kết quả
  correctAnswers: number;
  totalQuestions: number;
  questionResults?: QuestionResult[];
}

export interface QuestionResult {
  questionId: string;
  isCorrect: boolean;
  userAnswer: string[];
  correctAnswer: string[];
  timeSpent: number;
  points: number;
  maxPoints: number;
}

// Filter và Search types
export interface AssignmentFilters {
  status?: AssignmentStatus[];
  type?: AssignmentType[];
  subject?: string[];
  difficulty?: ('easy' | 'medium' | 'hard')[];
  dueDateRange?: {
    from?: string;
    to?: string;
  };
}

export interface AssignmentSearchParams {
  query?: string;
  filters?: AssignmentFilters;
  sortBy?: 'title' | 'dueDate' | 'assignedDate' | 'score';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface AssignmentListResponse {
  assignments: Assignment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// UI State types
export interface AssignmentListState {
  assignments: Assignment[];
  loading: boolean;
  error: string | null;
  searchParams: AssignmentSearchParams;
  selectedAssignments: string[];
}

export interface AssignmentDetailState {
  assignment: Assignment | null;
  loading: boolean;
  error: string | null;
  actionLoading: boolean;
}

// Action types
export type AssignmentAction = 
  | 'start'         // Bắt đầu làm bài
  | 'continue'      // Tiếp tục làm bài
  | 'submit'        // Nộp bài
  | 'view_result'   // Xem kết quả
  | 'download'      // Tải xuống
  | 'retry';        // Làm lại

export interface AssignmentActionButton {
  action: AssignmentAction;
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
}

// Utility functions
export const getAssignmentStatusColor = (status: AssignmentStatus): string => {
  switch (status) {
    case 'assigned':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'in_progress':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'submitted':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    case 'graded':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'overdue':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'draft':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

export const getAssignmentStatusLabel = (status: AssignmentStatus): string => {
  switch (status) {
    case 'assigned':
      return 'Đã giao';
    case 'in_progress':
      return 'Đang làm';
    case 'submitted':
      return 'Đã nộp';
    case 'graded':
      return 'Đã chấm';
    case 'overdue':
      return 'Quá hạn';
    case 'draft':
      return 'Bản nháp';
    default:
      return 'Không xác định';
  }
};

export const getAssignmentTypeLabel = (type: AssignmentType): string => {
  switch (type) {
    case 'quiz':
      return 'Trắc nghiệm';
    case 'exam':
      return 'Thi';
    case 'homework':
      return 'Bài tập';
    case 'project':
      return 'Dự án';
    case 'essay':
      return 'Tiểu luận';
    default:
      return 'Khác';
  }
};

export const getDifficultyLabel = (difficulty: 'easy' | 'medium' | 'hard'): string => {
  switch (difficulty) {
    case 'easy':
      return 'Dễ';
    case 'medium':
      return 'Trung bình';
    case 'hard':
      return 'Khó';
    default:
      return 'Không xác định';
  }
};

export const getDifficultyColor = (difficulty: 'easy' | 'medium' | 'hard'): string => {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'hard':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};
