import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_QUIZ_BASE_URL;

export interface AutoSaveRequest {
  examQuizId: string;
  userId: string;
  changes: {
    questionId: string;
    selectedAnswers: string[];
    isFlagged: boolean;
    timestamp: number;
  }[];
  sessionData: {
    currentPage: number;
    totalAnswered: number;
    flaggedCount: number;
  };
}

export interface AutoSaveResponse {
  success: boolean;
  timestamp: number;
  saved: number;
  message?: string;
}

export interface AutoSaveRecoveryResponse {
  answers: Record<
    string,
    {
      selectedAnswers: string[];
      isFlagged: boolean;
      lastUpdated: string;
    }
  >;
  session: {
    currentPage: number;
    totalAnswered: number;
    lastActivity: string;
  } | null;
}

export const autoSaveService = {
  // Save auto-save data to server
  saveAutoSave: async (data: AutoSaveRequest): Promise<AutoSaveResponse> => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/quiz/${data.examQuizId}/autosave`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          timeout: 10000, // 10 second timeout
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error saving auto-save data:", error);
      throw error;
    }
  },

  // Recover auto-save data from server
  recoverAutoSave: async (
    examQuizId: string,
    userId: string
  ): Promise<AutoSaveRecoveryResponse> => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/quiz/${examQuizId}/autosave/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          timeout: 5000, // 5 second timeout
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error recovering auto-save data:", error);
      throw error;
    }
  },

  // Clear auto-save data (after successful submission)
  clearAutoSave: async (examQuizId: string, userId: string): Promise<void> => {
    try {
      await axios.delete(
        `${API_BASE_URL}/api/quiz/${examQuizId}/autosave/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
    } catch (error) {
      console.error("Error clearing auto-save data:", error);
      // Don't throw error for cleanup operations
    }
  },
};

// Mock service for development/testing
export const mockAutoSaveService = {
  saveAutoSave: async (data: AutoSaveRequest): Promise<AutoSaveResponse> => {
    // Simulate network delay
    await new Promise((resolve) =>
      setTimeout(resolve, 500 + Math.random() * 1000)
    );

    // Simulate occasional failures (10% chance)
    if (Math.random() < 0.1) {
      throw new Error("Network error: Failed to save");
    }

    // Store in localStorage for mock persistence
    const key = `mock_autosave_${data.examQuizId}_${data.userId}`;
    const mockData = {
      answers: data.changes.reduce((acc, change) => {
        acc[change.questionId] = {
          selectedAnswers: change.selectedAnswers,
          isFlagged: change.isFlagged,
          lastUpdated: new Date(change.timestamp).toISOString(),
        };
        return acc;
      }, {} as Record<string, any>),
      session: {
        ...data.sessionData,
        lastActivity: new Date().toISOString(),
      },
      timestamp: Date.now(),
    };

    localStorage.setItem(key, JSON.stringify(mockData));

    return {
      success: true,
      timestamp: Date.now(),
      saved: data.changes.length,
      message: "Auto-save successful",
    };
  },

  recoverAutoSave: async (
    examQuizId: string,
    userId: string
  ): Promise<AutoSaveRecoveryResponse> => {
    // Simulate network delay
    await new Promise((resolve) =>
      setTimeout(resolve, 200 + Math.random() * 300)
    );

    const key = `mock_autosave_${examQuizId}_${userId}`;
    const saved = localStorage.getItem(key);

    if (saved) {
      const data = JSON.parse(saved);
      return {
        answers: data.answers || {},
        session: data.session || null,
      };
    }

    return {
      answers: {},
      session: null,
    };
  },

  clearAutoSave: async (examQuizId: string, userId: string): Promise<void> => {
    const key = `mock_autosave_${examQuizId}_${userId}`;
    localStorage.removeItem(key);
  },
};

// Export the service to use (switch between real and mock)
export const currentAutoSaveService =
  process.env.NODE_ENV === "development"
    ? mockAutoSaveService
    : autoSaveService;
