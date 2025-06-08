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
import { cn } from "@/lib/utils";
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
  FileText} from "lucide-react";
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
  const [, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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
  }, [currentPage, currentPageQuestions.length]);

  // Note: Removed auto-update of currentQuestionIndex when page changes
  // to prevent conflicts with manual question navigation

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


      // Auto-save to backend
      if (submissionId) {
        try {
          const submitData = {
            examQuizzSubmissionId: submissionId, // Sử dụng submissionId làm examQuizzSubmissionId
            questionId,
            answerId: newAnswers
          };


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

  // Navigate to question by index - CONSISTENT DELAY VERSION
  const goToQuestion = (questionIndex: number) => {
    const pageIndex = Math.floor(questionIndex / QUESTIONS_PER_PAGE);
    const questionIndexInPage = questionIndex % QUESTIONS_PER_PAGE;
    const NAVIGATION_DELAY = 250;

    // Update currentQuestionIndex immediately to fix map highlighting
    setCurrentQuestionIndex(questionIndex);
    
    // Helper function to scroll to question and add highlight
    const scrollToQuestionAndHighlight = (element: HTMLElement) => {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
      // Add highlight effect
      element.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2');
      }, 2000);
    };

    // If we need to change page, do it first
    if (pageIndex !== currentPage) {
      setCurrentPage(pageIndex);
    }

    // Use consistent delay for both same page and different page navigation
    setTimeout(() => {
      // Try to get element by ref first
      const questionElement = questionRefs.current[questionIndexInPage];

      if (questionElement) {
        scrollToQuestionAndHighlight(questionElement);
      } else {
        // Fallback: use querySelector with data attribute
        const fallbackElement = document.querySelector(`[data-question-index="${questionIndex}"]`) as HTMLElement;
        if (fallbackElement) {
          scrollToQuestionAndHighlight(fallbackElement);
        } else {
          // Final fallback: try again after a short delay for DOM update
          setTimeout(() => {
            const retryElement = questionRefs.current[questionIndexInPage] ||
                                document.querySelector(`[data-question-index="${questionIndex}"]`) as HTMLElement;
            if (retryElement) {
              scrollToQuestionAndHighlight(retryElement);
            }
          }, 100);
        }
      }
    }, NAVIGATION_DELAY);
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


      // Finish submission using the API
      const result = await quizService.finishSubmission(submissionId);

      if (result.status === 200) {

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
    // goToQuestion already handles setCurrentQuestionIndex
    goToQuestion(questionIndex);
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      <div className="flex relative">
        {/* Question Map Sidebar - Desktop */}
        <div className="hidden lg:block w-80 border-r bg-background sticky-sidebar transition-colors duration-200">
          <ScrollArea className="h-screen">
            <div className="p-4 space-y-4 flex flex-col h-full">
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
        <div className="flex-1">
          <div className="max-w-4xl mx-auto p-6">
            {/* Questions */}
            <div className="space-y-6">
            {currentPageQuestions.map((question, index) => {
              const globalIndex = currentPage * QUESTIONS_PER_PAGE + index;
              const isFlagged = flaggedQuestions.has(question.id);


              return (
                <Card
                  key={question.id}
                  className="transition-colors duration-200"
                  ref={el => {
                    questionRefs.current[index] = el;
                  }}
                  id={`question-${question.id}`}
                  data-question-index={globalIndex}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="px-3 py-1">
                          #{globalIndex + 1}
                        </Badge>
                        <div>
                          <CardTitle className="text-lg">Câu {globalIndex + 1}</CardTitle>
                          <Badge variant="secondary" className="mt-1">
                            {question.type === 'singleChoice' ? (
                              <>
                                <FileText className="w-3 h-3 mr-1" />
                                Một đáp án
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Nhiều đáp án
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleFlag(question.id)}
                        className={cn(
                          "h-9 w-9 p-0",
                          isFlagged && "bg-yellow-100 text-yellow-600 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400"
                        )}
                        title={isFlagged ? "Bỏ đánh dấu cờ" : "Đánh dấu cờ để xem lại"}
                      >
                        <Flag className={cn("h-4 w-4", isFlagged && "fill-current")} />
                      </Button>
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 pt-6 border-t">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newPage = Math.max(0, currentPage - 1);
                      setCurrentPage(newPage);
                      setCurrentQuestionIndex(newPage * QUESTIONS_PER_PAGE);
                      // Scroll to first question of new page
                      setTimeout(() => {
                        const firstQuestionIndex = newPage * QUESTIONS_PER_PAGE;
                        const firstQuestionElement = questionRefs.current[firstQuestionIndex % QUESTIONS_PER_PAGE];
                        if (firstQuestionElement) {
                          firstQuestionElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start',
                            inline: 'nearest'
                          });
                        } else {
                          // Fallback to top of page
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }, 150);
                    }}
                    disabled={currentPage === 0}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Trang trước
                  </Button>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Trang {currentPage + 1} / {totalPages}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({currentPage * QUESTIONS_PER_PAGE + 1}-{Math.min((currentPage + 1) * QUESTIONS_PER_PAGE, questions.length)} / {questions.length} câu)
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => {
                      const newPage = Math.min(totalPages - 1, currentPage + 1);
                      setCurrentPage(newPage);
                      setCurrentQuestionIndex(newPage * QUESTIONS_PER_PAGE);
                      // Scroll to first question of new page
                      setTimeout(() => {
                        const firstQuestionIndex = newPage * QUESTIONS_PER_PAGE;
                        const firstQuestionElement = questionRefs.current[firstQuestionIndex % QUESTIONS_PER_PAGE];
                        if (firstQuestionElement) {
                          firstQuestionElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start',
                            inline: 'nearest'
                          });
                        } else {
                          // Fallback to top of page
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }, 150);
                    }}
                    disabled={currentPage === totalPages - 1}
                  >
                    Trang sau
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
