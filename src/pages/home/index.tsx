import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Clock3,
  BookOpen as BookIcon,
  Play,
  FileText,
  Award,
  Calendar,
  GraduationCap,
  Flame,
  Plus,
  TrendingUp,
  Target,
  BarChart3,
  Activity,
  Bell,
  Star,
} from "lucide-react";
import { GradeChart } from "@/components/charts/GradeChart";
import { AssignmentProgressChart } from "@/components/charts/AssignmentProgressChart";
import { QuizStatsChart } from "@/components/charts/QuizStatsChart";
import { ActivityChart } from "@/components/charts/ActivityChart";

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState("");

  // Mock data
  const userData = {
    name: "Nguyễn Văn A",
    avatar: "https://github.com/shadcn.png",
    role: "Sinh viên",
    studentId: "SV2024001",
    class: "CNTT-K19",
    semester: "Học kỳ 2 - 2024-2025",
    streak: 7,
    level: 15,
    xp: 2450,
    nextLevelXp: 3000
  };

  const stats = {
    totalQuizzes: 24,
    completedQuizzes: 18,
    totalAssignments: 12,
    completedAssignments: 8,
    averageScore: 8.5,
    streak: 7,
    totalStudents: 156,
    activeClasses: 4
  };

  const recentActivities = [
    {
      id: 1,
      type: "quiz",
      title: "Hoàn thành Quiz Toán học",
      score: 9.2,
      time: "2 giờ trước",
      icon: Award
    },
    {
      id: 2,
      type: "assignment",
      title: "Nộp bài tập Vật lý",
      time: "5 giờ trước",
      icon: FileText
    },
    {
      id: 3,
      type: "quiz",
      title: "Hoàn thành Quiz Tiếng Anh",
      score: 8.8,
      time: "1 ngày trước",
      icon: Award
    }
  ];

  const upcomingTasks = [
    {
      id: 1,
      title: "Quiz Lịch sử",
      type: "quiz",
      dueDate: "2024-01-18",
      priority: "high"
    },
    {
      id: 2,
      title: "Bài tập Toán",
      type: "assignment",
      dueDate: "2024-01-20",
      priority: "medium"
    },
    {
      id: 3,
      title: "Thuyết trình Văn",
      type: "assignment",
      dueDate: "2024-01-22",
      priority: "low"
    }
  ];

  const quickActions = [
    {
      title: "Làm Quiz",
      description: "Bắt đầu làm quiz mới",
      icon: <Play className="w-5 h-5" />,
      href: "/quiz/quiz-list",
      color: "bg-blue-500",
      count: 5
    },
    {
      title: "Bài tập",
      description: "Xem bài tập được giao",
      icon: <FileText className="w-5 h-5" />,
      href: "/assignment/assignment-list",
      color: "bg-green-500",
      count: 3
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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Chào buổi sáng");
    else if (hour < 18) setGreeting("Chào buổi chiều");
    else setGreeting("Chào buổi tối");

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      {/* Header - Full Width */}
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-6 w-full">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 max-w-none">
            {/* Welcome Message */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16 ring-4 ring-blue-500/20 shadow-lg">
                  <AvatarImage src={userData.avatar} alt={userData.name} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-bold">
                    {userData.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 shadow-md">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  {greeting}, {userData.name}! <span className="text-2xl">👋</span>
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  {userData.class} • {userData.semester}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                    {userData.streak} ngày liên tiếp
                  </span>
                </div>
              </div>
            </div>

            {/* Time and Level - Improved Alignment */}
            <div className="flex items-center gap-3">
              <Card className="p-4 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm min-w-[120px]">
                <div className="text-center">
                  <Clock3 className="w-5 h-5 mx-auto mb-2 text-blue-500" />
                  <div className="text-lg font-mono font-bold text-gray-900 dark:text-white leading-tight">
                    {formatTime(currentTime)}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    Hôm nay
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm min-w-[120px]">
                <div className="text-center">
                  <Star className="w-5 h-5 mx-auto mb-2 text-yellow-500 fill-current" />
                  <div className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                    Level {userData.level}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    {userData.xp}/{userData.nextLevelXp} XP
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Full Width */}
      <div className="w-full">
        <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-none">
          {/* Quick Stats - Improved Consistency */}
          <section className="mb-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 hover:shadow-lg transition-all duration-200 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      {stats.completedQuizzes}
                    </div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Quiz hoàn thành
                    </div>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                    <BookIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-all duration-200 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      {stats.completedAssignments}
                    </div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Bài tập hoàn thành
                    </div>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl">
                    <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-all duration-200 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      {stats.averageScore}
                    </div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Điểm trung bình
                    </div>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
                    <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-all duration-200 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      {stats.streak}
                    </div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Ngày liên tiếp
                    </div>
                  </div>
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </Card>
            </div>
          </section>

        {/* Main Content Grid - Enhanced Spacing */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-8">
            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {/* Grade Trend Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    Điểm trung bình theo tháng
                  </CardTitle>
                  <CardDescription>
                    Xu hướng điểm số trong 12 tháng qua
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <GradeChart />
                </CardContent>
              </Card>

              {/* Assignment Progress Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-500" />
                    Tiến độ bài tập
                  </CardTitle>
                  <CardDescription>
                    Thống kê hoàn thành bài tập
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AssignmentProgressChart />
                </CardContent>
              </Card>

              {/* Quiz Stats Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-500" />
                    Phân bố điểm Quiz
                  </CardTitle>
                  <CardDescription>
                    Số lượng quiz theo khoảng điểm
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <QuizStatsChart />
                </CardContent>
              </Card>

              {/* Activity Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-orange-500" />
                    Hoạt động tuần này
                  </CardTitle>
                  <CardDescription>
                    Quiz và bài tập theo ngày
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ActivityChart />
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Hành động nhanh
                </CardTitle>
                <CardDescription>
                  Các tác vụ thường dùng
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {quickActions.map((action, index) => (
                    <Link key={index} to={action.href}>
                      <Card className="p-4 hover:shadow-lg transition-all duration-200 cursor-pointer group">
                        <div className="text-center space-y-2">
                          <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mx-auto group-hover:scale-110 transition-transform`}>
                            <div className="text-white">
                              {action.icon}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-sm">{action.title}</div>
                            <div className="text-xs text-muted-foreground">{action.description}</div>
                            {action.count > 0 && (
                              <Badge variant="secondary" className="text-xs mt-1">
                                {action.count}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Recent Activities - Enhanced */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-blue-500" />
                  Hoạt động gần đây
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-0">
                {recentActivities.map((activity, index) => (
                  <div key={activity.id}>
                    <div className="flex items-center gap-3 py-3">
                      <div className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-lg flex-shrink-0">
                        <activity.icon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {activity.title}
                        </p>
                        {activity.score && (
                          <p className="text-sm text-green-600 dark:text-green-400 font-medium mt-0.5">
                            Điểm: {activity.score}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                    {index < recentActivities.length - 1 && (
                      <div className="border-b border-gray-100 dark:border-gray-800"></div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Upcoming Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Sắp tới
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {task.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(task.dueDate)}
                      </p>
                    </div>
                    <Badge variant={getPriorityColor(task.priority)}>
                      {task.type === 'quiz' ? 'Quiz' : 'Bài tập'}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Tiến độ học tập
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Quiz hoàn thành</span>
                    <span>{stats.completedQuizzes}/{stats.totalQuizzes}</span>
                  </div>
                  <Progress value={(stats.completedQuizzes / stats.totalQuizzes) * 100} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Bài tập hoàn thành</span>
                    <span>{stats.completedAssignments}/{stats.totalAssignments}</span>
                  </div>
                  <Progress value={(stats.completedAssignments / stats.totalAssignments) * 100} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Level Progress</span>
                    <span>{userData.xp}/{userData.nextLevelXp} XP</span>
                  </div>
                  <Progress value={(userData.xp / userData.nextLevelXp) * 100} />
                </div>
              </CardContent>
            </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
