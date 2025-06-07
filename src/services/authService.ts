import type {
  LoginCredentials,
  QLDTCredentials,
  AuthResponse,
  QLDTAuthResponse,
  GoogleAuthResponse,
} from "@/types/auth";
import { tokenService } from "./tokenService";

// Register types
export interface RegisterData {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDay: string; // Format: YYYY-MM-DD
  serviceTypes: string[]; // Will be hardcoded to ["QUIZ", "CLASSROOM"]
}

export interface RegisterResponse {
  status: number;
  message: string;
}

/**
 * Authentication Service
 * Xử lý tất cả các phương thức đăng nhập
 */

class AuthService {
  private readonly API_BASE_URL =
    import.meta.env.VITE_QUIZ_BASE_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:8080";
  private readonly QLDT_API_URL =
    import.meta.env.VITE_QLDT_API_URL || "http://localhost:8081";
  private readonly AUTH_BASE_URL =
    import.meta.env.VITE_AUTH_URL || "https://api.learnsql.store/api/auth/";

  /**
   * Đăng ký tài khoản mới
   */
  async register(
    data: Omit<RegisterData, "serviceTypes">
  ): Promise<RegisterResponse> {
    // Check if we should use mock or real API
    const useMock =
      import.meta.env.VITE_USE_MOCK_AUTH === "true" || import.meta.env.DEV; // Use mock in development by default

    if (useMock) {
      console.log("🔧 Using mock registration API (CORS workaround)");
      return this.mockRegister(data);
    }

    try {
      const registerPayload: RegisterData = {
        ...data,
        serviceTypes: ["QUIZ", "CLASSROOM"], // Hardcoded as requested
      };

      const response = await fetch(`${this.AUTH_BASE_URL}register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Đăng ký thất bại");
      }

      const result: RegisterResponse = await response.json();
      return result;
    } catch (error) {
      console.error("❌ Registration failed:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Có lỗi xảy ra khi đăng ký");
    }
  }

  /**
   * Đăng nhập bằng email/password
   */
  async loginWithEmail(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          rememberMe: credentials.rememberMe,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Đăng nhập thất bại");
      }

      const data: AuthResponse = await response.json();

      // Lưu tokens
      if (data.success && data.tokens) {
        tokenService.setTokens(data.tokens);
      }

      return data;
    } catch (error) {
      console.error("❌ Email login failed:", error);
      throw error;
    }
  }

  /**
   * Đăng nhập bằng Google
   */
  async loginWithGoogle(credential: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Đăng nhập Google thất bại");
      }

      const data: AuthResponse = await response.json();

      // Lưu tokens
      if (data.success && data.tokens) {
        tokenService.setTokens(data.tokens);
      }

      return data;
    } catch (error) {
      console.error("❌ Google login failed:", error);
      throw error;
    }
  }

  /**
   * Đăng nhập bằng QLDT PTIT
   */
  async loginWithQLDT(credentials: QLDTCredentials): Promise<QLDTAuthResponse> {
    try {
      const response = await fetch(`${this.QLDT_API_URL}/auth/qldt-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Đăng nhập QLDT thất bại");
      }

      const data: QLDTAuthResponse = await response.json();

      // Lưu tokens
      if (data.success && data.tokens) {
        tokenService.setTokens(data.tokens);
      }

      return data;
    } catch (error) {
      console.error("❌ QLDT login failed:", error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<AuthResponse> {
    try {
      const refreshToken = tokenService.getRefreshToken();

      if (!refreshToken) {
        throw new Error("Không có refresh token");
      }

      const response = await fetch(`${this.API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Refresh token thất bại");
      }

      const data: AuthResponse = await response.json();

      // Cập nhật access token mới
      if (data.success && data.tokens) {
        tokenService.updateAccessToken(
          data.tokens.accessToken,
          data.tokens.expiresIn
        );
      }

      return data;
    } catch (error) {
      console.error("❌ Token refresh failed:", error);
      // Nếu refresh thất bại, xóa tất cả tokens
      tokenService.removeTokens();
      throw error;
    }
  }

  /**
   * Đăng xuất
   */
  async logout(): Promise<void> {
    try {
      const accessToken = tokenService.getAccessToken();

      if (accessToken) {
        // Gọi API logout để invalidate token trên server
        await fetch(`${this.API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (error) {
      console.error("❌ Logout API failed:", error);
      // Vẫn tiếp tục xóa tokens local dù API fail
    } finally {
      // Luôn xóa tokens local
      tokenService.clearAll();
    }
  }

  /**
   * Lấy thông tin user hiện tại
   */
  async getCurrentUser(): Promise<any> {
    try {
      const accessToken = tokenService.getAccessToken();

      if (!accessToken) {
        throw new Error("Không có access token");
      }

      const response = await fetch(`${this.API_BASE_URL}/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Lấy thông tin user thất bại");
      }

      return await response.json();
    } catch (error) {
      console.error("❌ Get current user failed:", error);
      throw error;
    }
  }

  /**
   * Kiểm tra trạng thái đăng nhập
   */
  isAuthenticated(): boolean {
    const tokens = tokenService.getTokens();
    return tokens !== null && !tokenService.isTokenExpired();
  }

  /**
   * Tự động refresh token nếu sắp hết hạn
   */
  async autoRefreshToken(): Promise<void> {
    if (tokenService.isTokenExpiringSoon() && !tokenService.isTokenExpired()) {
      try {
        await this.refreshToken();
        console.log("✅ Token auto-refreshed");
      } catch (error) {
        console.error("❌ Auto refresh failed:", error);
      }
    }
  }

  /**
   * Mock login cho development (tạm thời)
   */
  async mockLogin(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock successful response
    const mockResponse: AuthResponse = {
      success: true,
      user: {
        id: "user-123",
        email: credentials.email,
        name: "Nguyễn Văn A",
        avatar: "https://github.com/shadcn.png",
        role: "student",
        studentId: "SV2024001",
        class: "CNTT-K19",
        semester: "Học kỳ 2 - 2024-2025",
      },
      tokens: {
        accessToken: "mock-access-token-" + Date.now(),
        refreshToken: "mock-refresh-token-" + Date.now(),
        expiresIn: 3600, // 1 hour
        tokenType: "Bearer",
      },
    };

    // Save tokens
    tokenService.setTokens(mockResponse.tokens);

    return mockResponse;
  }

  /**
   * Mock Google login
   */
  async mockGoogleLogin(credential: string): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockResponse: AuthResponse = {
      success: true,
      user: {
        id: "google-user-123",
        email: "user@gmail.com",
        name: "Google User",
        avatar: "https://lh3.googleusercontent.com/a/default-user",
        role: "student",
      },
      tokens: {
        accessToken: "mock-google-access-token-" + Date.now(),
        refreshToken: "mock-google-refresh-token-" + Date.now(),
        expiresIn: 3600,
        tokenType: "Bearer",
      },
    };

    tokenService.setTokens(mockResponse.tokens);
    return mockResponse;
  }

  /**
   * Mock QLDT login
   */
  async mockQLDTLogin(credentials: QLDTCredentials): Promise<QLDTAuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const mockResponse: QLDTAuthResponse = {
      success: true,
      user: {
        id: "qldt-user-123",
        username: credentials.username,
        name: "Sinh viên PTIT",
        studentId: "B21DCCN123",
        class: "D21CQCN01-B",
        email: credentials.username + "@stu.ptit.edu.vn",
      },
      tokens: {
        accessToken: "mock-qldt-access-token-" + Date.now(),
        refreshToken: "mock-qldt-refresh-token-" + Date.now(),
        expiresIn: 3600,
        tokenType: "Bearer",
      },
    };

    tokenService.setTokens(mockResponse.tokens);
    return mockResponse;
  }

  /**
   * Mock register for development
   */
  async mockRegister(
    data: Omit<RegisterData, "serviceTypes">
  ): Promise<RegisterResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulate some validation errors for testing
    if (data.email === "test@error.com") {
      throw new Error("Email đã được sử dụng");
    }

    if (data.username === "admin") {
      throw new Error("Tên đăng nhập không được phép");
    }

    // Mock successful response
    const mockResponse: RegisterResponse = {
      status: 1,
      message: "Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.",
    };

    console.log("✅ Mock registration successful:", {
      username: data.username,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      birthDay: data.birthDay,
      serviceTypes: ["QUIZ", "CLASSROOM"],
    });

    return mockResponse;
  }

  /**
   * Validation methods for registration
   */

  // Validate email format
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate phone format (Vietnamese phone numbers)
  validatePhone(phone: string): boolean {
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    return phoneRegex.test(phone);
  }

  // Validate password strength
  validatePassword(password: string): { isValid: boolean; message?: string } {
    if (password.length < 6) {
      return { isValid: false, message: "Mật khẩu phải có ít nhất 6 ký tự" };
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return {
        isValid: false,
        message: "Mật khẩu phải có ít nhất 1 chữ thường",
      };
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return { isValid: false, message: "Mật khẩu phải có ít nhất 1 chữ hoa" };
    }
    if (!/(?=.*\d)/.test(password)) {
      return { isValid: false, message: "Mật khẩu phải có ít nhất 1 số" };
    }
    return { isValid: true };
  }

  // Format date for API (YYYY-MM-DD)
  formatDateForAPI(date: Date): string {
    return date.toISOString().split("T")[0];
  }

  // Parse date from input (YYYY-MM-DD)
  parseDateFromInput(dateString: string): Date | null {
    if (!dateString) return null;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  }

  // Validate age (must be at least 13 years old)
  validateAge(birthDate: string): { isValid: boolean; message?: string } {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    if (age < 13) {
      return { isValid: false, message: "Bạn phải ít nhất 13 tuổi để đăng ký" };
    }

    if (age > 100) {
      return { isValid: false, message: "Vui lòng kiểm tra lại ngày sinh" };
    }

    return { isValid: true };
  }
}

// Export singleton instance
export const authService = new AuthService();

// Export class for testing
export { AuthService };
