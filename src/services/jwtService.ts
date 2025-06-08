/**
 * JWT Service - Decode và lấy thông tin từ JWT token
 */

export interface JWTPayload {
  // Standard JWT claims
  iss?: string; // Issuer
  sub?: string; // Subject (user ID)
  aud?: string; // Audience
  exp?: number; // Expiration time
  nbf?: number; // Not before
  iat?: number; // Issued at
  jti?: string; // JWT ID

  // Custom claims cho PTIT
  username?: string;
  email?: string;
  name?: string;
  studentId?: string;
  class?: string;
  role?: string;
  permissions?: string[];

  // Custom claims cho Google
  given_name?: string;
  family_name?: string;
  picture?: string;
  email_verified?: boolean;

  // Các claims khác
  [key: string]: any;
}

class JWTService {
  /**
   * Decode JWT token mà không verify signature
   * Chỉ dùng để lấy thông tin, không dùng để verify tính hợp lệ
   */
  decodeToken(token: string, silent: boolean = false): JWTPayload | null {
    try {
      if (!token) {
        if (!silent) console.warn("⚠️ Token is empty");
        return null;
      }

      // JWT có format: header.payload.signature
      const parts = token.split(".");
      if (parts.length !== 3) {
        if (!silent) console.warn("⚠️ Invalid JWT format");
        return null;
      }

      // Decode payload (base64url)
      const payload = parts[1];

      // Thêm padding nếu cần cho base64url
      const paddedPayload =
        payload + "=".repeat((4 - (payload.length % 4)) % 4);

      // Convert base64url to base64
      const base64 = paddedPayload.replace(/-/g, "+").replace(/_/g, "/");

      // Decode base64
      const decodedPayload = atob(base64);

      // Parse JSON
      const parsedPayload: JWTPayload = JSON.parse(decodedPayload);

      // Chỉ log khi không silent và trong development
      if (!silent && process.env.NODE_ENV === "development") {
        console.log("✅ JWT decoded successfully:", {
          sub: parsedPayload.sub,
          username: parsedPayload.username,
          email: parsedPayload.email,
          exp: parsedPayload.exp ? new Date(parsedPayload.exp * 1000) : null,
        });
      }

      return parsedPayload;
    } catch (error) {
      if (!silent) console.error("❌ Failed to decode JWT:", error);
      return null;
    }
  }

  /**
   * Kiểm tra token có hết hạn không dựa trên exp claim
   */
  isTokenExpired(token: string, silent: boolean = false): boolean {
    try {
      const payload = this.decodeToken(token, silent);
      if (!payload || !payload.exp) {
        return true;
      }

      // exp là timestamp tính bằng giây, Date.now() tính bằng milliseconds
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();

      return currentTime >= expirationTime;
    } catch (error) {
      if (!silent) console.error("❌ Error checking token expiration:", error);
      return true;
    }
  }

  /**
   * Lấy thời gian còn lại của token (seconds)
   */
  getTokenTimeRemaining(token: string, silent: boolean = true): number {
    try {
      const payload = this.decodeToken(token, silent);
      if (!payload || !payload.exp) {
        return 0;
      }

      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();

      return Math.max(0, Math.floor((expirationTime - currentTime) / 1000));
    } catch (error) {
      if (!silent)
        console.error("❌ Error getting token time remaining:", error);
      return 0;
    }
  }

  /**
   * Lấy thông tin user từ access token
   */
  getUserInfoFromToken(
    token: string,
    silent: boolean = false
  ): {
    id: string;
    username?: string;
    email?: string;
    name?: string;
    studentId?: string;
    class?: string;
    role?: string;
    avatar?: string;
    permissions?: string[];
  } | null {
    try {
      const payload = this.decodeToken(token, silent);
      if (!payload) {
        return null;
      }

      // Tạo user info từ JWT payload
      const userInfo = {
        id: payload.sub || payload.username || "unknown",
        username: payload.username,
        email: payload.email,
        name:
          payload.name || payload.given_name
            ? `${payload.given_name || ""} ${payload.family_name || ""}`.trim()
            : payload.username,
        studentId: payload.studentId,
        class: payload.class,
        role: payload.role || "student",
        avatar: payload.picture,
        permissions: payload.permissions || [],
      };

      if (!silent) {
        console.log("✅ User info extracted from token:", {
          id: userInfo.id,
          username: userInfo.username,
          email: userInfo.email,
          role: userInfo.role,
        });
      }

      return userInfo;
    } catch (error) {
      if (!silent)
        console.error("❌ Error extracting user info from token:", error);
      return null;
    }
  }

  /**
   * Kiểm tra token có quyền cụ thể không
   */
  hasPermission(token: string, permission: string): boolean {
    try {
      const payload = this.decodeToken(token);
      if (!payload || !payload.permissions) {
        return false;
      }

      return (
        Array.isArray(payload.permissions) &&
        payload.permissions.includes(permission)
      );
    } catch (error) {
      console.error("❌ Error checking permission:", error);
      return false;
    }
  }

  /**
   * Kiểm tra token có role cụ thể không
   */
  hasRole(token: string, role: string): boolean {
    try {
      const payload = this.decodeToken(token);
      if (!payload) {
        return false;
      }

      return payload.role === role;
    } catch (error) {
      console.error("❌ Error checking role:", error);
      return false;
    }
  }

  /**
   * Lấy tất cả claims từ token
   */
  getAllClaims(token: string, silent: boolean = false): JWTPayload | null {
    return this.decodeToken(token, silent);
  }

  /**
   * Format thời gian hết hạn token
   */
  formatTokenExpiry(token: string): string {
    try {
      const payload = this.decodeToken(token);
      if (!payload || !payload.exp) {
        return "Không xác định";
      }

      const expiryDate = new Date(payload.exp * 1000);
      return expiryDate.toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch (error) {
      console.error("❌ Error formatting token expiry:", error);
      return "Lỗi";
    }
  }

  /**
   * Debug token - in ra tất cả thông tin (chỉ dùng trong development)
   */
  debugToken(token: string): void {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    try {
      const payload = this.decodeToken(token);
      if (!payload) {
        console.log("❌ Cannot decode token");
        return;
      }

      console.group("🔍 JWT Token Debug Info");
      console.log("📋 Full Payload:", payload);
      console.log("👤 User ID:", payload.sub);
      console.log("📧 Email:", payload.email);
      console.log("👨‍🎓 Username:", payload.username);
      console.log("🎓 Student ID:", payload.studentId);
      console.log("🏫 Class:", payload.class);
      console.log("🔑 Role:", payload.role);
      console.log(
        "⏰ Issued At:",
        payload.iat ? new Date(payload.iat * 1000) : "N/A"
      );
      console.log(
        "⏰ Expires At:",
        payload.exp ? new Date(payload.exp * 1000) : "N/A"
      );
      console.log(
        "⏱️ Time Remaining:",
        this.getTokenTimeRemaining(token),
        "seconds"
      );
      console.log("🔒 Permissions:", payload.permissions);
      console.groupEnd();
    } catch (error) {
      console.error("❌ Error debugging token:", error);
    }
  }
}

// Export singleton instance
export const jwtService = new JWTService();

// Export class for testing
export { JWTService };
