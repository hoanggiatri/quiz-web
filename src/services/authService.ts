import type {
  LoginRequest,
  LoginResponse,
  QLDTCredentials,
  AuthResponse,
  QLDTAuthResponse,
} from "@/types/auth";
import { tokenService } from "./tokenService";
import { toast } from "sonner";

// Types for registration
export interface RegisterRequest {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDay: string; // Format: "yyyy-MM-dd"
  serviceTypes: string[]; // Danh sách dịch vụ đăng ký
}

export interface RegisterResponse {
  status: number;
  message: string;
}

// Types for new login API moved to types/auth.ts

/**
 * Authentication Service
 * Xử lý tất cả các phương thức đăng nhập
 */

class AuthService {
  private readonly API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
  private readonly AUTH_API_URL =
    import.meta.env.VITE_AUTH_URL || "https://api.learnsql.store/api/auth/auth";

  /**
   * Decode Google ID Token để lấy thông tin user
   */
  private decodeGoogleIdToken(idToken: string): {
    email?: string;
    name?: string;
    picture?: string;
    sub?: string;
  } {
    try {
      // Google ID Token có format: header.payload.signature
      const parts = idToken.split(".");
      if (parts.length !== 3) {
        throw new Error("Invalid Google ID Token format");
      }

      // Decode payload (base64url)
      const payload = parts[1];
      // Thêm padding nếu cần
      const paddedPayload =
        payload + "=".repeat((4 - (payload.length % 4)) % 4);
      const decodedPayload = atob(
        paddedPayload.replace(/-/g, "+").replace(/_/g, "/")
      );

      return JSON.parse(decodedPayload);
    } catch {
      toast.error("Đã có lỗi xảy ra khi đăng nhập Google");
      return {};
    }
  }

  /**
   * Đăng ký tài khoản mới
   */
  async register(registerData: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await fetch(`${this.AUTH_API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(registerData),
      });

      if (!response.ok) {
        let errorMessage = "Đăng ký thất bại";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          toast.error(errorMessage);
        } catch {
          toast.error("Đã có lỗi xảy ra khi đăng ký");
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data: RegisterResponse = await response.json();

      return data;
    } catch (error) {
      toast.error("Đã có lỗi xảy ra khi đăng ký");

      // Handle network errors
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng."
        );
      }

      throw error;
    }
  }

  /**
   * Đăng nhập bằng username/password (API mới)
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.AUTH_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        let errorMessage = "Đăng nhập thất bại";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          toast.error(errorMessage);
        } catch {
          toast.error("Đã có lỗi xảy ra khi đăng nhập");
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data: LoginResponse = await response.json();

      // Lưu tokens nếu đăng nhập thành công
      if (data.status === 1 && data.accessToken && data.refreshToken) {
        tokenService.setTokens({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresIn: 3600, // Default 1 hour, có thể adjust
          tokenType: "Bearer",
        });
      }

      return data;
    } catch (error) {
      toast.error("Đã có lỗi xảy ra khi đăng nhập");

      // Handle network errors
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng."
        );
      }

      throw error;
    }
  }

  /**
   * Đăng nhập bằng Google
   */
  async loginWithGoogle(idToken: string): Promise<AuthResponse> {
    try {
      // Decode ID token để lấy thông tin user
      const googleUser = this.decodeGoogleIdToken(idToken);

      const response = await fetch(`${this.AUTH_API_URL}/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idToken,
          serviceTypes: ["QUIZ", "CLASSROOM"], // Hardcoded theo yêu cầu
        }),
      });

      if (!response.ok) {
        let errorMessage = "Đăng nhập Google thất bại";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          toast.error(errorMessage);
        } catch {
          toast.error("Đã có lỗi xảy ra khi đăng nhập Google");
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Kiểm tra response format theo API spec
      if (data.status === 1 && data.accessToken && data.refreshToken) {
        // Tạo response format chuẩn với thông tin từ Google
        const authResponse: AuthResponse = {
          success: true,
          user: {
            id: googleUser.sub || `google-${Date.now()}`,
            email: googleUser.email || "user@gmail.com",
            username: googleUser.name || googleUser.email || "google-user",
            name: googleUser.name || "Google User",
            avatar: googleUser.picture,
            role: "student",
          },
          tokens: {
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            expiresIn: 3600, // Default 1 hour, có thể điều chỉnh
            tokenType: "Bearer",
          },
        };

        // Lưu tokens
        tokenService.setTokens(authResponse.tokens);

        return authResponse;
      } else {
        throw new Error("Đăng nhập Google thất bại - Response không hợp lệ");
      }
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng."
        );
      }

      throw error;
    }
  }

  /**
   * Đăng nhập bằng QLDT PTIT
   */
  async loginWithQLDT(credentials: QLDTCredentials): Promise<QLDTAuthResponse> {
    try {
      const response = await fetch(`${this.AUTH_API_URL}/ptit-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Đăng nhập QLDT PTIT thất bại";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          toast.error(errorMessage);
        } catch {
          toast.error("Đã có lỗi xảy ra khi đăng nhập QLDT PTIT");
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Kiểm tra response format theo API spec
      if (data.status === 1 && data.accessToken && data.refreshToken) {
        // Tạo response format chuẩn
        const authResponse: QLDTAuthResponse = {
          success: true,
          user: {
            id: `ptit-${credentials.username}`,
            username: credentials.username,
            name: "Sinh viên PTIT", // Có thể lấy từ API khác nếu cần
            studentId: credentials.username,
            class: "Unknown", // Có thể lấy từ API khác nếu cần
            email: `${credentials.username}@stu.ptit.edu.vn`,
          },
          tokens: {
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            expiresIn: 3600, // Default 1 hour, có thể điều chỉnh
            tokenType: "Bearer",
          },
        };

        // Lưu tokens
        tokenService.setTokens(authResponse.tokens);

        return authResponse;
      } else {
        throw new Error(
          "Đăng nhập QLDT PTIT thất bại - Sai tài khoản hoặc mật khẩu"
        );
      }
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          "Không thể kết nối đến server PTIT. Vui lòng kiểm tra kết nối mạng."
        );
      }

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
    } catch {
      toast.error("Đã có lỗi xảy ra khi đăng xuất");
      // Vẫn tiếp tục xóa tokens local dù API fail
    } finally {
      // Luôn xóa tokens local
      tokenService.clearAll();
    }
  }

  async getCurrentUser(): Promise<{
    id: string;
    email: string;
    username: string;
    name: string;
    avatar?: string;
    role: string;
    studentId?: string;
    class?: string;
    semester?: string;
  }> {
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
      toast.error("Lấy thông tin user thất bại");
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
      } catch {
        toast.error("Làm mới token thất bại");
      }
    }
  }

  /**
   * Validate registration data
   */
  validateRegistrationData(data: RegisterRequest): string[] {
    const errors: string[] = [];

    if (!data.username || data.username.trim().length < 3) {
      errors.push("Username phải có ít nhất 3 ký tự");
    }

    if (!data.password || data.password.length < 6) {
      errors.push("Password phải có ít nhất 6 ký tự");
    }

    if (!data.firstName || data.firstName.trim().length === 0) {
      errors.push("Họ không được để trống");
    }

    if (!data.lastName || data.lastName.trim().length === 0) {
      errors.push("Tên không được để trống");
    }

    if (!data.email || !this.isValidEmail(data.email)) {
      errors.push("Email không hợp lệ");
    }

    if (!data.phone || !this.isValidPhone(data.phone)) {
      errors.push("Số điện thoại không hợp lệ");
    }

    if (!data.birthDay || !this.isValidDate(data.birthDay)) {
      errors.push("Ngày sinh không hợp lệ (định dạng: yyyy-MM-dd)");
    }

    if (!data.serviceTypes || data.serviceTypes.length === 0) {
      errors.push("Phải chọn ít nhất một dịch vụ");
    }

    return errors;
  }

  /**
   * Validate email format
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone format (Vietnamese phone numbers)
   */
  isValidPhone(phone: string): boolean {
    const phoneRegex = /^(\+84|84|0)[3|5|7|8|9][0-9]{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  }

  /**
   * Validate date format (yyyy-MM-dd)
   */
  isValidDate(dateString: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) return false;

    const date = new Date(dateString);
    const today = new Date();

    // Check if date is valid and not in the future
    return date instanceof Date && !isNaN(date.getTime()) && date <= today;
  }

  /**
   * Format date for API (convert from Date to yyyy-MM-dd string)
   */
  formatDateForAPI(date: Date): string {
    return date.toISOString().split("T")[0];
  }

  /**
   * Get available service types
   */
  getAvailableServiceTypes(): { value: string; label: string }[] {
    return [
      { value: "QUIZ", label: "Hệ thống Quiz" },
      { value: "CLASSROOM", label: "Lớp học trực tuyến" },
      { value: "ASSIGNMENT", label: "Quản lý bài tập" },
      { value: "EXAM", label: "Thi trực tuyến" },
    ];
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): { isValid: boolean; message?: string } {
    if (!password) {
      return { isValid: false, message: "Mật khẩu không được để trống" };
    }

    if (password.length < 6) {
      return { isValid: false, message: "Mật khẩu phải có ít nhất 6 ký tự" };
    }

    // Check for at least one letter and one number
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (!hasLetter || !hasNumber) {
      return {
        isValid: false,
        message: "Mật khẩu phải chứa ít nhất 1 chữ cái và 1 số",
      };
    }

    return { isValid: true };
  }

  /**
   * Validate age based on birth date
   */
  validateAge(birthDay: string): { isValid: boolean; message?: string } {
    if (!birthDay) {
      return { isValid: false, message: "Ngày sinh không được để trống" };
    }

    const birthDate = new Date(birthDay);
    const today = new Date();

    // Check if date is valid
    if (isNaN(birthDate.getTime())) {
      return { isValid: false, message: "Ngày sinh không hợp lệ" };
    }

    // Check if birth date is not in the future
    if (birthDate > today) {
      return {
        isValid: false,
        message: "Ngày sinh không thể là ngày trong tương lai",
      };
    }

    // Calculate age
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    // Check minimum age (13 years old)
    if (age < 13) {
      return { isValid: false, message: "Bạn phải ít nhất 13 tuổi để đăng ký" };
    }

    // Check maximum age (reasonable limit)
    if (age > 120) {
      return { isValid: false, message: "Ngày sinh không hợp lệ" };
    }

    return { isValid: true };
  }
}

// Export singleton instance
export const authService = new AuthService();

// Export class for testing
export { AuthService };
