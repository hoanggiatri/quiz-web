import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Award,
  CheckCircle,
  XCircle,
  ArrowLeft,
  RotateCcw,
  Clock,
  Target
} from "lucide-react";
import "@/styles/quiz-shared.css";
import "./style.css";

// Demo result data
const DEMO_RESULT = {
  submissionId: 'demo-submission-1',
  examQuizzesId: 'demo-quiz-1',
  userId: 'demo-user',
  score: 8, // Score out of 10
  maxScore: 10,
  percentage: 80,
  correctAnswers: 16,
  totalQuestions: 20,
  timeSpent: 3240, // 54 minutes
  submittedAt: new Date().toISOString(),
  gradedAt: new Date().toISOString()
};

export default function QuizResultDemoPage() {
  const location = useLocation();
  const [result, setResult] = useState(DEMO_RESULT);

  // Use result from location state if available, otherwise use demo data
  useEffect(() => {
    if (location.state?.result) {
      setResult(location.state.result);
    }
  }, [location.state]);

  // Calculate stats
  const correctAnswers = result.correctAnswers ?? 0;
  const totalQuestions = result.totalQuestions ?? 0;
  const wrongAnswers = totalQuestions - correctAnswers;
  const unansweredQuestions = 0; // For demo, assume all questions were answered

  // Calculate score on scale of 10
  const scoreOutOf10 = result.score ?? 0;

  // Format time spent
  const formatTimeSpent = (seconds: number) => {
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

  // Get performance message
  const getPerformanceMessage = (score: number) => {
    if (score >= 9) return { message: "Xuất sắc!", color: "text-green-600", icon: "🏆" };
    if (score >= 8) return { message: "Rất tốt!", color: "text-green-600", icon: "🌟" };
    if (score >= 7) return { message: "Tốt!", color: "text-blue-600", icon: "👍" };
    if (score >= 6) return { message: "Khá!", color: "text-yellow-600", icon: "👌" };
    if (score >= 5) return { message: "Trung bình!", color: "text-orange-600", icon: "📚" };
    return { message: "Cần cố gắng thêm!", color: "text-red-600", icon: "💪" };
  };

  const performance = getPerformanceMessage(scoreOutOf10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-green-900 dark:to-emerald-900">
      {/* Enhanced Header */}
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
        <div className="container mx-auto px-6 py-6 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/quiz/quiz-list">
                <Button variant="ghost" size="sm" className="hover:bg-green-50 dark:hover:bg-green-900/20">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại danh sách
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Kết quả bài thi Demo
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Xem chi tiết kết quả và phân tích
                </p>
              </div>
            </div>

            {/* Demo Badge */}
            <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
              🎯 Demo Mode
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Result Card */}
        <Card className="shadow-xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full mb-4 mx-auto">
              <Award className="w-10 h-10 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Kết quả bài thi
            </CardTitle>
            <div className={`text-lg font-medium ${performance.color}`}>
              {performance.icon} {performance.message}
            </div>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            {/* Score Display */}
            <div className="text-center mb-8">
              <div className="text-7xl font-bold text-green-600 mb-2">
                {scoreOutOf10}/10
              </div>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Điểm số ({result.percentage}%)
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Correct Answers */}
              <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500 rounded-lg mb-3">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {correctAnswers}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300 font-medium">
                  Câu đúng
                </div>
              </div>

              {/* Wrong Answers */}
              <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-red-500 rounded-lg mb-3">
                  <XCircle className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-red-600 mb-1">
                  {wrongAnswers}
                </div>
                <div className="text-sm text-red-700 dark:text-red-300 font-medium">
                  Câu sai
                </div>
              </div>

              {/* Time Spent */}
              <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500 rounded-lg mb-3">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {formatTimeSpent(result.timeSpent)}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                  Thời gian
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                Tóm tắt kết quả
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Tổng câu hỏi:</span>
                  <div className="font-bold text-gray-900 dark:text-white">{totalQuestions}</div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Đã trả lời:</span>
                  <div className="font-bold text-gray-900 dark:text-white">{totalQuestions - unansweredQuestions}</div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Tỷ lệ đúng:</span>
                  <div className="font-bold text-green-600">{Math.round((correctAnswers / totalQuestions) * 100)}%</div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Điểm số:</span>
                  <div className="font-bold text-blue-600">{scoreOutOf10}/10</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/quiz/quiz-list" className="flex-1">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại danh sách
                </Button>
              </Link>

              <Link to="/quiz/quiz-taking-demo" className="flex-1">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Làm lại bài thi Demo
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Tips Card */}
        <Card className="mt-6 shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              💡 Gợi ý cải thiện
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              {scoreOutOf10 >= 8 ? (
                <>
                  <p>🎉 Chúc mừng! Bạn đã đạt kết quả xuất sắc!</p>
                  <p>📚 Hãy tiếp tục duy trì phong độ học tập tốt này.</p>
                  <p>🎯 Thử thách bản thân với những bài thi khó hơn.</p>
                </>
              ) : scoreOutOf10 >= 6 ? (
                <>
                  <p>👍 Kết quả khá tốt! Bạn đã nắm vững phần lớn kiến thức.</p>
                  <p>📖 Ôn tập lại những phần còn yếu để cải thiện điểm số.</p>
                  <p>⏰ Quản lý thời gian tốt hơn trong lần thi tiếp theo.</p>
                </>
              ) : (
                <>
                  <p>💪 Đừng nản lòng! Mỗi lần thi là một cơ hội học hỏi.</p>
                  <p>📚 Dành thêm thời gian ôn tập các kiến thức cơ bản.</p>
                  <p>🤝 Tham gia nhóm học tập hoặc tìm kiếm sự hỗ trợ từ giáo viên.</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
