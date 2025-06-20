import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { quizService } from '@/services/quizService';
import type { Question, Answer } from '@/services/quizService';
import { Badge } from "@/components/ui/badge";
import { FileQuestion, HelpCircle, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
// import { FlagButton } from './FlagButton'; // Removed - not used
import "./style.css";

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  onAnswerChange: (questionId: string, answerIds: string[]) => void;
  onFlagToggle: (questionId: string) => void;
  userAnswers: Record<string, string[]>;
  isFlagged: boolean;
}

export function QuestionCard({
  question,
  questionNumber,
  onAnswerChange,
  onFlagToggle,
  userAnswers,
  isFlagged
}: QuestionCardProps) {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnswers = async () => {
      try {
        const response = await quizService.getQuestionAnswers(question.id);
        setAnswers(response.data);
        setLoading(false);
      } catch {
        setError('Failed to fetch answers');
        setLoading(false);
      }
    };

    fetchAnswers();
  }, [question.id]);

  const handleSingleChoiceChange = (answerId: string) => {
    onAnswerChange(question.id, [answerId]);
  };

  const handleMultipleChoiceChange = (answerId: string, checked: boolean) => {
    const currentAnswers = userAnswers[question.id] || [];
    if (checked) {
      onAnswerChange(question.id, [...currentAnswers, answerId]);
    } else {
      onAnswerChange(question.id, currentAnswers.filter(id => id !== answerId));
    }
  };

  if (loading) {
    return (
      <Card className="mb-4">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-4 border-muted">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <HelpCircle className="w-5 h-5" />
            <p>Không thể tải câu hỏi</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6" id={`question-${question.id}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-md p-2 flex-shrink-0">
              <FileQuestion className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Câu {questionNumber}</h3>
              {question.difficultyLevel && (
                <Badge variant="outline" className="mt-1">
                  {question.difficultyLevel}
                </Badge>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFlagToggle(question.id)}
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
        <div className="mb-4">
          <p className="text-base leading-relaxed">{question.content}</p>
        </div>

        {question.type === "singleChoice" ? (
          <RadioGroup
            value={userAnswers[question.id]?.[0] || ""}
            onValueChange={handleSingleChoiceChange}
            className="space-y-3"
          >
            {answers.map((answer) => (
              <div key={answer.id} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value={answer.id} id={answer.id} />
                <Label htmlFor={answer.id} className="flex-1 cursor-pointer text-sm">
                  {answer.content}
                </Label>
              </div>
            ))}
          </RadioGroup>
        ) : (
          <div className="space-y-3">
            {answers.map((answer) => (
              <div key={answer.id} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <Checkbox
                  id={answer.id}
                  checked={userAnswers[question.id]?.includes(answer.id) || false}
                  onCheckedChange={(checked) =>
                    handleMultipleChoiceChange(answer.id, checked as boolean)
                  }
                />
                <Label htmlFor={answer.id} className="flex-1 cursor-pointer text-sm">
                  {answer.content}
                </Label>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}