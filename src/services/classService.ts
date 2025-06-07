import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_QUIZ_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8080";

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
  private getAuthHeaders() {
    const token = localStorage.getItem("authToken");
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
        `${API_BASE_URL}/classes/update/${classId}`,
        data,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating class:", error);
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
        `${API_BASE_URL}/classes/create`,
        data,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating class:", error);
      throw error;
    }
  }

  /**
   * Get classes by user ID
   * GET /classes/user/{userId}
   */
  async getClassesByUser(userId: string): Promise<ClassListResponse> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/classes/user/${userId}`,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching classes by user:", error);
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
        `${API_BASE_URL}/classes/teacher/${teacherId}`,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching classes by teacher:", error);
      throw error;
    }
  }

  /**
   * Get all classes
   * GET /classes/get-all
   */
  async getAllClasses(): Promise<ClassListResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/classes/get-all`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching all classes:", error);
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
        `${API_BASE_URL}/classes/all-user-in-classes/${classId}`,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching users in class:", error);
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
        `${API_BASE_URL}/classes/delete/${classId}`,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting class:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const classService = new ClassService();

// Export class for testing
export { ClassService };
