import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertCircle, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2,
  School,
  GraduationCap,
  BookOpen,
  Users,
  Award,
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import QLDTLoginModal from "@/components/auth/QLDTLoginModal";
import GoogleSignIn from "@/components/auth/GoogleSignIn";
import type { QLDTCredentials, LoginRequest } from "@/types/auth";
import "./styles.css";

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const { login, loginWithGoogle, loginWithQLDT, isLoading } = useAuth();
  

  // New API credentials
  const [newCredentials, setNewCredentials] = useState<LoginRequest>({
    username: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showQLDTModal, setShowQLDTModal] = useState(false);


  // Rotate stats every 3 seconds
  useEffect(() => {
  });


  // New login method using username/password API
  const handleUsernameLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCredentials.username || !newCredentials.password) {
      setError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu");
      return;
    }

    setError(null);

    try {
      await login(newCredentials);

      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        // Redirect to dashboard
        window.location.href = '/';
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Đăng nhập thất bại");
    }
  };

  const handleGoogleLogin = async (credential: string) => {
    setError(null);

    try {
      await loginWithGoogle(credential);
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Đăng nhập Google thất bại");
    }
  };

  const handleGoogleError = (error: Error) => {
    setError(error.message);
  };

  const handleQLDTLogin = async (qldt: QLDTCredentials) => {
      await loginWithQLDT(qldt);
      if (onLoginSuccess) {
        onLoginSuccess();
      }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Login Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border-0">
              {/* Logo & Title */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                    <GraduationCap className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    EduNext
                  </h1>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  Chào mừng trở lại!
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Đăng nhập để tiếp tục học tập
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Social Login Buttons */}
              <div className="space-y-3 mb-6">
                <GoogleSignIn
                  onSuccess={handleGoogleLogin}
                  onError={handleGoogleError}
                  disabled={isLoading}
                />

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 text-sm font-medium border-2 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                  onClick={() => setShowQLDTModal(true)}
                  disabled={isLoading}
                >
                  <School className="w-5 h-5 mr-3 text-red-600" />
                  Đăng nhập với QLDT PTIT
                </Button>
              </div>

              {/* Divider */}
              <div className="relative mb-6">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 px-4 text-sm text-gray-500">
                  Hoặc đăng nhập với tài khoản
                </span>
              </div>

              {/* Username Login Form */}
              <form onSubmit={handleUsernameLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">
                    Tên đăng nhập
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Nhập tên đăng nhập"
                      value={newCredentials.username}
                      onChange={(e) => setNewCredentials(prev => ({ ...prev, username: e.target.value }))}
                      disabled={isLoading}
                      className="pl-10 h-12"
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Mật khẩu
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu"
                      value={newCredentials.password}
                      onChange={(e) => setNewCredentials(prev => ({ ...prev, password: e.target.value }))}
                      disabled={isLoading}
                      className="pl-10 pr-10 h-12"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <a href="#" className="text-sm text-primary hover:underline">
                    Quên mật khẩu?
                  </a>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang đăng nhập...
                    </>
                  ) : (
                    "Đăng nhập"
                  )}
                </Button>
              </form>

              {/* Sign Up Link */}
              <div className="text-center mt-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Chưa có tài khoản?{" "}
                  <a href="/register" className="text-primary hover:underline font-medium">
                    Đăng ký ngay
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Features & Stats */}
          <div className="hidden lg:block">
            <div className="text-center space-y-8">
              {/* Hero Image */}
              <div className="relative">
                <div className="w-96 h-96 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center overflow-hidden">
                  <div className="relative w-full h-full flex items-center justify-center">
                    {/* Floating Elements */}
                    <div className="absolute top-8 left-8 w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center animate-bounce">
                      <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute top-16 right-12 w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center animate-pulse">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute bottom-16 left-12 w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center animate-bounce delay-300">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <div className="absolute bottom-8 right-8 w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center animate-pulse delay-500">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>

                    {/* Center Icon */}
                    <div className="w-32 h-32 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
                      <GraduationCap className="w-16 h-16 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-4">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Nền tảng học tập thông minh
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                  Trải nghiệm học tập hiện đại với hệ thống quản lý bài thi và đánh giá thông minh,
                  được tin dùng bởi hàng nghìn sinh viên.
                </p>
              </div>

              {/* Features List */}
              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Thi trực tuyến</span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Thống kê chi tiết</span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Ngân hàng câu hỏi</span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Chấm điểm tự động</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QLDT Login Modal */}
      <QLDTLoginModal
        isOpen={showQLDTModal}
        onClose={() => setShowQLDTModal(false)}
        onLogin={handleQLDTLogin}
        isLoading={isLoading}
      />
    </>
  );
}
