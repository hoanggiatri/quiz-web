import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { QuestionMap } from "@/components/quiz/QuestionMap/QuestionMap";
import type { QuestionStatus } from "@/types/quiz";
import "@/styles/quiz-shared.css";
import "./style.css";

import {
  Clock,
  Flag,
  CheckCircle,
  AlertTriangle,
  Send,
  ChevronLeft,
  ChevronRight,
  X} from "lucide-react";
import { quizService } from "@/services/quizService";
import { quizSubmissionService } from "@/services/quizSubmissionService";
import type {
  ExamUserQuizzesData,
  ExamUserQuizzesQuestion} from "@/types/quiz";
import type { PublicQuiz } from "@/services/quizService";

// Constants
const QUESTIONS_PER_PAGE = 10;

export default function QuizTakingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Get data from navigation state
  const examUserQuizzesData = location.state?.examUserQuizzesData as ExamUserQuizzesData;
  const submissionData = location.state?.submissionData;
  const quizInfo = location.state?.quizInfo as PublicQuiz;

  // State management
  const [quiz, setQuiz] = useState<PublicQuiz | null>(quizInfo || null);
  const [questions, setQuestions] = useState<ExamUserQuizzesQuestion[]>(examUserQuizzesData?.questions || []);
  const [currentPage, setCurrentPage] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string[]>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState<number>(3600); // Default 1 hour
  const [submissionId, setSubmissionId] = useState<string>(submissionData?.submissionId || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showQuestionMap, setShowQuestionMap] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Pagination calculations
  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);
  const currentPageQuestions = questions.slice(
    currentPage * QUESTIONS_PER_PAGE,
    (currentPage + 1) * QUESTIONS_PER_PAGE
  );

  // Initialize refs array when page changes
  useEffect(() => {
    questionRefs.current = new Array(currentPageQuestions.length).fill(null);
    console.log('Refs initialized for page:', currentPage, 'length:', currentPageQuestions.length);
  }, [currentPage, currentPageQuestions.length]);

  // Update currentQuestionIndex when page changes
  useEffect(() => {
    setCurrentQuestionIndex(currentPage * QUESTIONS_PER_PAGE);
  }, [currentPage]);

  // Initialize quiz session
  useEffect(() => {
    const initializeQuiz = async () => {
      // Check if we have data from navigation state
      if (!examUserQuizzesData || !submissionData || !quizInfo) {
        setError('Dữ liệu bài thi không hợp lệ. Vui lòng quay lại và thử lại.');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Set quiz data from navigation state
        setQuiz(quizInfo);
        setQuestions(examUserQuizzesData.questions);
        setSubmissionId(submissionData.submissionId);

        // Calculate time remaining based on quiz end time
        const now = new Date();
        const endTime = new Date(quizInfo.endTime);
        const remainingSeconds = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000));
        setTimeRemaining(remainingSeconds);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi khởi tạo bài thi');
      } finally {
        setLoading(false);
      }
    };

    initializeQuiz();
  }, [examUserQuizzesData, submissionData, quizInfo]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Auto submit when time runs out
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Handle answer selection
  const handleAnswerSelect = async (questionId: string, answerId: string, isMultiple: boolean = false) => {
    try {
      setSaving(true);

      let newAnswers: string[];

      if (isMultiple) {
        // Multiple choice - toggle answer
        const currentAnswers = userAnswers[questionId] || [];
        if (currentAnswers.includes(answerId)) {
          newAnswers = currentAnswers.filter((id: string) => id !== answerId);
        } else {
          newAnswers = [...currentAnswers, answerId];
        }
      } else {
        // Single choice - replace answer
        newAnswers = [answerId];
      }

      // Update local state first
      setUserAnswers(prev => ({
        ...prev,
        [questionId]: newAnswers
      }));

      console.log('Answer selected:', { questionId, answerId, newAnswers });

      // Auto-save to backend
      if (submissionId) {
        try {
          const submitData = {
            examQuizzSubmissionId: submissionId, // Sử dụng submissionId làm examQuizzSubmissionId
            questionId,
            answerId: newAnswers
          };

          console.log('Auto-saving answer:', submitData);

          const response = await quizService.submitSingleAnswer(submitData);

          if (response.status === 200) {
            console.log('Answer auto-saved successfully:', response);
          } else {
            console.warn('Auto-save failed:', response.message);
            // Don't revert local state for auto-save failures
          }
        } catch (autoSaveError) {
          console.error('Auto-save error:', autoSaveError);
          // Don't revert local state for auto-save failures
          // User can still continue and submit manually later
        }
      }

    } catch (err) {
      console.error('Error handling answer selection:', err);
      // Revert local state on error
      setUserAnswers(prev => {
        const newState = { ...prev };
        delete newState[questionId];
        return newState;
      });
    } finally {
      setSaving(false);
    }
  };

  // Toggle question flag
  const handleToggleFlag = (questionId: string) => {
    setFlaggedQuestions(prev => {
      const newFlagged = new Set(prev);

      if (newFlagged.has(questionId)) {
        newFlagged.delete(questionId);
      } else {
        newFlagged.add(questionId);
      }

      return newFlagged;
    });

    // Optional: Save to backend
    try {
      quizSubmissionService.toggleQuestionFlag(
        submissionId,
        questionId,
        !flaggedQuestions.has(questionId)
      );
    } catch (err) {
      console.error('Error saving flag to backend:', err);
    }
  };

  // Navigate to question by index - IMPROVED VERSION
  const goToQuestion = (questionIndex: number) => {
    const pageIndex = Math.floor(questionIndex / QUESTIONS_PER_PAGE);
    const questionIndexInPage = questionIndex % QUESTIONS_PER_PAGE;

    console.log('goToQuestion:', { questionIndex, pageIndex, questionIndexInPage, currentPage });

    // Close mobile question map
    setShowQuestionMap(false);

    // If we're already on the right page, just scroll
    if (pageIndex === currentPage) {
      setTimeout(() => {
        const questionElement = questionRefs.current[questionIndexInPage];
        console.log('Same page - questionElement:', questionElement);
        if (questionElement) {
          questionElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
          // Add highlight effect
          questionElement.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.5)';
          questionElement.style.transition = 'box-shadow 0.3s ease';
          setTimeout(() => {
            questionElement.style.boxShadow = '';
          }, 2000);
        } else {
          // Fallback for same page: use querySelector with data attribute
          const fallbackElement = document.querySelector(`[data-question-index="${questionIndex}"]`) as HTMLElement;
          console.log('Same page fallback element:', fallbackElement);
          if (fallbackElement) {
            fallbackElement.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
              inline: 'nearest'
            });
            fallbackElement.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.5)';
            fallbackElement.style.transition = 'box-shadow 0.3s ease';
            setTimeout(() => {
              fallbackElement.style.boxShadow = '';
            }, 2000);
          }
        }
      }, 100);
    } else {
      // Change page first, then scroll
      setCurrentPage(pageIndex);

      // Wait for page change and DOM update, then scroll
      setTimeout(() => {
        const questionElement = questionRefs.current[questionIndexInPage];
        console.log('Different page - questionElement:', questionElement, 'refs:', questionRefs.current);
        if (questionElement) {
          questionElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
          // Add highlight effect
          questionElement.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.5)';
          questionElement.style.transition = 'box-shadow 0.3s ease';
          setTimeout(() => {
            questionElement.style.boxShadow = '';
          }, 2000);
        } else {
          // Fallback: try again after a longer delay
          setTimeout(() => {
            const retryElement = questionRefs.current[questionIndexInPage];
            console.log('Retry - questionElement:', retryElement);
            if (retryElement) {
              retryElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
              });
              retryElement.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.5)';
              retryElement.style.transition = 'box-shadow 0.3s ease';
              setTimeout(() => {
                retryElement.style.boxShadow = '';
              }, 2000);
            } else {
              // Final fallback: use querySelector with data attribute
              const fallbackElement = document.querySelector(`[data-question-index="${questionIndex}"]`) as HTMLElement;
              console.log('Fallback element:', fallbackElement);
              if (fallbackElement) {
                fallbackElement.scrollIntoView({
                  behavior: 'smooth',
                  block: 'center',
                  inline: 'nearest'
                });
                fallbackElement.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.5)';
                fallbackElement.style.transition = 'box-shadow 0.3s ease';
                setTimeout(() => {
                  fallbackElement.style.boxShadow = '';
                }, 2000);
              }
            }
          }, 500);
        }
      }, 300);
    }
  };



  // Submit quiz
  const handleSubmitQuiz = async () => {
    if (submitting) return;

    const confirmed = window.confirm(
      'Bạn có chắc chắn muốn nộp bài? Sau khi nộp bài, bạn không thể thay đổi câu trả lời.'
    );

    if (!confirmed) return;

    try {
      setSubmitting(true);

      console.log('Finishing submission:', {
        submissionId,
        totalAnsweredQuestions: Object.keys(userAnswers).length,
        totalQuestions: questions.length
      });

      // Finish submission using the API
      const result = await quizService.finishSubmission(submissionId);

      if (result.status === 200) {
        console.log('Quiz submitted successfully:', result);

        // Create QuizResult object from API response
        const apiData = result.data;
        const totalAnsweredQuestions = Object.keys(userAnswers).length;
        const scorePercentage = apiData.score * 100; // API trả về score dạng decimal (0.91 = 91%)

        const quizResult = {
          submissionId,
          examQuizzesId: quizInfo?.examQuizzesId || '',
          userId: submissionData?.userId || '',
          score: Math.round(scorePercentage), // Convert to percentage
          maxScore: 100,
          percentage: scorePercentage,
          correctAnswers: apiData.correct,
          totalQuestions: apiData.total,
          timeSpent: 3600 - timeRemaining, // Calculate time spent
          submittedAt: new Date().toISOString(),
          gradedAt: new Date().toISOString(),
          answers: Object.entries(userAnswers).map(([questionId, selectedAnswers]) => ({
            questionId,
            selectedAnswers,
            correctAnswers: [], // Would need additional API to get correct answers
            isCorrect: true, // Would be calculated by backend
            points: 10 // Would come from backend
          }))
        };

        console.log('Created quiz result:', quizResult);

        // Navigate to result page
        navigate(`/quiz/quiz-result/${submissionId}`, {
          state: {
            result: quizResult,
            submissionId,
            quizInfo,
            userAnswers,
            totalQuestions: apiData.total,
            totalAnsweredQuestions,
            apiResponse: result.data // Pass original API response for debugging
          }
        });
      } else {
        throw new Error(result.message || 'Không thể nộp bài');
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi nộp bài');
    } finally {
      setSubmitting(false);
    }
  };



  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Clock className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
            <h2 className="text-xl font-semibold mb-2">Đang chuẩn bị bài thi...</h2>
            <p className="text-muted-foreground">Vui lòng đợi trong giây lát</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !quiz || questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error || 'Không thể tải bài thi. Vui lòng thử lại sau.'}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => navigate('/quiz/quiz-list')}>
            Quay lại danh sách bài thi
          </Button>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(userAnswers).filter(qId => userAnswers[qId].length > 0).length;

  // Create QuestionStatus array for QuestionMap component
  const questionStatuses: QuestionStatus[] = questions.map((question, index) => ({
    id: question.id,
    isAnswered: userAnswers[question.id] && userAnswers[question.id].length > 0,
    isFlagged: flaggedQuestions.has(question.id),
    isActive: index === currentQuestionIndex
  }));

  // Handle question navigation from QuestionMap
  const handleQuestionMapClick = (questionIndex: number) => {
    setCurrentQuestionIndex(questionIndex);
    goToQuestion(questionIndex);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">

      {/* Main Content */}
      <div className="flex relative">
        {/* Question Map Sidebar - Desktop */}
        <div className="hidden lg:block w-80 border-r bg-card sticky-sidebar">
          <ScrollArea className="h-full">
            <div className="p-6 space-y-6">
              {/* QuestionMap Component */}
              <QuestionMap
                questions={questionStatuses}
                onQuestionClick={handleQuestionMapClick}
                currentQuestionIndex={currentQuestionIndex}
              />

              <Separator />

              {/* Progress */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Tiến độ</span>
                  <span>{Math.round((answeredCount / questions.length) * 100)}%</span>
                </div>
                <Progress value={(answeredCount / questions.length) * 100} className="h-2" />
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="w-full"
                size="lg"
              >
                {submitting ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Đang nộp bài...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Nộp bài ({answeredCount}/{questions.length})
                  </>
                )}
              </Button>
            </div>
          </ScrollArea>
        </div>

        {/* Questions Content Area */}
        <div className="flex-1 max-w-5xl mx-auto p-8">
          {/* Mobile Question Map */}
          {showQuestionMap && (
            <Card className="mb-6 lg:hidden">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Bản đồ câu hỏi</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowQuestionMap(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <QuestionMap
                  questions={questionStatuses}
                  onQuestionClick={handleQuestionMapClick}
                  currentQuestionIndex={currentQuestionIndex}
                  className="border-0 shadow-none p-0"
                />
              </CardContent>
            </Card>
          )}

          {/* Questions List */}
          <div className="space-y-6">
            {currentPageQuestions.map((question, pageIndex) => {
              const questionIndex = currentPage * QUESTIONS_PER_PAGE + pageIndex;
              const hasAnswer = userAnswers[question.id] && userAnswers[question.id].length > 0;
              const isFlagged = flaggedQuestions.has(question.id);

              return (
                <Card
                  key={question.id}
                  ref={(el) => {
                    questionRefs.current[pageIndex] = el;
                    console.log(`Ref set for question ${pageIndex}:`, el);
                  }}
                  className={`transition-all duration-200 hover:shadow-md ${
                    hasAnswer ? 'border-green-200 bg-green-50/30 dark:border-green-800 dark:bg-green-900/10' : ''
                  } ${
                    isFlagged ? 'border-yellow-200 bg-yellow-50/30 dark:border-yellow-800 dark:bg-yellow-900/10' : ''
                  }`}
                  data-question-index={questionIndex}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                        Câu {questionIndex + 1}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {saving && (
                          <Badge variant="outline" className="text-blue-600 border-blue-200">
                            <Clock className="w-3 h-3 mr-1 animate-spin" />
                            Đang lưu...
                          </Badge>
                        )}
                        {hasAnswer && (
                          <Badge className="bg-green-600 hover:bg-green-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Đã trả lời
                          </Badge>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleFlag(question.id)}
                          className={`transition-all ${
                            isFlagged
                              ? 'border-yellow-400 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:border-yellow-600 dark:text-yellow-400'
                              : 'hover:border-yellow-400 hover:text-yellow-600'
                          }`}
                          title={isFlagged ? 'Bỏ đánh dấu' : 'Đánh dấu câu hỏi'}
                        >
                          <Flag className={`w-4 h-4 ${isFlagged ? 'fill-current' : ''}`} />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Question Content */}
                    <div className="mb-6">
                      <p className="text-lg leading-relaxed text-gray-900 dark:text-gray-100 mb-4">
                        {question.content}
                      </p>
                      {question.media_url && (
                        <img
                          src={question.media_url}
                          alt="Question image"
                          className="max-w-full h-auto rounded-lg border shadow-sm"
                        />
                      )}
                    </div>

                    {/* Answer Options */}
                    <div className="space-y-3">
                      {question.answers && question.answers.length > 0 ? (
                        question.type === 'multipleChoice' ? (
                          // Multiple Choice
                          <div className="space-y-3">
                            {question.answers.map((answer, answerIndex) => {
                              const isChecked = userAnswers[question.id]?.includes(answer.id) || false;
                              const answerLabel = String.fromCharCode(65 + answerIndex);
                              return (
                                <div key={answer.id} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                                  <Checkbox
                                    id={answer.id}
                                    checked={isChecked}
                                    onCheckedChange={() => {
                                      handleAnswerSelect(question.id, answer.id, true);
                                    }}
                                  />
                                  <Label
                                    htmlFor={answer.id}
                                    className="flex-1 cursor-pointer flex items-center gap-3"
                                  >
                                    <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center text-xs">
                                      {answerLabel}
                                    </Badge>
                                    <span>{answer.content}</span>
                                  </Label>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          // Single Choice
                          <RadioGroup
                            value={userAnswers[question.id]?.[0] || ""}
                            onValueChange={(value) => handleAnswerSelect(question.id, value, false)}
                          >
                            {question.answers.map((answer, answerIndex) => {
                              const answerLabel = String.fromCharCode(65 + answerIndex);
                              return (
                                <div key={answer.id} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                                  <RadioGroupItem value={answer.id} id={answer.id} />
                                  <Label
                                    htmlFor={answer.id}
                                    className="flex-1 cursor-pointer flex items-center gap-3"
                                  >
                                    <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center text-xs">
                                      {answerLabel}
                                    </Badge>
                                    <span>{answer.content}</span>
                                  </Label>
                                </div>
                              );
                            })}
                          </RadioGroup>
                        )
                      ) : (
                        // No answers
                        <div className="text-center py-8 text-muted-foreground">
                          <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>Không có câu trả lời cho câu hỏi này</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Bottom Navigation */}
          <div className="mt-8 p-4 bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Trang trước
              </Button>

              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i;
                  } else if (currentPage < 3) {
                    pageNum = i;
                  } else if (currentPage > totalPages - 4) {
                    pageNum = totalPages - 5 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-10 h-10"
                    >
                      {pageNum + 1}
                    </Button>
                  );
                })}
                {totalPages > 5 && currentPage < totalPages - 3 && (
                  <>
                    <span className="text-gray-400">...</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages - 1)}
                      className="w-10 h-10"
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>

              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                className="flex items-center gap-2"
              >
                Trang sau
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Page Summary */}
            <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
              Hiển thị câu {currentPage * QUESTIONS_PER_PAGE + 1} - {Math.min((currentPage + 1) * QUESTIONS_PER_PAGE, questions.length)}
              trong tổng số {questions.length} câu hỏi
            </div>
          </div>
        </div>
      </div>

      {/* Submit Warning */}
      {timeRemaining <= 300 && timeRemaining > 0 && (
        <Alert variant="destructive" className="mt-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Chỉ còn {Math.floor(timeRemaining / 60)} phút {timeRemaining % 60} giây!
            Bài thi sẽ tự động nộp khi hết thời gian.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
