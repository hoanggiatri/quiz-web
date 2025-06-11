import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Award,
  CheckCircle,
  XCircle,
  ArrowLeft,
  RotateCcw,
  AlertTriangle
} from "lucide-react";
import { quizSubmissionService, type QuizResult } from "@/services/quizSubmissionService";
import "@/styles/quiz-shared.css";
import "./style.css";

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

  // No data state
  if (!result) {
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

        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <FileText className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Không có kết quả</h2>
          <p className="text-muted-foreground mb-4">
            Chưa có kết quả bài thi để hiển thị.
          </p>
          <Link to="/quiz/quiz-list">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại danh sách
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate simple stats
  const correctAnswers = result.correctAnswers ?? 0;
  const totalQuestions = result.totalQuestions ?? 0;
  const wrongAnswers = totalQuestions - correctAnswers;

  // Calculate score on scale of 10
  const scoreOutOf10 = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 10) : 0;

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
                  Kết quả bài thi
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Xem chi tiết kết quả và phân tích
                </p>
              </div>
            </div>


          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Simple Result Card */}
        <Card className="shadow-xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4 mx-auto">
              <Award className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Kết quả bài thi
            </CardTitle>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            {/* Score Display */}
            <div className="text-center mb-8">
              <div className="text-6xl font-bold text-green-600 mb-2">
                {scoreOutOf10}/10
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Điểm số
              </p>
            </div>

            {/* Simple Stats Grid */}
            <div className="grid grid-cols-2 gap-6">
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

            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Link to="/quiz/quiz-list" className="flex-1">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại danh sách
                </Button>
              </Link>

              <Button variant="outline" className="flex-1">
                <RotateCcw className="w-4 h-4 mr-2" />
                Làm lại bài thi
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
