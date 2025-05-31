import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  Clock, 
  FileText, 
  User, 
  Award,
  Play,
  Eye,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Download
} from 'lucide-react';
import { cn } from "@/lib/utils";
import type { Assignment, AssignmentAction } from '@/types/assignment';
import { 
  getAssignmentStatusColor, 
  getAssignmentStatusLabel,
  getAssignmentTypeLabel,
  getDifficultyColor,
  getDifficultyLabel
} from '@/types/assignment';

interface AssignmentCardProps {
  assignment: Assignment;
  onAction: (action: AssignmentAction, assignmentId: string) => void;
  loading?: boolean;
  className?: string;
}

export function AssignmentCard({ 
  assignment, 
  onAction, 
  loading = false,
  className 
}: AssignmentCardProps) {
  const [actionLoading, setActionLoading] = useState<AssignmentAction | null>(null);

  const handleAction = async (action: AssignmentAction) => {
    setActionLoading(action);
    try {
      await onAction(action, assignment.id);
    } finally {
      setActionLoading(null);
    }
  };

  const getActionButtons = () => {
    const buttons: Array<{
      action: AssignmentAction;
      label: string;
      icon: React.ReactNode;
      variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost';
      disabled?: boolean;
    }> = [];

    switch (assignment.status) {
      case 'assigned':
        buttons.push({
          action: 'start',
          label: 'Bắt đầu làm',
          icon: <Play className="w-4 h-4" />,
          variant: 'default'
        });
        break;
      
      case 'in_progress':
        buttons.push({
          action: 'continue',
          label: 'Tiếp tục làm',
          icon: <RotateCcw className="w-4 h-4" />,
          variant: 'default'
        });
        break;
      
      case 'submitted':
        buttons.push({
          action: 'view_result',
          label: 'Xem kết quả',
          icon: <Eye className="w-4 h-4" />,
          variant: 'outline',
          disabled: !assignment.result
        });
        break;
      
      case 'graded':
        buttons.push({
          action: 'view_result',
          label: 'Xem kết quả',
          icon: <CheckCircle className="w-4 h-4" />,
          variant: 'outline'
        });
        if (assignment.attempts < assignment.maxAttempts) {
          buttons.push({
            action: 'retry',
            label: 'Làm lại',
            icon: <RotateCcw className="w-4 h-4" />,
            variant: 'secondary'
          });
        }
        break;
      
      case 'overdue':
        if (assignment.attempts < assignment.maxAttempts) {
          buttons.push({
            action: 'start',
            label: 'Làm bài (Trễ hạn)',
            icon: <AlertTriangle className="w-4 h-4" />,
            variant: 'destructive'
          });
        }
        break;
    }

    // Always show view detail button
    buttons.push({
      action: 'view_result',
      label: 'Xem chi tiết',
      icon: <Eye className="w-4 h-4" />,
      variant: 'ghost'
    });

    return buttons;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysUntilDue = () => {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilDue = getDaysUntilDue();
  const isOverdue = daysUntilDue < 0;
  const isDueSoon = daysUntilDue <= 3 && daysUntilDue > 0;

  return (
    <Card className={cn(
      "h-full transition-all duration-200 hover:shadow-md",
      isOverdue && "border-red-200 dark:border-red-800",
      isDueSoon && "border-yellow-200 dark:border-yellow-800",
      loading && "opacity-50",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg leading-tight line-clamp-2 mb-2">
              {assignment.title}
            </h3>
            <div className="flex flex-wrap gap-2">
              <Badge className={getAssignmentStatusColor(assignment.status)}>
                {getAssignmentStatusLabel(assignment.status)}
              </Badge>
              <Badge variant="outline">
                {getAssignmentTypeLabel(assignment.type)}
              </Badge>
              <Badge className={getDifficultyColor(assignment.difficulty)}>
                {getDifficultyLabel(assignment.difficulty)}
              </Badge>
            </div>
          </div>
          
          {assignment.userScore !== undefined && (
            <div className="text-right flex-shrink-0">
              <div className="text-2xl font-bold text-primary">
                {assignment.userScore}
              </div>
              <div className="text-sm text-muted-foreground">
                /{assignment.maxScore}
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {assignment.description}
        </p>

        <div className="space-y-3">
          {/* Assignment Info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="truncate">{assignment.instructor}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span>{assignment.questionCount} câu hỏi</span>
            </div>
            {assignment.duration && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>{assignment.duration} phút</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-muted-foreground" />
              <span>{assignment.maxScore} điểm</span>
            </div>
          </div>

          <Separator />

          {/* Dates */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Giao:</span>
              <span>{formatDate(assignment.assignedDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Hạn:</span>
              <span className={cn(
                isOverdue && "text-red-600 dark:text-red-400 font-medium",
                isDueSoon && "text-yellow-600 dark:text-yellow-400 font-medium"
              )}>
                {formatDate(assignment.dueDate)}
              </span>
            </div>
            
            {/* Time remaining */}
            {!isOverdue && (
              <div className="text-xs text-muted-foreground">
                {daysUntilDue === 0 ? 'Hết hạn hôm nay' : 
                 daysUntilDue === 1 ? 'Còn 1 ngày' : 
                 `Còn ${daysUntilDue} ngày`}
              </div>
            )}
            {isOverdue && (
              <div className="text-xs text-red-600 dark:text-red-400">
                Quá hạn {Math.abs(daysUntilDue)} ngày
              </div>
            )}
          </div>

          {/* Progress for in-progress assignments */}
          {assignment.status === 'in_progress' && assignment.userScore !== undefined && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tiến độ</span>
                <span>{Math.round((assignment.userScore / assignment.maxScore) * 100)}%</span>
              </div>
              <Progress value={(assignment.userScore / assignment.maxScore) * 100} />
            </div>
          )}

          {/* Attempts */}
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Lần thử: {assignment.attempts}/{assignment.maxAttempts}</span>
            {assignment.attachments && assignment.attachments.length > 0 && (
              <div className="flex items-center gap-1">
                <Download className="w-3 h-3" />
                <span>{assignment.attachments.length} file</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3">
        <div className="flex flex-wrap gap-2 w-full">
          {getActionButtons().map((button, index) => (
            <Button
              key={button.action}
              variant={button.variant}
              size="sm"
              onClick={() => handleAction(button.action)}
              disabled={button.disabled || loading || actionLoading !== null}
              className={cn(
                "flex-1 min-w-0",
                index === 0 && "flex-[2]" // Make primary button larger
              )}
            >
              {actionLoading === button.action ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                button.icon
              )}
              <span className="ml-2 truncate">{button.label}</span>
            </Button>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}
