import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  Mail,
  Calendar,
  Edit,
  Save,
  Shield,
  GraduationCap,
  Info
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { tokenService } from "@/services/tokenService";
import { jwtService } from "@/services/jwtService";

export default function UserProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const [tokenInfo, setTokenInfo] = useState<Record<string, unknown> | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isEditing, setIsEditing] = useState(false);

  // Get token info
  useEffect(() => {
    const updateTokenInfo = (isInitial: boolean = false) => {
      const accessToken = tokenService.getAccessToken();
      if (accessToken) {
        // Chỉ log lần đầu, không log trong timer
        const payload = jwtService.getAllClaims(accessToken, !isInitial);
        const remaining = jwtService.getTokenTimeRemaining(accessToken, true); // Always silent for timer
        setTokenInfo(payload);
        setTimeRemaining(remaining);
      }
    };

    // Initial load với log
    updateTokenInfo(true);
    // Timer updates không log
    const interval = setInterval(() => updateTokenInfo(false), 1000);
    return () => clearInterval(interval);
  }, [user]);

  // Get user initials for avatar
  const getUserInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Format time remaining
  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return 'Đã hết hạn';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // Get role display name
  const getRoleDisplayName = (role?: string) => {
    switch (role) {
      case 'STUDENT': return 'Sinh viên';
      case 'TEACHER': return 'Giảng viên';
      case 'ADMIN': return 'Quản trị viên';
      default: return role || 'Người dùng';
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Bạn cần đăng nhập để xem thông tin hồ sơ cá nhân.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Hồ sơ cá nhân</h1>
        <p className="text-muted-foreground">Quản lý thông tin cá nhân của bạn</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <Avatar className="h-24 w-24 mx-auto mb-4">
              <AvatarImage src={user.avatar || tokenInfo?.picture} alt="Avatar" />
              <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
            </Avatar>
            <CardTitle>{user.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-muted-foreground" />
                <span className="font-mono text-xs">{user.id}</span>
              </div>
              {user.studentId && (
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-muted-foreground" />
                  <span>{user.studentId}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="truncate">{user.email}</span>
              </div>
              {user.class && (
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span>{user.class}</span>
                </div>
              )}
              {tokenInfo?.iat && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Đăng nhập: {new Date(tokenInfo.iat * 1000).toLocaleDateString('vi-VN')}</span>
                </div>
              )}
            </div>

            <Separator className="my-4" />

            {/* Token Status */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Phiên đăng nhập:</span>
                <Badge variant={timeRemaining > 300 ? 'default' : timeRemaining > 0 ? 'destructive' : 'secondary'}>
                  {formatTime(timeRemaining)}
                </Badge>
              </div>
              {tokenInfo?.exp && (
                <div className="text-xs text-muted-foreground">
                  Hết hạn: {new Date(tokenInfo.exp * 1000).toLocaleString('vi-VN')}
                </div>
              )}
            </div>

            <Button
              className="w-full"
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit className="w-4 h-4 mr-2" />
              {isEditing ? 'Hủy chỉnh sửa' : 'Chỉnh sửa thông tin'}
            </Button>
          </CardContent>
        </Card>

        {/* Information Form */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Thông tin cá nhân
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    defaultValue={tokenInfo?.username || user.username || user.id}
                    disabled
                  />
                </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và tên</Label>
                <Input
                  id="fullName"
                  defaultValue={user.name}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={user.email}
                  disabled={!isEditing}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studentId">Mã sinh viên</Label>
                  <Input
                    id="studentId"
                    defaultValue={user.studentId || 'N/A'}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="class">Lớp</Label>
                  <Input
                    id="class"
                    defaultValue={user.class || 'N/A'}
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Vai trò</Label>
                <Input
                  id="role"
                  defaultValue={getRoleDisplayName(user.role)}
                  disabled
                />
              </div>

              {isEditing && (
                <div className="flex gap-4">
                  <Button type="submit">
                    <Save className="w-4 h-4 mr-2" />
                    Lưu thay đổi
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Hủy
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Thống kê học tập</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">15</div>
              <div className="text-sm text-muted-foreground">Bài thi đã làm</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">8.5</div>
              <div className="text-sm text-muted-foreground">Điểm trung bình</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">42</div>
              <div className="text-sm text-muted-foreground">Giờ học</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">7</div>
              <div className="text-sm text-muted-foreground">Ngày streak</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
