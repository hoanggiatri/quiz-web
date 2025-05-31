import axios from "axios";

const API_BASE_URL = "http://localhost:8080";

export interface Assignment {
  assignmentId: string;
  title: string;
  file: string | null;
  createdByName: string;
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
        headers: { Accept: "*/*" },
      }
    );
    return response.data;
  },
  getAssignmentById: async (id: string): Promise<AssignmentDetailResponse> => {
    const response = await axios.get(
      `http://localhost:8080/assignment/get-by-id/${id}`,
      { headers: { Accept: "*/*" } }
    );
    return response.data;
  },
  submitAssignment: async (
    assignmentId: string,
    userId: string,
    file: File
  ): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(
      `${API_BASE_URL}/assignment/submission/submit`,
      formData,
      {
        params: { assignmentId, userId },
        headers: { "Content-Type": "multipart/form-data", Accept: "*/*" },
      }
    );
    return response.data;
  },
};
