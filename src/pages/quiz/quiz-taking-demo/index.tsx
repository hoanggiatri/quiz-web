import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { QuestionMap } from "@/components/quiz/QuestionMap/QuestionMap";
import { cn } from "@/lib/utils";
import type { QuestionStatus } from "@/types/quiz";
import "./style.css";

import {
  Clock,
  Flag,
  CheckCircle,
  Send,
  ChevronLeft,
  ChevronRight,
  FileText} from "lucide-react";

// Demo data - 50 questions (for testing sidebar with many questions)
const DEMO_QUIZ_DATA = {
  quiz: {
    examQuizzesId: "demo-quiz-1",
    title: "Kiểm tra Toán học - Đại số và Hình học (Mở rộng)",
    code: "MATH2024_EXTENDED",
    createdBy: "Thầy Nguyễn Văn A",
    totalQuestions: 50,
    duration: 150
  },
  questions: [
    {
      id: "q1",
      content: "Giải phương trình: 2x + 5 = 13",
      type: "singleChoice",
      answers: [
        { id: "a1", content: "x = 4", correct: true },
        { id: "a2", content: "x = 3", correct: false },
        { id: "a3", content: "x = 5", correct: false },
        { id: "a4", content: "x = 6", correct: false }
      ]
    },
    {
      id: "q2", 
      content: "Tính đạo hàm của hàm số f(x) = x³ + 2x² - 5x + 1",
      type: "singleChoice",
      answers: [
        { id: "a5", content: "f'(x) = 3x² + 4x - 5", correct: true },
        { id: "a6", content: "f'(x) = 3x² + 2x - 5", correct: false },
        { id: "a7", content: "f'(x) = x² + 4x - 5", correct: false },
        { id: "a8", content: "f'(x) = 3x² + 4x + 5", correct: false }
      ]
    },
    {
      id: "q3",
      content: "Trong tam giác ABC vuông tại A, nếu AB = 3, AC = 4 thì BC = ?",
      type: "singleChoice", 
      answers: [
        { id: "a9", content: "5", correct: true },
        { id: "a10", content: "6", correct: false },
        { id: "a11", content: "7", correct: false },
        { id: "a12", content: "8", correct: false }
      ]
    },
    {
      id: "q4",
      content: "Phương trình nào sau đây có nghiệm kép?",
      type: "multipleChoice",
      answers: [
        { id: "a13", content: "x² - 4x + 4 = 0", correct: true },
        { id: "a14", content: "x² - 6x + 9 = 0", correct: true },
        { id: "a15", content: "x² + 2x + 1 = 0", correct: true },
        { id: "a16", content: "x² - 5x + 6 = 0", correct: false }
      ]
    },
    {
      id: "q5",
      content: "Tính giới hạn: lim(x→2) (x² - 4)/(x - 2)",
      type: "singleChoice",
      answers: [
        { id: "a17", content: "4", correct: true },
        { id: "a18", content: "2", correct: false },
        { id: "a19", content: "0", correct: false },
        { id: "a20", content: "∞", correct: false }
      ]
    }
  ]
};

// Generate more questions to reach 50 (for testing sidebar with many questions)
for (let i = 6; i <= 50; i++) {
  const questionTypes = ["singleChoice", "multipleChoice"];
  const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];

  // Create more varied question content
  const questionContents = [
    `Câu hỏi số ${i}: Giải phương trình bậc hai: x² - ${i}x + ${Math.floor(i/2)} = 0`,
    `Câu hỏi số ${i}: Tính đạo hàm của hàm số f(x) = x³ + ${i}x² - ${i*2}x + 1`,
    `Câu hỏi số ${i}: Trong tam giác ABC, nếu góc A = ${30 + i}°, AB = ${i}, AC = ${i+1}, tính BC?`,
    `Câu hỏi số ${i}: Tìm giới hạn của dãy số an = (${i}n + 1)/(n + ${i}) khi n → ∞`,
    `Câu hỏi số ${i}: Cho hàm số y = ${i}x³ - 3x² + 2x - 1. Tìm cực trị của hàm số.`,
    `Câu hỏi số ${i}: Giải bất phương trình: ${i}x - ${i*2} > ${i+3}x + ${i-1}`,
    `Câu hỏi số ${i}: Tính tích phân ∫(${i}x² + ${i+1}x + 1)dx từ 0 đến ${i}`,
    `Câu hỏi số ${i}: Trong không gian Oxyz, cho điểm A(${i}, ${i+1}, ${i-1}). Tìm khoảng cách từ A đến mặt phẳng Oxy.`
  ];

  const content = questionContents[Math.floor(Math.random() * questionContents.length)];

  DEMO_QUIZ_DATA.questions.push({
    id: `q${i}`,
    content: content,
    type: questionType,
    answers: [
      { id: `a${i*4-3}`, content: `Đáp án A cho câu ${i}: ${Math.floor(Math.random() * 100)}`, correct: Math.random() > 0.7 },
      { id: `a${i*4-2}`, content: `Đáp án B cho câu ${i}: ${Math.floor(Math.random() * 100)}`, correct: Math.random() > 0.7 },
      { id: `a${i*4-1}`, content: `Đáp án C cho câu ${i}: ${Math.floor(Math.random() * 100)}`, correct: Math.random() > 0.7 },
      { id: `a${i*4}`, content: `Đáp án D cho câu ${i}: ${Math.floor(Math.random() * 100)}`, correct: Math.random() > 0.7 }
    ]
  });
}

const QUESTIONS_PER_PAGE = 10;

export default function QuizTakingDemoPageNew() {
  const navigate = useNavigate();
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // State management
  const [quiz] = useState(DEMO_QUIZ_DATA.quiz);
  const [questions] = useState(DEMO_QUIZ_DATA.questions);
  const [currentPage, setCurrentPage] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string[]>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
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

  // Handle answer selection
  const handleAnswerSelect = (questionId: string, answerId: string, isMultiple: boolean = false) => {
    let newAnswers: string[];

    if (isMultiple) {
      const currentAnswers = userAnswers[questionId] || [];
      if (currentAnswers.includes(answerId)) {
        newAnswers = currentAnswers.filter((id: string) => id !== answerId);
      } else {
        newAnswers = [...currentAnswers, answerId];
      }
    } else {
      newAnswers = [answerId];
    }

    setUserAnswers(prev => ({
      ...prev,
      [questionId]: newAnswers
    }));
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
  };


  const goToQuestion = (questionIndex: number) => {
    const pageIndex = Math.floor(questionIndex / QUESTIONS_PER_PAGE);
    const questionIndexInPage = questionIndex % QUESTIONS_PER_PAGE;
    const NAVIGATION_DELAY = 100;

    setCurrentQuestionIndex(questionIndex);

    const scrollToQuestionAndHighlight = (element: HTMLElement) => {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });

      element.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2');
      }, 2000);
    };

    if (pageIndex !== currentPage) {
      setCurrentPage(pageIndex);
    }

    setTimeout(() => {
      const questionElement = questionRefs.current[questionIndexInPage];

      if (questionElement) {
        scrollToQuestionAndHighlight(questionElement);
      } else {
        const fallbackElement = document.querySelector(`[data-question-index="${questionIndex}"]`) as HTMLElement;
        if (fallbackElement) {
          scrollToQuestionAndHighlight(fallbackElement);
        } else {
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
      
      // Simulate submission delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Calculate demo results
      const totalAnsweredQuestions = Object.keys(userAnswers).length;
      const correctAnswers = Math.floor(totalAnsweredQuestions * 0.75); // 75% correct rate
      const scorePercentage = Math.round((correctAnswers / questions.length) * 100);

      const demoResult = {
        submissionId: 'demo-submission-1',
        examQuizzesId: quiz.examQuizzesId,
        userId: 'demo-user',
        score: Math.round(scorePercentage / 10), // Score out of 10
        maxScore: 10,
        percentage: scorePercentage,
        correctAnswers,
        totalQuestions: questions.length,
        timeSpent: 3240, // 54 minutes
        submittedAt: new Date().toISOString(),
        gradedAt: new Date().toISOString()
      };

      navigate('/quiz/quiz-result-demo', {
        state: {
          result: demoResult,
          submissionId: 'demo-submission-1',
          quizInfo: quiz,
          userAnswers,
          totalQuestions: questions.length,
          totalAnsweredQuestions
        }
      });
    } catch (err) {
      console.error('Error submitting quiz:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Note: Removed auto-update of currentQuestionIndex when page changes
  // to prevent conflicts with manual question navigation

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
    goToQuestion(questionIndex);
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      <div className="flex relative">
        {/* Question Map Sidebar - Desktop */}
        <div className="hidden lg:block w-80 border-r bg-background sticky-sidebar transition-colors duration-200">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              <QuestionMap
                questions={questionStatuses}
                onQuestionClick={handleQuestionMapClick}
                currentQuestionIndex={currentQuestionIndex}
              />

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
                const selectedAnswers = userAnswers[question.id] || [];

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
                    <CardContent>
                      <div className="mb-6">
                        <p className="text-base leading-relaxed">{question.content}</p>
                      </div>

                      {/* Answer Options */}
                      <div className="space-y-3">
                        {question.type === 'singleChoice' ? (
                          <RadioGroup
                            value={selectedAnswers[0] || ""}
                            onValueChange={(value) => handleAnswerSelect(question.id, value, false)}
                          >
                            {question.answers.map((answer, answerIndex) => {
                              const answerLabel = String.fromCharCode(65 + answerIndex); // A, B, C, D
                              return (
                                <div key={answer.id} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors duration-200">
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
                        ) : (
                          <div className="space-y-3">
                            {question.answers.map((answer, answerIndex) => {
                              const answerLabel = String.fromCharCode(65 + answerIndex); // A, B, C, D
                              const isChecked = selectedAnswers.includes(answer.id);
                              return (
                                <div key={answer.id} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors duration-200">
                                  <Checkbox
                                    id={answer.id}
                                    checked={isChecked}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        handleAnswerSelect(question.id, answer.id, true);
                                      } else {
                                        handleAnswerSelect(question.id, answer.id, true);
                                      }
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
