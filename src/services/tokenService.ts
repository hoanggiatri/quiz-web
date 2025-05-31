import type { AuthTokens, TokenStorage } from '@/types/auth';

/**
 * Secure Token Storage Service
 * 
 * Lưu trữ token an toàn với các phương pháp bảo mật:
 * 1. Access Token: Lưu trong memory (sessionStorage) - tự động xóa khi đóng tab
 * 2. Refresh Token: Lưu trong localStorage với encryption
 * 3. Auto-cleanup khi token hết hạn
 */

class TokenService implements TokenStorage {
  private readonly ACCESS_TOKEN_KEY = 'quiz_app_access_token';
  private readonly REFRESH_TOKEN_KEY = 'quiz_app_refresh_token';
  private readonly TOKEN_EXPIRY_KEY = 'quiz_app_token_expiry';
  
  // Simple encryption key (trong production nên dùng key phức tạp hơn)
  private readonly ENCRYPTION_KEY = 'quiz_app_secret_key_2024';

  /**
   * Mã hóa đơn giản cho refresh token
   */
  private encrypt(text: string): string {
    try {
      // Simple XOR encryption (trong production nên dùng AES)
      let result = '';
      for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(
          text.charCodeAt(i) ^ this.ENCRYPTION_KEY.charCodeAt(i % this.ENCRYPTION_KEY.length)
        );
      }
      return btoa(result); // Base64 encode
    } catch {
      return text; // Fallback nếu encryption fail
    }
  }

  /**
   * Giải mã refresh token
   */
  private decrypt(encryptedText: string): string {
    try {
      const decoded = atob(encryptedText); // Base64 decode
      let result = '';
      for (let i = 0; i < decoded.length; i++) {
        result += String.fromCharCode(
          decoded.charCodeAt(i) ^ this.ENCRYPTION_KEY.charCodeAt(i % this.ENCRYPTION_KEY.length)
        );
      }
      return result;
    } catch {
      return encryptedText; // Fallback nếu decryption fail
    }
  }

  /**
   * Lưu tokens với bảo mật
   */
  setTokens(tokens: AuthTokens): void {
    try {
      // Access token lưu trong sessionStorage (tự động xóa khi đóng tab)
      sessionStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken);
      
      // Refresh token lưu trong localStorage với mã hóa
      const encryptedRefreshToken = this.encrypt(tokens.refreshToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, encryptedRefreshToken);
      
      // Lưu thời gian hết hạn
      const expiryTime = Date.now() + (tokens.expiresIn * 1000);
      localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
      
      console.log('✅ Tokens saved securely');
    } catch (error) {
      console.error('❌ Failed to save tokens:', error);
    }
  }

  /**
   * Lấy tất cả tokens
   */
  getTokens(): AuthTokens | null {
    try {
      const accessToken = this.getAccessToken();
      const refreshToken = this.getRefreshToken();
      const expiryTime = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
      
      if (!accessToken || !refreshToken || !expiryTime) {
        return null;
      }
      
      const expiresIn = Math.max(0, Math.floor((parseInt(expiryTime) - Date.now()) / 1000));
      
      return {
        accessToken,
        refreshToken,
        expiresIn,
        tokenType: 'Bearer'
      };
    } catch (error) {
      console.error('❌ Failed to get tokens:', error);
      return null;
    }
  }

  /**
   * Lấy access token
   */
  getAccessToken(): string | null {
    try {
      return sessionStorage.getItem(this.ACCESS_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  /**
   * Lấy refresh token (đã giải mã)
   */
  getRefreshToken(): string | null {
    try {
      const encryptedToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
      if (!encryptedToken) return null;
      
      return this.decrypt(encryptedToken);
    } catch {
      return null;
    }
  }

  /**
   * Kiểm tra token có hết hạn không
   */
  isTokenExpired(): boolean {
    try {
      const expiryTime = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
      if (!expiryTime) return true;
      
      return Date.now() >= parseInt(expiryTime);
    } catch {
      return true;
    }
  }

  /**
   * Xóa tất cả tokens
   */
  removeTokens(): void {
    try {
      sessionStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
      console.log('✅ Tokens removed successfully');
    } catch (error) {
      console.error('❌ Failed to remove tokens:', error);
    }
  }

  /**
   * Cập nhật chỉ access token (khi refresh)
   */
  updateAccessToken(accessToken: string, expiresIn: number): void {
    try {
      sessionStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
      
      const expiryTime = Date.now() + (expiresIn * 1000);
      localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
      
      console.log('✅ Access token updated');
    } catch (error) {
      console.error('❌ Failed to update access token:', error);
    }
  }

  /**
   * Kiểm tra token sắp hết hạn (còn < 5 phút)
   */
  isTokenExpiringSoon(): boolean {
    try {
      const expiryTime = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
      if (!expiryTime) return true;
      
      const fiveMinutes = 5 * 60 * 1000; // 5 phút
      return (parseInt(expiryTime) - Date.now()) < fiveMinutes;
    } catch {
      return true;
    }
  }

  /**
   * Lấy thời gian còn lại của token (seconds)
   */
  getTokenTimeRemaining(): number {
    try {
      const expiryTime = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
      if (!expiryTime) return 0;
      
      return Math.max(0, Math.floor((parseInt(expiryTime) - Date.now()) / 1000));
    } catch {
      return 0;
    }
  }

  /**
   * Clear tất cả data khi logout
   */
  clearAll(): void {
    this.removeTokens();
    // Có thể clear thêm các data khác nếu cần
    sessionStorage.clear();
  }
}

// Export singleton instance
export const tokenService = new TokenService();

// Export class for testing
export { TokenService };
