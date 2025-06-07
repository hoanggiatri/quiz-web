import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle, AlertTriangle, Info, Trash2 } from "lucide-react";

export default function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      title: "Bài tập mới được giao",
      message: "Giáo viên vừa giao bài tập Toán học chương 4",
      type: "info",
      time: "2 giờ trước",
      isRead: false
    },
    {
      id: 2,
      title: "Điểm thi đã được cập nhật",
      message: "Điểm thi Lập trình Web đã được công bố",
      type: "success",
      time: "1 ngày trước",
      isRead: false
    },
    {
      id: 3,
      title: "Sắp hết hạn nộp bài",
      message: "Bài tập Vật lý sẽ hết hạn trong 2 ngày",
      type: "warning",
      time: "2 ngày trước",
      isRead: true
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Thông báo</h1>
          <p className="text-muted-foreground">Các thông báo và cập nhật mới nhất</p>
        </div>
        <Button variant="outline">
          Đánh dấu tất cả đã đọc
        </Button>
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <Card key={notification.id} className={`${!notification.isRead ? 'border-l-4 border-l-blue-500' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getTypeIcon(notification.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{notification.title}</h3>
                    {!notification.isRead && (
                      <Badge variant="secondary" className="text-xs">Mới</Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground mb-2">{notification.message}</p>
                  <div className="text-sm text-muted-foreground">{notification.time}</div>
                </div>
                
                <div className="flex gap-2">
                  {!notification.isRead && (
                    <Button size="sm" variant="ghost">
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  )}
                  <Button size="sm" variant="ghost">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
