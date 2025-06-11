import axios from "axios";
import { tokenService } from "./tokenService";

const API_BASE_URL =
  import.meta.env.VITE_QUIZ_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8080";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = tokenService.getAccessToken();
  return {
    Accept: "*/*",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export interface Assignment {
  assignmentId: string;
  title: string;
  file: string | null;
  createdByName: string;
  description: string | null;
  deadline: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentListResponse {
  status: number;
  message: string;
  data: Assignment[];
  timestamp: string;
}

export interface AssignmentDetail {
  id: string;
  title: string;
  file: string | null;
  createdByName: string;
  deadline: string;
  createdAt: string;
  updatedAt: string;
  classes: {
    id: string;
    className: string;
    teacherId: string;
    classCode: string;
    createdAt: string;
    updatedAt: string;
    actions: string;
  };
}

export interface AssignmentDetailResponse {
  status: number;
  message: string;
  data: AssignmentDetail;
  timestamp: string;
}

export const assignmentService = {
  getAssignmentsByClass: async (
    classId: string
  ): Promise<AssignmentListResponse> => {
    const response = await axios.get(
      `${API_BASE_URL}/assignment/get-by-class/${classId}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  },
  getAssignmentById: async (id: string): Promise<AssignmentDetailResponse> => {
    const response = await axios.get(
      `${API_BASE_URL}/assignment/get-by-id/${id}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  submitAssignment: async (
    assignmentId: string,
    file: File
  ): Promise<{ status: number; message: string; data?: unknown }> => {
    const formData = new FormData();
    formData.append("file", file);

    const token = tokenService.getAccessToken();
    const response = await axios.post(
      `${API_BASE_URL}/assignment/add-file`,
      formData,
      {
        params: { assignmentId },
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "*/*",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );
    return response.data;
  },
};
