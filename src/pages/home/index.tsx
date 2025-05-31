import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  Clock3,
  BookOpen as BookIcon,
  Play,
  FileText,
  Award,
  Calendar,
  GraduationCap,
  Flame,
  ArrowUpRight,
  Plus,
  TrendingUp} from "lucide-react";
import "./styles.css";

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState("");

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Set greeting based on time
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Chào buổi sáng");
    else if (hour < 18) setGreeting("Chào buổi chiều");
    else setGreeting("Chào buổi tối");

    return () => clearInterval(timer);
  }, []);

  // Mock user data
  const userData = {
    name: "Nguyễn Văn A",
    avatar: "https://github.com/shadcn.png",
    role: "Sinh viên",
    studentId: "SV2024001",
    class: "CNTT-K19",
    semester: "Học kỳ 2 - 2024-2025",
    streak: 7, // Learning streak in days
    level: 15,
    xp: 2450,
    nextLevelXp: 3000
  };

  // Quick actions
  const quickActions = [
    {
      title: "Làm bài tập",
      description: "Bắt đầu làm bài tập mới",
      icon: <FileText className="w-5 h-5" />,
      href: "/assignment/assignment-list",
      color: "bg-blue-500",
      count: 3
    },
    {
      title: "Thi thử",
      description: "Luyện tập với đề thi mẫu",
      icon: <Play className="w-5 h-5" />,
      href: "/quiz/quiz-taking-demo",
      color: "bg-green-500",
      count: 5
    },
    {
      title: "Xem điểm",
      description: "Kiểm tra kết quả học tập",
      icon: <Award className="w-5 h-5" />,
      href: "/grades",
      color: "bg-purple-500",
      count: 12
    },
    {
      title: "Lịch học",
      description: "Xem lịch học hôm nay",
      icon: <Calendar className="w-5 h-5" />,
      href: "/schedule",
      color: "bg-orange-500",
      count: 4
    }
  ];

  // Recent activities

  // Upcoming assignments with enhanced data

  // Notifications data

  // Chart data



  // Helper functions



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Enhanced Header Section */}
        <section className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Welcome Message */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
                  <AvatarImage src={userData.avatar} alt={userData.name} />
                  <AvatarFallback className="text-lg font-semibold">
                    {userData.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>

              <div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {greeting}, {userData.name}!
                </h1>
                <p className="text-muted-foreground mt-1 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  {userData.class} • {userData.semester}
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentTime.toLocaleDateString('vi-VN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* User Stats & Level */}
            <div className="flex items-center gap-4">
              {/* Learning Streak */}
              <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Flame className="w-5 h-5" />
                    <span className="text-2xl font-bold">{userData.streak}</span>
                  </div>
                  <p className="text-xs opacity-90">Ngày liên tiếp</p>
                </CardContent>
              </Card>

              {/* Level Progress */}
              <Card className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold">Lv.{userData.level}</div>
                      <div className="text-xs opacity-90">Level</div>
                    </div>
                    <div className="flex-1">
                      <Progress
                        value={(userData.xp / userData.nextLevelXp) * 100}
                        className="h-2 bg-white/20"
                      />
                      <div className="text-xs mt-1 opacity-90">
                        {userData.xp}/{userData.nextLevelXp} XP
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Hành động nhanh</h2>
            <Button variant="ghost" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Tùy chỉnh
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.href}>
                <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl ${action.color} text-white group-hover:scale-110 transition-transform`}>
                        {action.icon}
                      </div>
                      {action.count > 0 && (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                          {action.count}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {action.description}
                    </p>
                    <div className="mt-4 flex items-center text-primary text-sm font-medium">
                      Bắt đầu
                      <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Statistics Cards */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Điểm trung bình</p>
                    <h3 className="text-3xl font-bold">8.5</h3>
                    <p className="text-blue-100 text-xs mt-1">+0.3 từ tháng trước</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-full">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Tỷ lệ hoàn thành</p>
                    <h3 className="text-3xl font-bold">85%</h3>
                    <p className="text-green-100 text-xs mt-1">12/15 bài tập</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-full">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm">Giờ học tập</p>
                    <h3 className="text-3xl font-bold">42h</h3>
                    <p className="text-yellow-100 text-xs mt-1">Tuần này</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-full">
                    <Clock3 className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Bài học hoàn thành</p>
                    <h3 className="text-3xl font-bold">12</h3>
                    <p className="text-purple-100 text-xs mt-1">Tháng này</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-full">
                    <BookIcon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
