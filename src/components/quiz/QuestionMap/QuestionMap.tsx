import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Flag, CheckCircle } from "lucide-react";
import type { QuestionStatus } from "@/types/quiz";
import "./style.css";

interface QuestionMapProps {
  questions: QuestionStatus[];
  onQuestionClick: (questionIndex: number) => void;
  currentQuestionIndex: number;
  className?: string;
}

export function QuestionMap({
  questions,
  onQuestionClick,
  currentQuestionIndex,
  className
}: QuestionMapProps) {
  const answeredCount = questions.filter(q => q.isAnswered).length;
  const flaggedCount = questions.filter(q => q.isFlagged).length;

  return (
    <Card className={cn("h-fit", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base lg:text-lg">Bản đồ câu hỏi</CardTitle>
        <div className="flex flex-wrap gap-2 text-xs lg:text-sm">
          <Badge variant="secondary" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Đã làm: {answeredCount}
          </Badge>
          <Badge variant="outline" className="gap-1 text-yellow-600 border-yellow-300">
            <Flag className="h-3 w-3" />
            Đánh dấu: {flaggedCount}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-5 lg:grid-cols-5 gap-1.5 lg:gap-2">
          {questions.map((question, index) => {
            const questionNumber = index + 1;
            const isActive = index === currentQuestionIndex;

            return (
              <Button
                key={question.id}
                variant="outline"
                size="sm"
                onClick={() => onQuestionClick(index)}
                className={cn(
                  "relative h-8 w-8 lg:h-10 lg:w-10 p-0 text-xs lg:text-sm font-medium transition-all",
                  // Trạng thái active (câu hỏi hiện tại)
                  isActive && "ring-2 ring-primary ring-offset-1 lg:ring-offset-2",
                  // Trạng thái đã làm (màu xanh lá)
                  question.isAnswered && !isActive && "bg-green-100 text-green-700 border-green-300 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700",
                  // Trạng thái đánh dấu cờ (màu vàng)
                  question.isFlagged && !question.isAnswered && !isActive && "bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-700",
                  // Trạng thái vừa làm vừa đánh dấu cờ
                  question.isFlagged && question.isAnswered && !isActive && "bg-gradient-to-br from-green-100 to-yellow-100 text-green-700 border-green-300 hover:from-green-200 hover:to-yellow-200 dark:from-green-900/20 dark:to-yellow-900/20 dark:text-green-400",
                  // Trạng thái chưa làm (mặc định)
                  !question.isAnswered && !question.isFlagged && !isActive && "hover:bg-muted"
                )}
              >
                {questionNumber}
                {question.isFlagged && (
                  <Flag className="absolute -top-0.5 -right-0.5 lg:-top-1 lg:-right-1 h-2.5 w-2.5 lg:h-3 lg:w-3 text-yellow-500 fill-current" />
                )}
              </Button>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="mt-4 space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border bg-green-100 border-green-300"></div>
            <span>Đã làm</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border bg-yellow-100 border-yellow-300"></div>
            <span>Đánh dấu cờ</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border bg-muted"></div>
            <span>Chưa làm</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
