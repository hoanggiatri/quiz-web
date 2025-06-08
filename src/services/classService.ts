import axios from "axios";
import { tokenService } from "./tokenService";
import { toast } from "sonner";

const API_BASE_URL =
  import.meta.env.VITE_QUIZ_BASE_URL || "http://36.50.135.242:9006/mcs";

// Types for Class API
export interface Class {
  id: string;
  className: string;
  description?: string;
  teacherId: string;
  classCode: string;
  createdAt: string;
  updatedAt: string;
  actions?: string;
}

export interface CreateClassRequest {
  className: string;
  description?: string;
  teacherId: string;
}

export interface UpdateClassRequest {
  classId: string;
  className?: string;
  description?: string;
  teacherId?: string;
}

export interface ClassUser {
  userId: string;
  userName: string;
  email: string;
  role: "student" | "teacher";
  joinedAt: string;
  status: "active" | "inactive";
}

export interface ClassResponse {
  status: number;
  message: string;
  data: Class;
  timestamp: string;
}

export interface ClassListResponse {
  status: number;
  message: string;
  data: Class[];
  timestamp: string;
}

export interface ClassUsersResponse {
  status: number;
  message: string;
  data: ClassUser[];
  timestamp: string;
}

export interface ApiResponse {
  status: number;
  message: string;
  timestamp: string;
}

/**
 * Class Service
 * Handles all class-related API operations based on the provided endpoints
 */
class ClassService {
  private getApiBaseUrl() {
    return API_BASE_URL;
  }

  private getAuthHeaders() {
    const token = tokenService.getAccessToken();
    return {
      "Content-Type": "application/json",
      Accept: "*/*",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  /**
   * Update class information
   * PUT /classes/update/{id}
   */
  async updateClass(
    classId: string,
    data: Partial<UpdateClassRequest>
  ): Promise<ClassResponse> {
    try {
      const response = await axios.put(
        `${this.getApiBaseUrl()}/classes/update/${classId}`,
        data,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      toast.error("Đã có lỗi xảy ra khi cập nhật lớp học");
      throw error;
    }
  }

  /**
   * Create new class
   * POST /classes/create
   */
  async createClass(data: CreateClassRequest): Promise<ClassResponse> {
    try {
      const response = await axios.post(
        `${this.getApiBaseUrl()}/classes/create`,
        data,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      toast.error("Đã có lỗi xảy ra khi tạo lớp học");
      throw error;
    }
  }

  /**
   * Get classes by user ID
   * GET /classes/user/{userId}
   */
  async getClassesByUser(userId: string): Promise<ClassListResponse> {
    try {
      const baseUrl = this.getApiBaseUrl();
      const fullUrl = `${baseUrl}/classes/user/${userId}`;

      const response = await axios.get(fullUrl, {
        headers: this.getAuthHeaders(),
      });

      return response.data;
    } catch (error) {
      toast.error("Đã có lỗi xảy ra khi tải danh sách lớp học");
      throw error;
    }
  }

  /**
   * Get classes by teacher ID
   * GET /classes/teacher/{teacherId}
   */
  async getClassesByTeacher(teacherId: string): Promise<ClassListResponse> {
    try {
      const response = await axios.get(
        `${this.getApiBaseUrl()}/classes/teacher/${teacherId}`,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      toast.error("Đã có lỗi xảy ra khi tải danh sách lớp học");
      throw error;
    }
  }

  /**
   * Get all classes
   * GET /classes/get-all
   */
  async getAllClasses(): Promise<ClassListResponse> {
    try {
      const response = await axios.get(
        `${this.getApiBaseUrl()}/classes/get-all`,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      toast.error("Đã có lỗi xảy ra khi tải danh sách lớp học");
      throw error;
    }
  }

  /**
   * Get all users in a specific class
   * GET /classes/all-user-in-classes/{classId}
   */
  async getUsersInClass(classId: string): Promise<ClassUsersResponse> {
    try {
      const response = await axios.get(
        `${this.getApiBaseUrl()}/classes/all-user-in-classes/${classId}`,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      toast.error("Đã có lỗi xảy ra khi tải danh sách thành viên lớp");
      throw error;
    }
  }

  /**
   * Delete class
   * DELETE /classes/delete/{classId}
   */
  async deleteClass(classId: string): Promise<ApiResponse> {
    try {
      const response = await axios.delete(
        `${this.getApiBaseUrl()}/classes/delete/${classId}`,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      toast.error("Đã có lỗi xảy ra khi xóa lớp học");
      throw error;
    }
  }
}

// Export singleton instance
export const classService = new ClassService();

// Export class for testing
export { ClassService };
