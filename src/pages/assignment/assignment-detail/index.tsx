import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Upload,
  X,
  AlertTriangle,
  CheckCircle,
  BookOpen,
  Paperclip,
  Send,
  Target
} from "lucide-react";
import { assignmentManagementService } from "@/services/assignmentManagementService";
import { assignmentService } from "@/services/assignmentService";
import type { Assignment } from "@/types/assignment";

export default function AssignmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Submission states
  const [submissionText, setSubmissionText] = useState("");
  const [submissionFiles, setSubmissionFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedFile, setSubmittedFile] = useState<File | null>(null);

  // Load assignment
  useEffect(() => {
    const loadAssignment = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const data = await assignmentManagementService.getAssignmentById(id);
        setAssignment(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    loadAssignment();
  }, [id]);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // API chỉ hỗ trợ 1 file, thay thế file hiện tại
      const newFile = files[0];
      setSubmissionFiles([newFile]);
    }
  };

  // Remove file
  const removeFile = (index: number) => {
    setSubmissionFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Handle submission
  const handleSubmission = async () => {
    if (!assignment || submissionFiles.length === 0) return;

    try {
      setSubmitting(true);
      setError(null);

      // API chỉ hỗ trợ submit 1 file, lấy file đầu tiên
      const fileToSubmit = submissionFiles[0];

      console.log('Submitting assignment:', {
        assignmentId: assignment.id,
        fileName: fileToSubmit.name,
        fileSize: fileToSubmit.size,
        fileType: fileToSubmit.type
      });

      // Call API to submit assignment
      const response = await assignmentService.submitAssignment(
        assignment.id,
        fileToSubmit
      );

      console.log('Assignment submitted successfully:', response);

      setSubmitted(true);
      setSubmittedFile(fileToSubmit); // Save submitted file info
      setSubmissionFiles([]); // Clear files after successful submission
      setSubmissionText(''); // Clear text

      alert('Nộp bài thành công!');

    } catch (err) {
      console.error('Error submitting assignment:', err);
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi nộp bài');
    } finally {
      setSubmitting(false);
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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



  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
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
      <div className="container mx-auto px-4 py-8 max-w-6xl">
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

        {/* Sidebar - Submission Panel */}
        <div className="space-y-6">
          {/* Submission Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Bài làm của bạn
              </CardTitle>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="space-y-4">
                  <div className="text-center py-4">
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                    <h3 className="font-medium text-green-600 mb-2">Đã nộp bài</h3>
                    <p className="text-sm text-muted-foreground">
                      Bài làm của bạn đã được nộp thành công
                    </p>
                  </div>

                  {/* Display submitted file */}
                  {submittedFile && (
                    <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-3">
                        <Paperclip className="w-5 h-5 text-green-600" />
                        <div className="flex-1">
                          <div className="font-medium text-green-700 dark:text-green-400">
                            File đã nộp:
                          </div>
                          <div className="text-sm text-green-600 dark:text-green-500">
                            {submittedFile.name}
                          </div>
                          <div className="text-xs text-green-500">
                            {formatFileSize(submittedFile.size)} • {submittedFile.type}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-300">
                          Đã nộp
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Trạng thái</span>
                    <Badge variant="outline" className="text-orange-600">
                      Chưa nộp
                    </Badge>
                  </div>

                  {isOverdue && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Đã quá hạn nộp bài {Math.abs(daysUntilDue)} ngày
                      </AlertDescription>
                    </Alert>
                  )}

                  {isUrgent && !isOverdue && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Còn {daysUntilDue} ngày để nộp bài
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* File Submission */}
          {!submitted && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Nộp bài
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Text Submission */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Ghi chú (tùy chọn)
                  </label>
                  <Textarea
                    placeholder="Thêm ghi chú cho bài làm của bạn..."
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Tệp đính kèm
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                    />
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Chọn một tệp để nộp bài
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Chọn tệp
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">
                      Hỗ trợ: PDF, DOC, DOCX, TXT, JPG, PNG (tối đa 10MB)<br/>
                      <strong>Lưu ý:</strong> Chỉ có thể nộp 1 tệp duy nhất
                    </p>
                  </div>
                </div>

                {/* Uploaded File */}
                {submissionFiles.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Tệp đã chọn
                    </label>
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-3">
                        <Paperclip className="w-4 h-4 text-green-600" />
                        <div>
                          <div className="text-sm font-medium text-green-700 dark:text-green-400">
                            {submissionFiles[0].name}
                          </div>
                          <div className="text-xs text-green-600 dark:text-green-500">
                            {formatFileSize(submissionFiles[0].size)}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(0)}
                        className="text-green-600 hover:text-green-700 hover:bg-green-100"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  onClick={handleSubmission}
                  disabled={submitting || submissionFiles.length === 0}
                  className="w-full"
                >
                  {submitting ? (
                    <>
                      <Upload className="w-4 h-4 mr-2 animate-pulse" />
                      Đang nộp bài...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Nộp bài ({submissionFiles.length > 0 ? submissionFiles[0].name : 'Chưa chọn file'})
                    </>
                  )}
                </Button>

                {submissionFiles.length === 0 && (
                  <p className="text-xs text-orange-600 text-center">
                    Vui lòng chọn một tệp để nộp bài
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Assignment Info */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin bài tập</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Điểm tối đa</span>
                <span className="text-sm font-medium">{assignment.maxScore} điểm</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Hạn nộp</span>
                <span className={`text-sm font-medium ${isOverdue ? 'text-red-600' : isUrgent ? 'text-orange-600' : ''}`}>
                  {formatDate(assignment.dueDate)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Trạng thái</span>
                <Badge className={getStatusColor(assignment.status)}>
                  {getStatusLabel(assignment.status)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
