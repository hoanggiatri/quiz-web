import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BookOpen, Play, Users, AlertTriangle, Calendar, User } from "lucide-react";
import { quizService, type PublicQuiz } from "@/services/quizService";
import "@/styles/quiz.css";

export default function QuizListPage() {
  const [quizzes, setQuizzes] = useState<PublicQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load quizzes from API
  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await quizService.getAllPublicQuizzes();

        if (response.status === 200 && response.data) {
          setQuizzes(response.data);
        } else {
          throw new Error(response.message || 'Không thể tải danh sách bài thi');
        }
      } catch (err) {
        console.error('Error loading quizzes:', err);
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    loadQuizzes();
  }, []);

  // Helper functions
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'Dễ';
      case 'medium': return 'Trung bình';
      case 'hard': return 'Khó';
      default: return difficulty || 'Không xác định';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isQuizAvailable = (quiz: PublicQuiz) => {
    const now = new Date();
    const startTime = new Date(quiz.startTime);
    const endTime = new Date(quiz.endTime);
    return now >= startTime && now <= endTime;
  };

  const getQuizStatus = (quiz: PublicQuiz) => {
    const now = new Date();
    const startTime = new Date(quiz.startTime);
    const endTime = new Date(quiz.endTime);

    if (now < startTime) return 'upcoming';
    if (now > endTime) return 'expired';
    return 'available';
  };

  const getStatusBadge = (quiz: PublicQuiz) => {
    const status = getQuizStatus(quiz);

    switch (status) {
      case 'upcoming':
        return <Badge variant="outline" className="text-blue-600 border-blue-300">Sắp diễn ra</Badge>;
      case 'expired':
        return <Badge variant="outline" className="text-red-600 border-red-300">Đã kết thúc</Badge>;
      case 'available':
        return <Badge variant="default" className="bg-green-600">Đang mở</Badge>;
      default:
        return <Badge variant="secondary">Không xác định</Badge>;
    }
  };

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Danh sách bài thi</h1>
        <p className="text-muted-foreground">Chọn bài thi để bắt đầu làm bài</p>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="space-y-2 mb-4">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Chưa có bài thi nào</h2>
          <p className="text-muted-foreground">Hiện tại chưa có bài thi nào được công bố.</p>
        </div>
      ) : (
        /* Quiz Grid */
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => {
            const status = getQuizStatus(quiz);
            const available = isQuizAvailable(quiz);

            return (
              <Card key={quiz.examQuizzesId} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BookOpen className="w-5 h-5" />
                      {quiz.title}
                    </CardTitle>
                    {getStatusBadge(quiz)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>{quiz.createdBy}</span>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3 text-sm mb-6">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{quiz.totalQuestions} câu hỏi</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div>Bắt đầu: {formatDate(quiz.startTime)}</div>
                        <div>Kết thúc: {formatDate(quiz.endTime)}</div>
                      </div>
                    </div>

                    {quiz.code && (
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                        <span>Mã: {quiz.code}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Link to={`/quiz/quiz-detail/${quiz.examQuizzesId}`}>
                      <Button
                        variant="outline"
                        className="w-full"
                      >
                        Xem chi tiết
                      </Button>
                    </Link>

                    <Link to={`/quiz/quiz-detail/${quiz.examQuizzesId}`}>
                      <Button
                        className="w-full"
                        disabled={!available}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {available ? 'Bắt đầu thi' :
                         status === 'upcoming' ? 'Chưa đến giờ' : 'Đã kết thúc'}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
