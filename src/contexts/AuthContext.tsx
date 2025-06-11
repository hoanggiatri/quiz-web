import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type {
  AuthContextType,
  User,
  LoginRequest,
  QLDTCredentials
} from '@/types/auth';
import { authService } from '@/services/authService';
import { tokenService } from '@/services/tokenService';
import { jwtService } from '@/services/jwtService';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Computed property
  const isAuthenticated = user !== null && authService.isAuthenticated();

  /**
   * Initialize auth state on app start
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);

        // Check if we have valid tokens
        if (authService.isAuthenticated()) {
          // Try to get user info from access token first
          const accessToken = tokenService.getAccessToken();
          if (accessToken) {
            // Use silent mode để không log liên tục
            const userInfoFromToken = jwtService.getUserInfoFromToken(accessToken);

            if (userInfoFromToken) {
              // Set user from token info
              const userData: User = {
                id: userInfoFromToken.id,
                email: userInfoFromToken.email || '',
                username: userInfoFromToken.username || userInfoFromToken.id,
                name: userInfoFromToken.name || userInfoFromToken.username || 'User',
                role: userInfoFromToken.role || 'student',
                avatar: userInfoFromToken.avatar,
                studentId: userInfoFromToken.studentId,
                class: userInfoFromToken.class
              };

              setUser(userData);


            } else {
              // If can't get user from token, try API
              try {
                const userData = await authService.getCurrentUser();
                setUser(userData);
              } catch {
                toast.error('Đã có lỗi xảy ra khi tải thông tin người dùng');
                tokenService.removeTokens();
                setUser(null);
              }
            }
          } else {
            // No access token
            setUser(null);
          }
        } else {
          // No valid tokens, user is not authenticated
          setUser(null);
        }
      } catch {
        toast.error('Đã có lỗi xảy ra khi khởi tạo xác thực');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Auto-refresh token periodically
   */
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      authService.autoRefreshToken();
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  /**
   * Login with username/password (API mới)
   */
  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);

      const response = await authService.login(credentials);

      if (response.status === 1 && response.accessToken) {
        // Lấy thông tin user từ token
        const userInfoFromToken = jwtService.getUserInfoFromToken(response.accessToken);

        if (userInfoFromToken) {
          const userData: User = {
            id: userInfoFromToken.id,
            email: userInfoFromToken.email || '',
            username: userInfoFromToken.username || credentials.username,
            name: userInfoFromToken.name || userInfoFromToken.username || 'User',
            role: userInfoFromToken.role || 'student',
            avatar: userInfoFromToken.avatar,
            studentId: userInfoFromToken.studentId,
            class: userInfoFromToken.class
          };

          setUser(userData);

        } else {
          // Fallback nếu không decode được token
          const userData: User = {
            id: credentials.username,
            email: '',
            username: credentials.username,
            name: credentials.username,
            role: 'student'
          };

          setUser(userData);
        }
      } else {
        throw new Error('Đăng nhập thất bại - Sai tài khoản hoặc mật khẩu');
      }
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Đã có lỗi xảy ra khi đăng nhập');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);


  /**
   * Login with Google
   */
  const loginWithGoogle = useCallback(async (idToken: string) => {
    try {
      setIsLoading(true);

      // Use real Google login API
      const response = await authService.loginWithGoogle(idToken);

      if (response.success) {
        setUser(response.user);
      } else {
        throw new Error(response.message || 'Đăng nhập Google thất bại');
      }
    } catch (error) {
      toast.error('Đã có lỗi xảy ra khi đăng nhập Google');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Login with QLDT
   */
  const loginWithQLDT = useCallback(async (credentials: QLDTCredentials) => {
    try {
      setIsLoading(true);

      const response = await authService.loginWithQLDT(credentials);

      if (response.success && response.tokens) {
        const userInfoFromToken = jwtService.getUserInfoFromToken(response.tokens.accessToken);

        let userData: User;

        if (userInfoFromToken) {
          userData = {
            id: userInfoFromToken.id,
            email: userInfoFromToken.email || response.user.email,
            username: userInfoFromToken.username || response.user.username,
            name: userInfoFromToken.name || response.user.name,
            role: userInfoFromToken.role || 'student',
            avatar: userInfoFromToken.avatar,
            studentId: userInfoFromToken.studentId || response.user.studentId,
            class: userInfoFromToken.class || response.user.class
          };

          // Debug token in development
          if (process.env.NODE_ENV === 'development') {
            jwtService.debugToken(response.tokens.accessToken);
          }
        } else {
          // Fallback to response user info
          userData = {
            id: response.user.id,
            email: response.user.email,
            username:response.user.username,
            name: response.user.name,
            role: 'student',
            studentId: response.user.studentId,
            class: response.user.class
          };
        }

        setUser(userData);
      } else {
        throw new Error(response.message || 'Đăng nhập QLDT thất bại');
      }
    } catch (error) {
      console.error('QLDT login failed:', error);
      toast.error('Đã có lỗi xảy ra khi đăng nhập QLDT');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Đã có lỗi xảy ra khi đăng xuất');
      // Even if logout API fails, clear local state
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);



  /**
   * Refresh token
   */
  const refreshToken = useCallback(async () => {
    try {
      await authService.refreshToken();
      // Token is automatically updated in tokenService
    } catch (error) {
      console.error('Token refresh failed:', error);
      toast.error('Đã có lỗi xảy ra khi làm mới token');
      // If refresh fails, logout user
      setUser(null);
      throw error;
    }
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    loginWithGoogle,
    loginWithQLDT,
    logout,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
