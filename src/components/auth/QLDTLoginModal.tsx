import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, School, User, Lock } from 'lucide-react';
import type { QLDTCredentials } from '@/types/auth';

interface QLDTLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (credentials: QLDTCredentials) => Promise<void>;
  isLoading: boolean;
}

export default function QLDTLoginModal({
  isOpen,
  onClose,
  onLogin,
  isLoading
}: QLDTLoginModalProps) {
  const [credentials, setCredentials] = useState<QLDTCredentials>({
    username: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials.username || !credentials.password) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setError(null);
    
    try {
      await onLogin(credentials);
      // Reset form on success
      setCredentials({ username: '', password: '' });
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Đăng nhập thất bại');
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setCredentials({ username: '', password: '' });
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-full">
              <School className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">
                Đăng nhập QLDT PTIT
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Sử dụng tài khoản Quản lý Đào tạo PTIT của bạn
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="qldt-username" className="text-sm font-medium">
              Tên đăng nhập
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="qldt-username"
                type="text"
                placeholder="Nhập tên đăng nhập QLDT"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                disabled={isLoading}
                className="pl-10"
                autoComplete="username"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Ví dụ: B21DCCN123 hoặc tên đăng nhập QLDT của bạn
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="qldt-password" className="text-sm font-medium">
              Mật khẩu
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="qldt-password"
                type="password"
                placeholder="Nhập mật khẩu QLDT"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                disabled={isLoading}
                className="pl-10"
                autoComplete="current-password"
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                <p className="font-medium mb-1">Lưu ý bảo mật:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Sử dụng tài khoản QLDT chính thức của PTIT</li>
                  <li>• Thông tin đăng nhập được mã hóa an toàn</li>
                  <li>• Không lưu trữ mật khẩu trên hệ thống</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !credentials.username || !credentials.password}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                <>
                  <School className="w-4 h-4 mr-2" />
                  Đăng nhập
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="border-t pt-4">
          <p className="text-xs text-center text-muted-foreground">
            Bằng việc đăng nhập, bạn đồng ý với{' '}
            <a href="#" className="text-primary hover:underline">
              Điều khoản sử dụng
            </a>{' '}
            và{' '}
            <a href="#" className="text-primary hover:underline">
              Chính sách bảo mật
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
