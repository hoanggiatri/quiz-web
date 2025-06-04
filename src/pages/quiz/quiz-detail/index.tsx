import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  CheckCircle,
  XCircle
} from "lucide-react";
import { quizService, type PublicQuiz } from "@/services/quizService";
import { useUserContext } from "@/contexts/UserContext";
import "@/styles/quiz.css";

export default function QuizDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const  userId  = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

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

  const getStatusInfo = () => {
    const status = getQuizStatus();

    switch (status) {
      case 'upcoming':
        return {
          icon: <Clock className="w-5 h-5 text-blue-500" />,
          text: 'Sắp diễn ra',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 border-blue-200'
        };
      case 'expired':
        return {
          icon: <XCircle className="w-5 h-5 text-red-500" />,
          text: 'Đã kết thúc',
          color: 'text-red-600',
          bgColor: 'bg-red-50 border-red-200'
        };
      case 'available':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          text: 'Đang mở',
          color: 'text-green-600',
          bgColor: 'bg-green-50 border-green-200'
        };
      default:
        return {
          icon: <AlertTriangle className="w-5 h-5 text-gray-500" />,
          text: 'Không xác định',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50 border-gray-200'
        };
    }
  };

  const handleStartQuiz = async () => {
    if (!quiz || !isQuizAvailable() || !userId) return;

    try {
      setStartingQuiz(true);

      // Bước 1: Lấy bộ đề câu hỏi cho user
      console.log('Fetching exam user quizzes...');
      const examUserQuizzesResponse = await quizService.getExamUserQuizzes(
        '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        id
      );

      if (examUserQuizzesResponse.status !== 200) {
        throw new Error(examUserQuizzesResponse.message || 'Không thể lấy bộ đề câu hỏi');
      }

      // Bước 2: Tạo submission cho user
      console.log('Creating submission...');
      const submissionResponse = await quizService.createSubmission(
        '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        id
      );

      if (submissionResponse.status !== 200) {
        throw new Error(submissionResponse.message || 'Không thể tạo bài nộp');
      }

      console.log('Quiz started successfully:', {
        examUserQuizzesId: examUserQuizzesResponse.data.examUserQuizzesId,
        submissionId: submissionResponse.data, // data là string submissionId
        totalQuestions: examUserQuizzesResponse.data.questions.length
      });

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

  const statusInfo = getStatusInfo();
  const available = isQuizAvailable();

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

      {/* Status Alert */}
      <div className={`border rounded-lg p-4 mb-6 ${statusInfo.bgColor}`}>
        <div className="flex items-center gap-3">
          {statusInfo.icon}
          <div>
            <div className={`font-medium ${statusInfo.color}`}>
              Trạng thái: {statusInfo.text}
            </div>
            <div className="text-sm text-muted-foreground">
              {getQuizStatus() === 'upcoming' && `Bắt đầu: ${formatDate(quiz.startTime)}`}
              {getQuizStatus() === 'available' && `Kết thúc: ${formatDate(quiz.endTime)}`}
              {getQuizStatus() === 'expired' && `Đã kết thúc: ${formatDate(quiz.endTime)}`}
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <BookOpen className="w-6 h-6" />
            {quiz.title}
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {quiz.createdBy}
            </div>
            {quiz.code && (
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                Mã: {quiz.code}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 border rounded-lg">
              <Users className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <div className="font-semibold">{quiz.totalQuestions}</div>
              <div className="text-sm text-muted-foreground">Câu hỏi</div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <Calendar className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <div className="font-semibold">{formatDate(quiz.startTime).split(' ')[0]}</div>
              <div className="text-sm text-muted-foreground">Ngày bắt đầu</div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <Calendar className="w-6 h-6 mx-auto mb-2 text-purple-500" />
              <div className="font-semibold">{formatDate(quiz.endTime).split(' ')[0]}</div>
              <div className="text-sm text-muted-foreground">Ngày kết thúc</div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <Award className="w-6 h-6 mx-auto mb-2 text-orange-500" />
              <div className="font-semibold">100</div>
              <div className="text-sm text-muted-foreground">Điểm tối đa</div>
            </div>
          </div>

          {/* Time Information */}
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <h3 className="font-medium mb-3">Thời gian thi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Bắt đầu:</span>
                <div className="font-medium">{formatDate(quiz.startTime)}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Kết thúc:</span>
                <div className="font-medium">{formatDate(quiz.endTime)}</div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <Button
            className="w-full"
            disabled={!available || startingQuiz}
            onClick={handleStartQuiz}
          >
            {startingQuiz ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Đang chuẩn bị...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                {available ? 'Bắt đầu làm bài' :
                 getQuizStatus() === 'upcoming' ? 'Chưa đến giờ thi' : 'Bài thi đã kết thúc'}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
