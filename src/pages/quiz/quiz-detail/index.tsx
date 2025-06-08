import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Play,
  Clock,
  Users,
  Award,
  ArrowLeft,
  Calendar,
  User,
  AlertTriangle,
  Info,
  FileText,
  Zap,
  TrendingUp,
  BarChart3,
  Eye,
  Share2
} from "lucide-react";
import { quizService, type PublicQuiz } from "@/services/quizService";
import "@/styles/quiz-shared.css";
import "./style.css";

// Demo quiz data for better showcase

export default function QuizDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const userId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

  const [quiz, setQuiz] = useState<PublicQuiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingQuiz, setStartingQuiz] = useState(false);

  // Load quiz details
  useEffect(() => {
    const loadQuizDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const response = await quizService.getQuizQuestions(id);

        if (response.status === 200 && response.data) {
          setQuiz(response.data);
        } else {
          throw new Error(response.message || 'Không thể tải thông tin bài thi');
        }
      } catch (err) {
        console.error('Error loading quiz details:', err);
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    loadQuizDetails();
  }, [id]);

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

  const isQuizAvailable = () => {
    if (!quiz) return false;
    const now = new Date();
    const startTime = new Date(quiz.startTime);
    const endTime = new Date(quiz.endTime);
    return now >= startTime && now <= endTime;
  };

  const getQuizStatus = () => {
    if (!quiz) return 'unknown';
    const now = new Date();
    const startTime = new Date(quiz.startTime);
    const endTime = new Date(quiz.endTime);

    if (now < startTime) return 'upcoming';
    if (now > endTime) return 'expired';
    return 'available';
  };


  const handleStartQuiz = async () => {
    if (!quiz || !isQuizAvailable() || !userId) return;

    try {
      setStartingQuiz(true);

      const examUserQuizzesResponse = await quizService.getExamUserQuizzes(
        '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        id!
      );

      if (examUserQuizzesResponse.status !== 200) {
        throw new Error(examUserQuizzesResponse.message || 'Không thể lấy bộ đề câu hỏi');
      }

      const submissionResponse = await quizService.createSubmission(
        '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        id!
      );

      if (submissionResponse.status !== 200) {
        throw new Error(submissionResponse.message || 'Không thể tạo bài nộp');
      }

      // Navigate to quiz taking page với dữ liệu cần thiết
      navigate(`/quiz/quiz-taking/${quiz.examQuizzesId}`, {
        state: {
          examUserQuizzesData: examUserQuizzesResponse.data,
          submissionData: { submissionId: submissionResponse.data }, // Wrap trong object
          quizInfo: quiz
        }
      });

    } catch (err) {
      console.error('Error starting quiz:', err);
      setError(err instanceof Error ? err.message : 'Không thể bắt đầu bài thi. Vui lòng thử lại.');
    } finally {
      setStartingQuiz(false);
    }
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
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3 mb-6" />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="text-center p-4 border rounded-lg">
                    <Skeleton className="w-6 h-6 mx-auto mb-2" />
                    <Skeleton className="h-6 w-16 mx-auto mb-1" />
                    <Skeleton className="h-4 w-20 mx-auto" />
                  </div>
                ))}
              </div>

              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !quiz) {
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
          <AlertDescription>{error || 'Không tìm thấy bài thi'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const available = isQuizAvailable();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      {/* Enhanced Header */}
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
        <div className="container mx-auto px-6 py-6 max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/quiz/quiz-list">
                <Button variant="ghost" size="sm" className="hover:bg-blue-50 dark:hover:bg-blue-900/20">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại danh sách
                </Button>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Chi tiết bài thi
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Xem thông tin và bắt đầu làm bài
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Share2 className="w-4 h-4 mr-2" />
                Chia sẻ
              </Button>
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Eye className="w-4 h-4 mr-2" />
                Xem trước
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 max-w-6xl">

        {/* Main Quiz Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Quiz Info */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      {quiz.code && (
                        <Badge variant="outline" className="font-mono text-sm">
                          {quiz.code}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-3 leading-tight">
                      {quiz.title}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span className="font-medium">{quiz.createdBy}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Tạo ngày {formatDate(quiz.createdAt).split(' ')[0]}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Enhanced Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {quiz.totalQuestions}
                        </div>
                        <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                          Câu hỏi
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500 rounded-lg">
                        <Award className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          100
                        </div>
                        <div className="text-sm text-purple-700 dark:text-purple-300 font-medium">
                          Điểm tối đa
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Time Information */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl p-6 mb-8 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    Thời gian thi
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-3 p-4 bg-white/80 dark:bg-gray-800/80 rounded-lg">
                      <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                        <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Bắt đầu</div>
                        <div className="font-bold text-gray-900 dark:text-white">{formatDate(quiz.startTime)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-white/80 dark:bg-gray-800/80 rounded-lg">
                      <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                        <Calendar className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Kết thúc</div>
                        <div className="font-bold text-gray-900 dark:text-white">{formatDate(quiz.endTime)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Action Button */}
                <Button
                  className={`w-full h-14 text-lg font-semibold transition-all duration-300 ${
                    available
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl hover:scale-[1.02]'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                  disabled={!available || startingQuiz}
                  onClick={handleStartQuiz}
                >
                  {startingQuiz ? (
                    <>
                      <Clock className="w-5 h-5 mr-3 animate-spin" />
                      Đang chuẩn bị bài thi...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-3" />
                      {available ? 'Bắt đầu làm bài thi' :
                       getQuizStatus() === 'upcoming' ? 'Chưa đến giờ thi' : 'Bài thi đã kết thúc'}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quiz Instructions */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-500" />
                  Hướng dẫn làm bài
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Đọc kỹ đề bài trước khi trả lời</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Mỗi câu hỏi chỉ có một đáp án đúng</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Không được sử dụng tài liệu tham khảo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Bài thi sẽ tự động nộp khi hết thời gian</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Có thể đánh dấu câu hỏi để xem lại</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Quiz Stats */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-500" />
                  Thống kê
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Tổng câu hỏi</span>
                    <span className="font-bold text-gray-900 dark:text-white">{quiz.totalQuestions}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Thời gian làm bài</span>
                    <span className="font-bold text-gray-900 dark:text-white">90 phút</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Điểm tối đa</span>
                    <span className="font-bold text-gray-900 dark:text-white">100 điểm</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Số lần làm</span>
                    <span className="font-bold text-gray-900 dark:text-white">1 lần</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-orange-500" />
                  Thao tác nhanh
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Xem đề thi mẫu
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Xem kết quả cũ
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Chia sẻ bài thi
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
