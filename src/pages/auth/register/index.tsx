import { useState } from "react";
import { Link } from "react-router-dom";
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
  User,
  Phone,
  Calendar,
  GraduationCap,
  BookOpen,
  Users,
  Award,
  TrendingUp,
  CheckCircle
} from "lucide-react";
import { authService, type RegisterData } from "@/services/authService";
import "./styles.css";

interface RegisterFormData {
  username: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDay: string;
}

interface RegisterPageProps {
  onRegisterSuccess?: () => void;
}

export default function RegisterPage({ onRegisterSuccess }: RegisterPageProps) {
  // Form states
  const [formData, setFormData] = useState<RegisterFormData>({
    username: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDay: ""
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Validation states
  const [fieldErrors, setFieldErrors] = useState<Partial<RegisterFormData>>({});
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | 'very-strong' | null>(null);

  const validateField = (name: keyof RegisterFormData, value: string) => {
    let error = "";

    switch (name) {
      case "username":
        if (!value.trim()) {
          error = "Tên đăng nhập không được để trống";
        } else if (value.length < 3) {
          error = "Tên đăng nhập phải có ít nhất 3 ký tự";
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          error = "Tên đăng nhập chỉ được chứa chữ, số và dấu gạch dưới";
        }
        break;

      case "email":
        if (!value.trim()) {
          error = "Email không được để trống";
        } else if (!authService.validateEmail(value)) {
          error = "Email không hợp lệ";
        }
        break;

      case "password":
        const passwordValidation = authService.validatePassword(value);
        if (!passwordValidation.isValid) {
          error = passwordValidation.message || "Mật khẩu không hợp lệ";
        }

        // Calculate password strength
        if (value) {
          let strength = 0;
          if (value.length >= 6) strength++;
          if (/(?=.*[a-z])/.test(value)) strength++;
          if (/(?=.*[A-Z])/.test(value)) strength++;
          if (/(?=.*\d)/.test(value)) strength++;
          if (/(?=.*[!@#$%^&*])/.test(value)) strength++;

          if (strength <= 1) setPasswordStrength('weak');
          else if (strength <= 2) setPasswordStrength('medium');
          else if (strength <= 3) setPasswordStrength('strong');
          else setPasswordStrength('very-strong');
        } else {
          setPasswordStrength(null);
        }
        break;

      case "confirmPassword":
        if (value !== formData.password) {
          error = "Mật khẩu xác nhận không khớp";
        }
        break;

      case "firstName":
      case "lastName":
        if (!value.trim()) {
          error = `${name === "firstName" ? "Tên" : "Họ"} không được để trống`;
        } else if (value.length < 2) {
          error = `${name === "firstName" ? "Tên" : "Họ"} phải có ít nhất 2 ký tự`;
        }
        break;

      case "phone":
        if (!value.trim()) {
          error = "Số điện thoại không được để trống";
        } else if (!authService.validatePhone(value)) {
          error = "Số điện thoại không hợp lệ (VD: 0987654321)";
        }
        break;

      case "birthDay":
        if (!value) {
          error = "Ngày sinh không được để trống";
        } else {
          const ageValidation = authService.validateAge(value);
          if (!ageValidation.isValid) {
            error = ageValidation.message || "Ngày sinh không hợp lệ";
          }
        }
        break;
    }

    setFieldErrors(prev => ({
      ...prev,
      [name]: error
    }));

    return !error;
  };

  const handleInputChange = (name: keyof RegisterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear previous errors
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: "" }));
    }

    // Clear global error when user starts typing
    if (error) {
      setError(null);
    }

    // Validate on blur for better UX
    if (value.trim()) {
      validateField(name, value);
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const errors: Partial<RegisterFormData> = {};

    // Validate all fields
    Object.keys(formData).forEach(key => {
      const fieldName = key as keyof RegisterFormData;
      const value = formData[fieldName];
      
      if (!validateField(fieldName, value)) {
        isValid = false;
      }
    });

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError("Vui lòng kiểm tra lại thông tin đã nhập");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const registerData: Omit<RegisterData, 'serviceTypes'> = {
        username: formData.username,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        birthDay: formData.birthDay
      };

      const response = await authService.register(registerData);
      
      if (response.status === 1) {
        setSuccess(true);
        if (onRegisterSuccess) {
          setTimeout(() => {
            onRegisterSuccess();
          }, 2000);
        }
      } else {
        throw new Error(response.message || "Đăng ký thất bại");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Đăng ký thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border-0 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Đăng ký thành công!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Tài khoản của bạn đã được tạo thành công. Bạn có thể đăng nhập ngay bây giờ.
            </p>
            <Link to="/auth/login">
              <Button className="w-full">
                Đăng nhập ngay
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">

        {/* Left Side - Register Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border-0">
            
            {/* Logo & Title */}
            <div className="text-center mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  EduNext
                </h1>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Tạo tài khoản mới
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Đăng ký để bắt đầu hành trình học tập
              </p>
            </div>

            {/* Development Notice */}
            {import.meta.env.DEV && (
              <Alert className="mb-3 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-xs text-blue-700 dark:text-blue-300">
                  🔧 Development mode: Using mock API due to CORS restrictions
                </AlertDescription>
              </Alert>
            )}

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="mb-3">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}

            {/* Register Form */}
            <form onSubmit={handleSubmit} className="space-y-2">
              {/* Username */}
              <div>
                <Label htmlFor="username" className="text-xs font-medium">
                  Tên đăng nhập *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Nhập tên đăng nhập"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    disabled={isLoading}
                    className={`pl-10 h-9 mt-1 ${fieldErrors.username ? 'border-red-500' : ''}`}
                    autoComplete="username"
                  />
                </div>
                {fieldErrors.username && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.username}</p>
                )}
              </div>

              {/* First Name & Last Name */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="firstName" className="text-xs font-medium">
                    Tên *
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Tên"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    disabled={isLoading}
                    className={`h-9 mt-1 ${fieldErrors.firstName ? 'border-red-500' : ''}`}
                    autoComplete="given-name"
                  />
                  {fieldErrors.firstName && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.firstName}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lastName" className="text-xs font-medium">
                    Họ *
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Họ"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    disabled={isLoading}
                    className={`h-9 mt-1 ${fieldErrors.lastName ? 'border-red-500' : ''}`}
                    autoComplete="family-name"
                  />
                  {fieldErrors.lastName && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="email" className="text-xs font-medium">
                    Email *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      disabled={isLoading}
                      className={`pl-10 h-9 mt-1 ${fieldErrors.email ? 'border-red-500' : ''}`}
                      autoComplete="email"
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone" className="text-xs font-medium">
                    Số điện thoại *
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Số điện thoại"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      disabled={isLoading}
                      className={`pl-10 h-9 mt-1 ${fieldErrors.phone ? 'border-red-500' : ''}`}
                      autoComplete="tel"
                    />
                  </div>
                  {fieldErrors.phone && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.phone}</p>
                  )}
                </div>
              </div>

              {/* Birth Date */}
              <div>
                <Label htmlFor="birthDay" className="text-xs font-medium">
                  Ngày sinh *
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="birthDay"
                    type="date"
                    value={formData.birthDay}
                    onChange={(e) => handleInputChange("birthDay", e.target.value)}
                    disabled={isLoading}
                    className={`pl-10 h-9 mt-1 ${fieldErrors.birthDay ? 'border-red-500' : ''}`}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                {fieldErrors.birthDay && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.birthDay}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password" className="text-xs font-medium">
                  Mật khẩu *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    disabled={isLoading}
                    className={`pl-10 pr-10 h-9 mt-1 ${fieldErrors.password ? 'border-red-500' : ''}`}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>
                )}

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Độ mạnh</span>
                      <span className={`font-medium ${
                        passwordStrength === 'weak' ? 'text-red-500' :
                        passwordStrength === 'medium' ? 'text-yellow-500' :
                        passwordStrength === 'strong' ? 'text-blue-500' :
                        'text-green-500'
                      }`}>
                        {passwordStrength === 'weak' ? 'Yếu' :
                         passwordStrength === 'medium' ? 'TB' :
                         passwordStrength === 'strong' ? 'Mạnh' :
                         'Rất mạnh'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div
                        className={`h-1 rounded-full transition-all duration-300 ${
                          passwordStrength === 'weak' ? 'w-1/4 bg-red-500' :
                          passwordStrength === 'medium' ? 'w-2/4 bg-yellow-500' :
                          passwordStrength === 'strong' ? 'w-3/4 bg-blue-500' :
                          'w-full bg-green-500'
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <Label htmlFor="confirmPassword" className="text-xs font-medium">
                  Xác nhận mật khẩu *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    disabled={isLoading}
                    className={`pl-10 pr-10 h-9 mt-1 ${fieldErrors.confirmPassword ? 'border-red-500' : ''}`}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.confirmPassword}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium mt-4"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang đăng ký...
                  </>
                ) : (
                  "Đăng ký"
                )}
              </Button>
            </form>

            {/* Login Link */}
            <div className="text-center mt-4">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Đã có tài khoản?{" "}
                <Link to="/auth/login" className="text-primary hover:underline font-medium">
                  Đăng nhập ngay
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Features & Benefits */}
        <div className="hidden lg:block">
          <div className="text-center space-y-8">

            {/* Hero Image */}
            <div className="relative">
              <div className="w-96 h-96 mx-auto bg-gradient-to-br from-purple-100 to-blue-100 rounded-3xl flex items-center justify-center overflow-hidden">
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Floating Elements */}
                  <div className="absolute top-8 left-8 w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center animate-bounce">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute top-16 right-12 w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center animate-pulse">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute bottom-16 left-12 w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center animate-bounce delay-300">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute bottom-8 right-8 w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center animate-pulse delay-500">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>

                  {/* Center Icon */}
                  <div className="w-32 h-32 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl">
                    <GraduationCap className="w-16 h-16 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-4">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Tham gia cộng đồng học tập
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                Khám phá thế giới học tập trực tuyến với hàng nghìn bài thi,
                bài tập và tài liệu học tập chất lượng cao.
              </p>
            </div>

            {/* Benefits List */}
            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Miễn phí đăng ký</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Học mọi lúc mọi nơi</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Cộng đồng hỗ trợ</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Chứng chỉ uy tín</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">10K+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Học viên</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">500+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Bài thi</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">98%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Hài lòng</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
