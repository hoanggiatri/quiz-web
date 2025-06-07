import type {
  Assignment,
  AssignmentListResponse,
  AssignmentSearchParams,
  AssignmentResult,
  AssignmentApiResponse,
} from "@/types/assignment";
import {
  transformApiResponseToAssignment,
  transformDetailApiResponseToAssignment,
} from "@/types/assignment";

const API_BASE_URL =
  import.meta.env.VITE_QUIZ_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8080";

// Mock data for development
const mockAssignments: Assignment[] = [
  {
    id: "1",
    title: "Kiểm tra Toán học - Chương 1",
    description:
      "Kiểm tra kiến thức về đại số và hình học cơ bản. Bao gồm các bài tập về phương trình bậc nhất, bậc hai và tính chất hình học.",
    type: "quiz",
    status: "assigned",
    assignedDate: "2024-01-15T08:00:00Z",
    dueDate: "2024-01-25T23:59:59Z",
    duration: 60,
    maxScore: 100,
    questionCount: 20,
    attempts: 0,
    maxAttempts: 2,
    subject: "Toán học",
    instructor: "Nguyễn Văn A",
    difficulty: "medium",
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-01-15T08:00:00Z",
  },
  {
    id: "2",
    title: "Bài tập Lập trình Web",
    description:
      "Xây dựng một ứng dụng web đơn giản sử dụng React và TypeScript. Yêu cầu implement các tính năng CRUD cơ bản.",
    type: "project",
    status: "in_progress",
    assignedDate: "2024-01-10T08:00:00Z",
    dueDate: "2024-02-10T23:59:59Z",
    maxScore: 100,
    userScore: 75,
    questionCount: 5,
    attempts: 1,
    maxAttempts: 1,
    subject: "Lập trình",
    instructor: "Trần Thị B",
    difficulty: "hard",
    attachments: [
      {
        id: "att1",
        name: "Yêu cầu dự án.pdf",
        url: "/files/requirements.pdf",
        type: "application/pdf",
        size: 1024000,
      },
    ],
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2024-01-20T10:30:00Z",
  },
  {
    id: "3",
    title: "Thi cuối kỳ Vật lý",
    description:
      "Bài thi cuối kỳ môn Vật lý đại cương. Bao gồm các chương về cơ học, nhiệt học và điện học.",
    type: "exam",
    status: "graded",
    assignedDate: "2024-01-05T08:00:00Z",
    dueDate: "2024-01-15T10:00:00Z",
    duration: 120,
    maxScore: 100,
    userScore: 85,
    questionCount: 40,
    attempts: 1,
    maxAttempts: 1,
    subject: "Vật lý",
    instructor: "Lê Văn C",
    difficulty: "hard",
    result: {
      id: "result1",
      assignmentId: "3",
      userId: "user1",
      score: 85,
      maxScore: 100,
      percentage: 85,
      timeSpent: 110,
      submittedAt: "2024-01-15T09:50:00Z",
      gradedAt: "2024-01-16T14:00:00Z",
      correctAnswers: 34,
      totalQuestions: 40,
      feedback: "Bài làm tốt! Cần cải thiện phần điện học.",
    },
    createdAt: "2024-01-05T08:00:00Z",
    updatedAt: "2024-01-16T14:00:00Z",
  },
  {
    id: "4",
    title: "Bài tập Tiếng Anh - Unit 5",
    description:
      "Bài tập về ngữ pháp và từ vựng Unit 5. Tập trung vào thì hiện tại hoàn thành và từ vựng về du lịch.",
    type: "homework",
    status: "overdue",
    assignedDate: "2024-01-01T08:00:00Z",
    dueDate: "2024-01-10T23:59:59Z",
    maxScore: 50,
    questionCount: 15,
    attempts: 0,
    maxAttempts: 3,
    subject: "Tiếng Anh",
    instructor: "Mary Johnson",
    difficulty: "easy",
    createdAt: "2024-01-01T08:00:00Z",
    updatedAt: "2024-01-01T08:00:00Z",
  },
  {
    id: "5",
    title: "Tiểu luận Lịch sử Việt Nam",
    description:
      "Viết một bài tiểu luận 2000 từ về vai trò của Hồ Chí Minh trong cuộc kháng chiến chống Pháp.",
    type: "essay",
    status: "submitted",
    assignedDate: "2024-01-08T08:00:00Z",
    dueDate: "2024-01-30T23:59:59Z",
    maxScore: 100,
    questionCount: 1,
    attempts: 1,
    maxAttempts: 1,
    subject: "Lịch sử",
    instructor: "Phạm Văn D",
    difficulty: "medium",
    createdAt: "2024-01-08T08:00:00Z",
    updatedAt: "2024-01-25T16:45:00Z",
  },
];

export const assignmentManagementService = {
  // Lấy danh sách assignments từ API theo classId
  getAssignmentsByClassId: async (classId: string): Promise<Assignment[]> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/assignment/get-by-class/${classId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status !== 200) {
        throw new Error(data.message || "Có lỗi xảy ra khi tải dữ liệu");
      }

      // Transform API response to Assignment objects
      const assignments: Assignment[] = data.data.map(
        (apiAssignment: AssignmentApiResponse) =>
          transformApiResponseToAssignment(apiAssignment)
      );

      return assignments;
    } catch (error) {
      console.error("Error fetching assignments by class ID:", error);
      throw error;
    }
  },

  // Lấy danh sách assignments (mock data - giữ lại cho compatibility)
  getAssignments: async (
    params: AssignmentSearchParams = {}
  ): Promise<AssignmentListResponse> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    let filteredAssignments = [...mockAssignments];

    // Apply search
    if (params.query) {
      const query = params.query.toLowerCase();
      filteredAssignments = filteredAssignments.filter(
        (assignment) =>
          assignment.title.toLowerCase().includes(query) ||
          assignment.description.toLowerCase().includes(query) ||
          assignment.subject.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (params.filters) {
      const { status, type, subject, difficulty, dueDateRange } =
        params.filters;

      if (status && status.length > 0) {
        filteredAssignments = filteredAssignments.filter((a) =>
          status.includes(a.status)
        );
      }

      if (type && type.length > 0) {
        filteredAssignments = filteredAssignments.filter((a) =>
          type.includes(a.type)
        );
      }

      if (subject && subject.length > 0) {
        filteredAssignments = filteredAssignments.filter((a) =>
          subject.includes(a.subject)
        );
      }

      if (difficulty && difficulty.length > 0) {
        filteredAssignments = filteredAssignments.filter((a) =>
          difficulty.includes(a.difficulty)
        );
      }

      if (dueDateRange) {
        if (dueDateRange.from) {
          filteredAssignments = filteredAssignments.filter(
            (a) => new Date(a.dueDate) >= new Date(dueDateRange.from!)
          );
        }
        if (dueDateRange.to) {
          filteredAssignments = filteredAssignments.filter(
            (a) => new Date(a.dueDate) <= new Date(dueDateRange.to!)
          );
        }
      }
    }

    // Apply sorting
    if (params.sortBy) {
      filteredAssignments.sort((a, b) => {
        let aValue: string | Date | number, bValue: string | Date | number;

        switch (params.sortBy) {
          case "title":
            aValue = a.title;
            bValue = b.title;
            break;
          case "dueDate":
            aValue = new Date(a.dueDate);
            bValue = new Date(b.dueDate);
            break;
          case "assignedDate":
            aValue = new Date(a.assignedDate);
            bValue = new Date(b.assignedDate);
            break;
          case "score":
            aValue = a.userScore || 0;
            bValue = b.userScore || 0;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return params.sortOrder === "desc" ? 1 : -1;
        if (aValue > bValue) return params.sortOrder === "desc" ? -1 : 1;
        return 0;
      });
    }

    // Apply pagination
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedAssignments = filteredAssignments.slice(
      startIndex,
      endIndex
    );

    return {
      assignments: paginatedAssignments,
      total: filteredAssignments.length,
      page,
      limit,
      totalPages: Math.ceil(filteredAssignments.length / limit),
    };
  },

  // Lấy chi tiết assignment từ API
  getAssignmentById: async (id: string): Promise<Assignment> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/assignment/get-by-id/${id}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status !== 200) {
        throw new Error(data.message || "Có lỗi xảy ra khi tải dữ liệu");
      }

      // Transform API response to Assignment object
      const assignment = transformDetailApiResponseToAssignment(data.data);

      return assignment;
    } catch (error) {
      console.error("Error fetching assignment by ID:", error);
      throw error;
    }
  },

  // Lấy chi tiết assignment (mock data - giữ lại cho compatibility)
  getAssignment: async (id: string): Promise<Assignment> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const assignment = mockAssignments.find((a) => a.id === id);
    if (!assignment) {
      throw new Error("Assignment not found");
    }

    return assignment;
  },

  // Bắt đầu làm assignment
  startAssignment: async (
    id: string
  ): Promise<{ success: boolean; redirectUrl: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Update assignment status to in_progress
    const assignmentIndex = mockAssignments.findIndex((a) => a.id === id);
    if (assignmentIndex !== -1) {
      mockAssignments[assignmentIndex].status = "in_progress";
      mockAssignments[assignmentIndex].attempts += 1;
    }

    return {
      success: true,
      redirectUrl: `/quiz/quiz-taking/${id}`,
    };
  },

  // Nộp assignment
  submitAssignment: async (id: string): Promise<AssignmentResult> => {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock result calculation
    const assignment = mockAssignments.find((a) => a.id === id);
    if (!assignment) {
      throw new Error("Assignment not found");
    }

    const result: AssignmentResult = {
      id: `result_${id}`,
      assignmentId: id,
      userId: "current_user",
      score: Math.floor(Math.random() * assignment.maxScore),
      maxScore: assignment.maxScore,
      percentage: 0,
      timeSpent: Math.floor(Math.random() * (assignment.duration || 60)),
      submittedAt: new Date().toISOString(),
      correctAnswers: Math.floor(Math.random() * assignment.questionCount),
      totalQuestions: assignment.questionCount,
    };

    result.percentage = Math.round((result.score / result.maxScore) * 100);

    // Update assignment
    const assignmentIndex = mockAssignments.findIndex((a) => a.id === id);
    if (assignmentIndex !== -1) {
      mockAssignments[assignmentIndex].status = "submitted";
      mockAssignments[assignmentIndex].userScore = result.score;
      mockAssignments[assignmentIndex].result = result;
    }

    return result;
  },

  // Tải file đính kèm
  downloadAttachment: async (attachmentId: string): Promise<string> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return `/api/assignments/attachments/${attachmentId}/download`;
  },
};
