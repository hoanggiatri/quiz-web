import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Award,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  RotateCcw,
  AlertTriangle,
  Calendar,
  Target,
  TrendingUp,
  Download,
  Share2
} from "lucide-react";
import { quizSubmissionService, type QuizResult } from "@/services/quizSubmissionService";
import "@/styles/quiz.css";

export default function QuizResultPage() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const location = useLocation();

  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get result from location state or API
  useEffect(() => {
    const loadResult = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if result is passed via location state
        if (location.state?.result) {
          setResult(location.state.result);
          setLoading(false);
          return;
        }

        // Otherwise fetch from API
        if (submissionId) {
          const resultData = await quizSubmissionService.getQuizResult(submissionId);
          setResult(resultData);
        } else {
          throw new Error('Không tìm thấy ID kết quả bài thi');
        }
      } catch (err) {
        console.error('Error loading quiz result:', err);
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải kết quả');
      } finally {
        setLoading(false);
      }
    };

    loadResult();
  }, [submissionId, location.state]);

  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours} giờ ${minutes} phút`;
    }
    return `${minutes} phút`;
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-100' };
    if (percentage >= 80) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (percentage >= 70) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (percentage >= 60) return { grade: 'D', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { grade: 'F', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const getPerformanceMessage = (percentage: number) => {
    if (percentage >= 90) return 'Xuất sắc! Bạn đã làm bài rất tốt.';
    if (percentage >= 80) return 'Tốt! Kết quả khá ấn tượng.';
    if (percentage >= 70) return 'Khá tốt! Còn có thể cải thiện thêm.';
    if (percentage >= 60) return 'Đạt yêu cầu. Hãy cố gắng hơn lần sau.';
    return 'Cần cải thiện. Hãy ôn tập và thử lại.';
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/quiz/quiz-list">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
          </Link>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="text-center">
              <Skeleton className="h-8 w-48 mx-auto mb-2" />
              <Skeleton className="h-6 w-24 mx-auto" />
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <Skeleton className="h-20 w-32 mx-auto mb-4" />
                <Skeleton className="h-4 w-64 mx-auto" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="text-center p-4 border rounded-lg">
                    <Skeleton className="w-8 h-8 mx-auto mb-2" />
                    <Skeleton className="h-8 w-12 mx-auto mb-1" />
                    <Skeleton className="h-4 w-16 mx-auto" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !result) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/quiz/quiz-list">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
          </Link>
        </div>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error || 'Không tìm thấy kết quả bài thi'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Defensive programming - ensure all required fields exist
  const percentage = result.percentage ?? ((result.score / result.maxScore) * 100);
  const correctAnswers = result.correctAnswers ?? 0;
  const totalQuestions = result.totalQuestions ?? 0;
  const timeSpent = result.timeSpent ?? 0;
  const submittedAt = result.submittedAt ?? new Date().toISOString();

  const gradeInfo = getGrade(percentage);
  const wrongAnswers = totalQuestions - correctAnswers;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/quiz/quiz-list">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Result */}
        <div className="lg:col-span-2 space-y-6">
          {/* Result Summary */}
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Kết quả bài thi</CardTitle>
              <Badge variant="secondary" className="w-fit mx-auto">
                <CheckCircle className="w-4 h-4 mr-1" />
                Hoàn thành
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-8">
                <div className="text-7xl font-bold text-primary mb-2">
                  {result.score}/{result.maxScore}
                </div>
                <div className="text-2xl text-muted-foreground mb-4">
                  {percentage.toFixed(1)}%
                </div>
                <Progress value={percentage} className="h-4 max-w-md mx-auto mb-4" />
                <p className="text-lg text-muted-foreground">
                  {getPerformanceMessage(percentage)}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
                  <div className="text-sm text-muted-foreground">Câu đúng</div>
                </div>

                <div className="text-center p-4 border rounded-lg bg-red-50 dark:bg-red-900/20">
                  <XCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
                  <div className="text-2xl font-bold text-red-600">{wrongAnswers}</div>
                  <div className="text-sm text-muted-foreground">Câu sai</div>
                </div>

                <div className="text-center p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold text-blue-600">{formatTime(timeSpent)}</div>
                  <div className="text-sm text-muted-foreground">Thời gian</div>
                </div>

                <div className={`text-center p-4 border rounded-lg ${gradeInfo.bg}`}>
                  <Award className={`w-8 h-8 mx-auto mb-2 ${gradeInfo.color}`} />
                  <div className={`text-2xl font-bold ${gradeInfo.color}`}>{gradeInfo.grade}</div>
                  <div className="text-sm text-muted-foreground">Xếp loại</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Phân tích chi tiết
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {totalQuestions > 0 ? ((correctAnswers / totalQuestions) * 100).toFixed(1) : '0.0'}%
                  </div>
                  <div className="text-sm text-muted-foreground">Tỷ lệ chính xác</div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {totalQuestions > 0 ? Math.round(timeSpent / totalQuestions) : 0}s
                  </div>
                  <div className="text-sm text-muted-foreground">Thời gian/câu</div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {totalQuestions}
                  </div>
                  <div className="text-sm text-muted-foreground">Tổng câu hỏi</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin bài thi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Nộp bài:</div>
                  <div className="text-muted-foreground">{formatDate(submittedAt)}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Target className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Điểm đạt được:</div>
                  <div className="text-muted-foreground">{result.score}/{result.maxScore}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Thời gian làm bài:</div>
                  <div className="text-muted-foreground">{formatTime(timeSpent)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Hành động</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full">
                <RotateCcw className="w-4 h-4 mr-2" />
                Làm lại bài thi
              </Button>

              <Button variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Tải kết quả
              </Button>

              <Button variant="outline" className="w-full">
                <Share2 className="w-4 h-4 mr-2" />
                Chia sẻ kết quả
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
