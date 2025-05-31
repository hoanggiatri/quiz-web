import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import "@/styles/quiz.css";

import {
  Clock,
  Flag,
  CheckCircle,
  AlertTriangle,
  Send,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  X
} from "lucide-react";
import { quizService, type Question, type Answer } from "@/services/quizService";
import { quizSubmissionService } from "@/services/quizSubmissionService";

// Constants
const QUESTIONS_PER_PAGE = 10;

export default function QuizTakingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // State management
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, Answer[]>>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string[]>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [sessionId, setSessionId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [loadingAnswers, setLoadingAnswers] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showQuestionMap, setShowQuestionMap] = useState(false);

  // Pagination calculations
  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);
  const currentPageQuestions = questions.slice(
    currentPage * QUESTIONS_PER_PAGE,
    (currentPage + 1) * QUESTIONS_PER_PAGE
  );

  // Reset refs when page changes
  useEffect(() => {
    questionRefs.current = [];
  }, [currentPage]);

  // Load answers for questions
  const loadAnswersForQuestions = async (questions: Question[]) => {
    try {
      const answersMap: Record<string, Answer[]> = {};

      // Load answers for each question
      for (const question of questions) {
        setLoadingAnswers(prev => ({ ...prev, [question.id]: true }));

        try {
          const answerResponse = await quizService.getQuestionAnswers(question.id);
          if (answerResponse.status === 200 && answerResponse.data) {
            answersMap[question.id] = answerResponse.data;
          }
        } catch (err) {
          console.error(`Error loading answers for question ${question.id}:`, err);
          // Continue loading other questions even if one fails
        } finally {
          setLoadingAnswers(prev => ({ ...prev, [question.id]: false }));
        }
      }

      setQuestionAnswers(answersMap);
    } catch (err) {
      console.error('Error loading question answers:', err);
    }
  };

  // Initialize quiz session
  useEffect(() => {
    const initializeQuiz = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        // Get quiz questions
        const quizResponse = await quizService.getQuizQuestions(id);
        if (quizResponse.status !== 200 || !quizResponse.data) {
          throw new Error(quizResponse.message || 'Không thể tải câu hỏi');
        }

        const quizData = quizResponse.data;
        setQuiz(quizData);

        if (quizData.questions && quizData.questions.length > 0) {
          setQuestions(quizData.questions);

          // Load answers for all questions
          await loadAnswersForQuestions(quizData.questions);

          // Start quiz session (mock for now)
          const startResponse = await quizSubmissionService.mockStartQuiz(id);
          if (startResponse.status === 200) {
            setSessionId(startResponse.data.sessionId);
            setTimeRemaining(startResponse.data.timeLimit);
          }
        } else {
          throw new Error('Bài thi không có câu hỏi');
        }
      } catch (err) {
        console.error('Error initializing quiz:', err);
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi khởi tạo bài thi');
      } finally {
        setLoading(false);
      }
    };

    initializeQuiz();
  }, [id]);

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

  // Format time display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Get time color based on remaining time
  const getTimeColor = () => {
    if (timeRemaining <= 300) return 'text-red-600'; // Last 5 minutes
    if (timeRemaining <= 900) return 'text-orange-600'; // Last 15 minutes
    return 'text-green-600';
  };

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

      // Update local state
      setUserAnswers(prev => ({
        ...prev,
        [questionId]: newAnswers
      }));

      // Save to backend (mock for now)
      await quizSubmissionService.mockSaveAnswer({
        sessionId,
        questionId,
        selectedAnswers: newAnswers
      });
    } catch (err) {
      console.error('Error saving answer:', err);
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
    console.log(`Toggling flag for question ${questionId}`);
    console.log('Current flagged questions:', Array.from(flaggedQuestions));

    setFlaggedQuestions(prev => {
      const newFlagged = new Set(prev);

      if (newFlagged.has(questionId)) {
        newFlagged.delete(questionId);
        console.log(`Removed flag from question ${questionId}`);
      } else {
        newFlagged.add(questionId);
        console.log(`Added flag to question ${questionId}`);
      }

      console.log('New flagged questions:', Array.from(newFlagged));
      return newFlagged;
    });

    // Optional: Save to backend
    try {
      quizSubmissionService.toggleQuestionFlag(
        sessionId,
        questionId,
        !flaggedQuestions.has(questionId)
      );
    } catch (err) {
      console.error('Error saving flag to backend:', err);
    }
  };

  // Navigate to question by index
  const goToQuestion = (questionIndex: number) => {
    const pageIndex = Math.floor(questionIndex / QUESTIONS_PER_PAGE);
    const questionIndexInPage = questionIndex % QUESTIONS_PER_PAGE;

    console.log(`Navigating to question ${questionIndex + 1}, page ${pageIndex + 1}, position ${questionIndexInPage}`);
    console.log('Current page:', currentPage, 'Target page:', pageIndex);
    console.log('Question refs:', questionRefs.current);

    // Close mobile question map
    setShowQuestionMap(false);

    // If we're already on the right page, just scroll
    if (pageIndex === currentPage) {
      const questionElement = questionRefs.current[questionIndexInPage];
      console.log('Same page - Question element:', questionElement);
      if (questionElement) {
        questionElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
        // Add highlight effect
        questionElement.classList.add('highlight-effect');
        setTimeout(() => {
          questionElement.classList.remove('highlight-effect');
        }, 2000);
      }
    } else {
      // Change page first, then scroll
      setCurrentPage(pageIndex);

      // Wait for page change to complete, then scroll
      setTimeout(() => {
        const questionElement = questionRefs.current[questionIndexInPage];
        console.log('Different page - Question element after page change:', questionElement);
        if (questionElement) {
          questionElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
          // Add highlight effect
          questionElement.classList.add('highlight-effect');
          setTimeout(() => {
            questionElement.classList.remove('highlight-effect');
          }, 2000);
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

      // Submit quiz (mock for now)
      const result = await quizSubmissionService.mockSubmitQuiz(sessionId);

      if (result.status === 200) {
        // Navigate to result page
        navigate(`/quiz/quiz-result/${result.data.submissionId}`, {
          state: { result: result.data }
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

  // Get question status for map
  const getQuestionStatus = (index: number) => {
    const question = questions[index];
    if (!question) return 'unanswered';

    const hasAnswer = userAnswers[question.id] && userAnswers[question.id].length > 0;
    const isFlagged = flaggedQuestions.has(question.id);

    if (isFlagged) return 'flagged';
    if (hasAnswer) return 'answered';
    return 'unanswered';
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{quiz.title}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Trang {currentPage + 1}/{totalPages} •
                Đã trả lời: {answeredCount}/{questions.length} •
                Đã đánh dấu: {flaggedQuestions.size}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-lg ${getTimeColor()}`}>
                <Clock className="w-5 h-5" />
                <span>{formatTime(timeRemaining)}</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQuestionMap(!showQuestionMap)}
                className="lg:hidden"
              >
                {showQuestionMap ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Tiến độ làm bài</span>
              <span>{answeredCount}/{questions.length} câu ({Math.round((answeredCount / questions.length) * 100)}%)</span>
            </div>
            <Progress value={(answeredCount / questions.length) * 100} className="h-2" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Question Map Sidebar - Desktop */}
        <div className="hidden lg:block w-80 bg-white dark:bg-gray-800 border-r shadow-sm">
          <div className="sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Bản đồ câu hỏi</h3>

              {/* Question Grid */}
              <div className="grid grid-cols-5 gap-2 mb-6">
                {questions.map((_, index) => {
                  const status = getQuestionStatus(index);
                  let className = 'w-12 h-12 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ';

                  if (status === 'flagged') {
                    className += 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900 shadow-md';
                  } else if (status === 'answered') {
                    className += 'bg-green-500 hover:bg-green-600 text-white shadow-md';
                  } else {
                    className += 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300';
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => goToQuestion(index)}
                      className={className}
                      title={`Câu ${index + 1} - ${status === 'answered' ? 'Đã trả lời' : status === 'flagged' ? 'Đã đánh dấu' : 'Chưa trả lời'}`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="space-y-3 text-sm mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-green-500 rounded shadow-sm"></div>
                  <span className="text-gray-700 dark:text-gray-300">Đã trả lời ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-yellow-400 rounded shadow-sm"></div>
                  <span className="text-gray-700 dark:text-gray-300">Đã đánh dấu ({flaggedQuestions.size})</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-gray-100 dark:bg-gray-700 border rounded"></div>
                  <span className="text-gray-700 dark:text-gray-300">Chưa trả lời ({questions.length - answeredCount})</span>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
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
          </div>
        </div>

        {/* Questions Content Area */}
        <div className="flex-1 max-w-4xl mx-auto p-6">
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
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {questions.map((_, index) => {
                    const status = getQuestionStatus(index);
                    let className = 'w-12 h-12 rounded-lg text-sm font-medium transition-colors ';

                    if (status === 'flagged') {
                      className += 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900';
                    } else if (status === 'answered') {
                      className += 'bg-green-500 hover:bg-green-600 text-white';
                    } else {
                      className += 'bg-gray-100 hover:bg-gray-200 text-gray-700';
                    }

                    return (
                      <button
                        key={index}
                        onClick={() => goToQuestion(index)}
                        className={className}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Page Navigation */}
          <div className="flex items-center justify-between mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
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
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Trang {currentPage + 1} / {totalPages}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-500">
                (Câu {currentPage * QUESTIONS_PER_PAGE + 1} - {Math.min((currentPage + 1) * QUESTIONS_PER_PAGE, questions.length)})
              </span>
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
                    if (el) {
                      questionRefs.current[pageIndex] = el;
                      console.log(`Set ref for question ${questionIndex + 1} at page index ${pageIndex}:`, el);
                    }
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
                      {loadingAnswers[question.id] ? (
                        // Loading state
                        <div className="space-y-3">
                          {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3 p-4 border rounded-lg animate-pulse">
                              <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                              <div className="flex-1">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : questionAnswers[question.id] ? (
                        // Render answers
                        questionAnswers[question.id].map((answer, answerIndex) => {
                          const isSelected = userAnswers[question.id]?.includes(answer.id) || false;
                          const isMultiple = question.type === 'multipleChoice';

                          return (
                            <label
                              key={answer.id}
                              className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm ${
                                isSelected
                                  ? 'border-blue-400 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20 shadow-sm'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                              }`}
                            >
                              <input
                                type={isMultiple ? "checkbox" : "radio"}
                                name={`question_${question.id}`}
                                value={answer.id}
                                checked={isSelected}
                                onChange={() => handleAnswerSelect(question.id, answer.id, isMultiple)}
                                className="w-4 h-4 mt-1 flex-shrink-0 text-blue-600 focus:ring-blue-500"
                              />
                              <div className="flex-1">
                                <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-full mr-3">
                                  {String.fromCharCode(65 + answerIndex)}
                                </span>
                                <span className="text-gray-900 dark:text-gray-100">{answer.content}</span>
                              </div>
                            </label>
                          );
                        })
                      ) : (
                        // No answers
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
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
