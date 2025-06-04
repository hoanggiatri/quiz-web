import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Shield } from "lucide-react";
import { useUserContext } from "@/contexts/UserContext";

export default function UserDebugInfo() {
  const { user, userId } = useUserContext();

  if (!user) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">
            ⚠️ Không có thông tin user
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 dark:text-red-400">
            User chưa được khởi tạo
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
      <CardHeader>
        <CardTitle className="text-blue-600 dark:text-blue-400 flex items-center gap-2">
          <User className="w-5 h-5" />
          Debug: Thông tin User
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              User ID:
            </label>
            <div className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded border">
              {userId}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            <span className="font-medium">{user.name}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">{user.email}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-gray-500" />
            <Badge variant="outline" className="capitalize">
              {user.role}
            </Badge>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
          <p className="text-xs text-yellow-700 dark:text-yellow-400">
            💡 <strong>Mock Data:</strong> Đây là dữ liệu user giả lập. 
            Trong production sẽ lấy từ hệ thống authentication.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
