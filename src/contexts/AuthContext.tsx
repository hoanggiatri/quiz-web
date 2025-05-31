import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { 
  AuthContextType, 
  User, 
  LoginCredentials, 
  QLDTCredentials 
} from '@/types/auth';
import { authService } from '@/services/authService';
import { tokenService } from '@/services/tokenService';

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
          // Try to get current user info
          try {
            const userData = await authService.getCurrentUser();
            setUser(userData.user);
          } catch (error) {
            console.error('Failed to get current user:', error);
            // If getting user fails, clear tokens
            tokenService.removeTokens();
            setUser(null);
          }
        } else {
          // No valid tokens, user is not authenticated
          setUser(null);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
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
   * Login with email/password
   */
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      
      // Use mock login for development
      const response = await authService.mockLogin(credentials);
      
      if (response.success) {
        setUser(response.user);
      } else {
        throw new Error(response.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Login with Google
   */
  const loginWithGoogle = useCallback(async (credential: string) => {
    try {
      setIsLoading(true);
      
      // Use mock Google login for development
      const response = await authService.mockGoogleLogin(credential);
      
      if (response.success) {
        setUser(response.user);
      } else {
        throw new Error(response.message || 'Đăng nhập Google thất bại');
      }
    } catch (error) {
      console.error('Google login failed:', error);
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
      
      // Use mock QLDT login for development
      const response = await authService.mockQLDTLogin(credentials);
      
      if (response.success) {
        // Convert QLDT user to standard User format
        const standardUser: User = {
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          role: 'student',
          studentId: response.user.studentId,
          class: response.user.class
        };
        setUser(standardUser);
      } else {
        throw new Error(response.message || 'Đăng nhập QLDT thất bại');
      }
    } catch (error) {
      console.error('QLDT login failed:', error);
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
