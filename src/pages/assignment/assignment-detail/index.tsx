import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  Users,
  Award,
  Download,
  Play,
  RotateCcw,
  Eye,
  AlertTriangle,
  CheckCircle,
  Timer,
  BookOpen,
  Target
} from "lucide-react";
import { assignmentManagementService } from "@/services/assignmentManagementService";
import type { Assignment, AssignmentAction } from "@/types/assignment";

export default function AssignmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<AssignmentAction | null>(null);

  // Load assignment
  useEffect(() => {
    const loadAssignment = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await assignmentManagementService.getAssignment(id);
        setAssignment(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    loadAssignment();
  }, [id]);

  // Handle actions
  const handleAction = async (action: AssignmentAction) => {
    if (!assignment) return;
    
    try {
      setActionLoading(action);
      const result = await assignmentManagementService.performAction(action, assignment.id);
      
      if (result.success && result.redirectUrl) {
        navigate(result.redirectUrl);
      } else if (result.message) {
        // Show success message
        alert(result.message);
        // Reload assignment data
        const updatedAssignment = await assignmentManagementService.getAssignment(assignment.id);
        setAssignment(updatedAssignment);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setActionLoading(null);
    }
  };

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'submitted': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'graded': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'assigned': return 'Đã giao';
      case 'in_progress': return 'Đang làm';
      case 'submitted': return 'Đã nộp';
      case 'graded': return 'Đã chấm';
      case 'overdue': return 'Quá hạn';
      default: return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'quiz': return 'Trắc nghiệm';
      case 'exam': return 'Thi';
      case 'homework': return 'Bài tập';
      case 'project': return 'Dự án';
      case 'essay': return 'Tiểu luận';
      default: return type;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Dễ';
      case 'medium': return 'Trung bình';
      case 'hard': return 'Khó';
      default: return difficulty;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysUntilDue = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getActionButton = () => {
    if (!assignment) return null;

    const isLoading = actionLoading !== null;
    
    switch (assignment.status) {
      case 'assigned':
        return (
          <Button 
            onClick={() => handleAction('start')} 
            disabled={isLoading}
            className="w-full"
          >
            {actionLoading === 'start' ? (
              <>
                <Timer className="w-4 h-4 mr-2 animate-spin" />
                Đang bắt đầu...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Bắt đầu làm bài
              </>
            )}
          </Button>
        );
      
      case 'in_progress':
        return (
          <Button 
            onClick={() => handleAction('continue')} 
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            {actionLoading === 'continue' ? (
              <>
                <Timer className="w-4 h-4 mr-2 animate-spin" />
                Đang tải...
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4 mr-2" />
                Tiếp tục làm bài
              </>
            )}
          </Button>
        );
      
      case 'submitted':
      case 'graded':
        return (
          <div className="space-y-2">
            <Button 
              onClick={() => handleAction('view_result')} 
              disabled={isLoading}
              variant="secondary"
              className="w-full"
            >
              <Eye className="w-4 h-4 mr-2" />
              Xem kết quả chi tiết
            </Button>
            {assignment.attempts < assignment.maxAttempts && (
              <Button 
                onClick={() => handleAction('retry')} 
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                {actionLoading === 'retry' ? (
                  <>
                    <Timer className="w-4 h-4 mr-2 animate-spin" />
                    Đang thiết lập...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Làm lại ({assignment.attempts}/{assignment.maxAttempts})
                  </>
                )}
              </Button>
            )}
          </div>
        );
      
      case 'overdue':
        return (
          <Button 
            onClick={() => handleAction('start')} 
            disabled={isLoading}
            variant="destructive"
            className="w-full"
          >
            {actionLoading === 'start' ? (
              <>
                <Timer className="w-4 h-4 mr-2 animate-spin" />
                Đang bắt đầu...
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 mr-2" />
                Làm bài (Trễ hạn)
              </>
            )}
          </Button>
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error || 'Không tìm thấy bài tập'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const daysUntilDue = getDaysUntilDue(assignment.dueDate);
  const isUrgent = daysUntilDue <= 3 && daysUntilDue > 0;
  const isOverdue = daysUntilDue < 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/assignment/assignment-list">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <Badge className={getStatusColor(assignment.status)}>
            {getStatusLabel(assignment.status)}
          </Badge>
          <Badge variant="outline">
            {getTypeLabel(assignment.type)}
          </Badge>
          <Badge className={getDifficultyColor(assignment.difficulty)}>
            {getDifficultyLabel(assignment.difficulty)}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Assignment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{assignment.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {assignment.instructor}
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {assignment.subject}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {assignment.description}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Ngày giao</div>
                    <div className="text-muted-foreground">{formatDate(assignment.assignedDate)}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Hạn nộp</div>
                    <div className={`${isOverdue ? 'text-red-600' : isUrgent ? 'text-orange-600' : 'text-muted-foreground'}`}>
                      {formatDate(assignment.dueDate)}
                    </div>
                  </div>
                </div>
                
                {assignment.duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Thời gian</div>
                      <div className="text-muted-foreground">{assignment.duration} phút</div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Số câu hỏi</div>
                    <div className="text-muted-foreground">{assignment.questionCount}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Điểm tối đa</div>
                    <div className="text-muted-foreground">{assignment.maxScore}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Lần thử</div>
                    <div className="text-muted-foreground">{assignment.attempts}/{assignment.maxAttempts}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time Alert */}
          {(isUrgent || isOverdue) && (
            <Alert variant={isOverdue ? "destructive" : "default"}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {isOverdue
                  ? `Bài tập đã quá hạn ${Math.abs(daysUntilDue)} ngày`
                  : `Bài tập sắp hết hạn trong ${daysUntilDue} ngày`
                }
              </AlertDescription>
            </Alert>
          )}

          {/* Attachments */}
          {assignment.attachments && assignment.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Tài liệu đính kèm
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {assignment.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{attachment.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {(attachment.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Tải xuống
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {assignment.result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Kết quả
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Score Display */}
                  <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {assignment.result.score}/{assignment.result.maxScore}
                    </div>
                    <div className="text-lg text-muted-foreground mb-4">
                      {assignment.result.percentage.toFixed(1)}%
                    </div>
                    <Progress value={assignment.result.percentage} className="h-3" />
                  </div>

                  {/* Detailed Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {assignment.result.correctAnswers}
                      </div>
                      <div className="text-muted-foreground">Câu đúng</div>
                    </div>

                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {assignment.result.totalQuestions}
                      </div>
                      <div className="text-muted-foreground">Tổng câu</div>
                    </div>

                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {assignment.result.timeSpent}
                      </div>
                      <div className="text-muted-foreground">Phút</div>
                    </div>

                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {assignment.attempts}
                      </div>
                      <div className="text-muted-foreground">Lần thử</div>
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nộp bài:</span>
                      <span>{formatDate(assignment.result.submittedAt)}</span>
                    </div>
                    {assignment.result.gradedAt && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Chấm điểm:</span>
                        <span>{formatDate(assignment.result.gradedAt)}</span>
                      </div>
                    )}
                  </div>

                  {/* Feedback */}
                  {assignment.result.feedback && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h4 className="font-medium mb-2">Nhận xét từ giáo viên:</h4>
                      <p className="text-sm text-muted-foreground">
                        {assignment.result.feedback}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Hành động</CardTitle>
            </CardHeader>
            <CardContent>
              {getActionButton()}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Trạng thái</span>
                <Badge className={getStatusColor(assignment.status)}>
                  {getStatusLabel(assignment.status)}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Độ khó</span>
                <Badge className={getDifficultyColor(assignment.difficulty)}>
                  {getDifficultyLabel(assignment.difficulty)}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Lần thử</span>
                <span className="text-sm font-medium">
                  {assignment.attempts}/{assignment.maxAttempts}
                </span>
              </div>

              {assignment.userScore !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Điểm hiện tại</span>
                  <span className="text-sm font-medium text-green-600">
                    {assignment.userScore}/{assignment.maxScore}
                  </span>
                </div>
              )}

              {isUrgent && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Còn lại</span>
                  <span className="text-sm font-medium text-orange-600">
                    {daysUntilDue} ngày
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
