// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface QLDTCredentials {
  username: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  name?: string;
  avatar?: string;
  role: string;
  studentId?: string;
  class?: string;
  semester?: string;
}

export interface LoginResponse {
  status: number;
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  tokens: AuthTokens;
  message?: string;
}

export interface GoogleAuthResponse {
  credential: string;
  select_by: string;
}

export interface QLDTAuthResponse {
  success: boolean;
  user: {
    id: string;
    username: string;
    name: string;
    studentId: string;
    class: string;
    email: string;
  };
  tokens: AuthTokens;
  message?: string;
}

export type LoginProvider = "email" | "google" | "qldt";

export interface LoginState {
  isLoading: boolean;
  error: string | null;
  provider: LoginProvider | null;
}

// Token storage interface
export interface TokenStorage {
  getTokens(): AuthTokens | null;
  setTokens(tokens: AuthTokens): void;
  removeTokens(): void;
  getAccessToken(): string | null;
  getRefreshToken(): string | null;
  isTokenExpired(): boolean;
}

// Auth context interface
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  loginWithQLDT: (credentials: QLDTCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}
