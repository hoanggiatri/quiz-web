import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Clock,
  FileText,
  Grid3X3,
  List,
  Search,
  AlertTriangle,
  Play,
  Eye,
  RotateCcw,
  Users,
  Award
} from "lucide-react";
import { assignmentManagementService } from "@/services/assignmentManagementService";
import { useClassContext } from "@/contexts/ClassContext";
import type { Assignment, AssignmentStatus, AssignmentType } from "@/types/assignment";

// Local interface for simplified filters
interface LocalAssignmentFilters {
  status?: AssignmentStatus;
  type?: AssignmentType;
}

interface LocalSearchParams {
  query?: string;
  filters?: LocalAssignmentFilters;
  sortBy?: 'title' | 'dueDate' | 'assignedDate' | 'score';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export default function AssignmentListPage() {
  const { selectedClass } = useClassContext();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [searchParams, setSearchParams] = useState<LocalSearchParams>({
    query: '',
    filters: {},
    sortBy: 'dueDate',
    sortOrder: 'asc',
    page: 1,
    limit: 12
  });

  // Load assignments from API
  useEffect(() => {
    const loadAssignments = async () => {
      if (!selectedClass?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const assignmentList = await assignmentManagementService.getAssignmentsByClassId(selectedClass.id);
        setAssignments(assignmentList);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    loadAssignments();
  }, [selectedClass?.id]);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...assignments];

    // Apply search
    if (searchParams.query) {
      const query = searchParams.query.toLowerCase();
      filtered = filtered.filter(assignment =>
        assignment.title.toLowerCase().includes(query) ||
        assignment.description.toLowerCase().includes(query) ||
        assignment.instructor.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (searchParams.filters) {
      const { status, type } = searchParams.filters;

      if (status && typeof status === 'string') {
        filtered = filtered.filter(a => a.status === status);
      }

      if (type && typeof type === 'string') {
        filtered = filtered.filter(a => a.type === type);
      }
    }

    // Apply sorting
    if (searchParams.sortBy) {
      filtered.sort((a, b) => {
        let aValue: string | number | Date, bValue: string | number | Date;

        switch (searchParams.sortBy) {
          case 'title':
            aValue = a.title;
            bValue = b.title;
            break;
          case 'dueDate':
            aValue = new Date(a.dueDate);
            bValue = new Date(b.dueDate);
            break;
          case 'assignedDate':
            aValue = new Date(a.assignedDate);
            bValue = new Date(b.assignedDate);
            break;
          case 'score':
            aValue = a.userScore || 0;
            bValue = b.userScore || 0;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return searchParams.sortOrder === 'desc' ? 1 : -1;
        if (aValue > bValue) return searchParams.sortOrder === 'desc' ? -1 : 1;
        return 0;
      });
    }

    setFilteredAssignments(filtered);
  }, [assignments, searchParams]);

  // Update search params
  const updateSearchParams = (updates: Partial<LocalSearchParams>) => {
    setSearchParams(prev => ({
      ...prev,
      ...updates,
      page: updates.page || 1 // Reset to page 1 when changing filters
    }));
  };

  // Statistics
  const stats = useMemo(() => {
    return {
      total: filteredAssignments.length,
      assigned: filteredAssignments.filter(a => a.status === 'assigned').length,
      inProgress: filteredAssignments.filter(a => a.status === 'in_progress').length,
      submitted: filteredAssignments.filter(a => a.status === 'submitted').length,
      graded: filteredAssignments.filter(a => a.status === 'graded').length,
      overdue: filteredAssignments.filter(a => a.status === 'overdue').length,
      dueSoon: filteredAssignments.filter(a => {
        const dueDate = new Date(a.dueDate);
        const now = new Date();
        const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= 3 && diffDays > 0;
      }).length
    };
  }, [filteredAssignments]);

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

  const getActionButton = (assignment: Assignment) => {
    switch (assignment.status) {
      case 'assigned':
        return (
          <Button size="sm" className="w-full">
            <Play className="w-4 h-4 mr-2" />
            Bắt đầu làm bài
          </Button>
        );
      case 'in_progress':
        return (
          <Button size="sm" variant="outline" className="w-full">
            <RotateCcw className="w-4 h-4 mr-2" />
            Tiếp tục làm bài
          </Button>
        );
      case 'submitted':
      case 'graded':
        return (
          <Button size="sm" variant="secondary" className="w-full">
            <Eye className="w-4 h-4 mr-2" />
            Xem kết quả
          </Button>
        );
      case 'overdue':
        return (
          <Button size="sm" variant="destructive" className="w-full">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Làm bài (Trễ hạn)
          </Button>
        );
      default:
        return null;
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

  if (!selectedClass) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Vui lòng chọn một lớp học để xem danh sách bài tập.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Danh sách bài tập</h1>
          <p className="text-muted-foreground">
            Quản lý và theo dõi tiến độ các bài tập được giao
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Tổng số</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.assigned}</div>
            <div className="text-sm text-muted-foreground">Đã giao</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
            <div className="text-sm text-muted-foreground">Đang làm</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.graded}</div>
            <div className="text-sm text-muted-foreground">Hoàn thành</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <div className="text-sm text-muted-foreground">Quá hạn</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.dueSoon}</div>
            <div className="text-sm text-muted-foreground">Sắp hết hạn</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {stats.total > 0 ? Math.round((stats.graded / stats.total) * 100) : 0}%
            </div>
            <div className="text-sm text-muted-foreground">Tỷ lệ hoàn thành</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm bài tập theo tên, mô tả..."
              value={searchParams.query}
              onChange={(e) => updateSearchParams({ query: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Select
            value={typeof searchParams.filters?.status === 'string' ? searchParams.filters.status : 'all'}
            onValueChange={(value) =>
              updateSearchParams({
                filters: {
                  ...searchParams.filters,
                  status: value === 'all' ? undefined : value as AssignmentStatus
                }
              })
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="assigned">Đã giao</SelectItem>
              <SelectItem value="in_progress">Đang làm</SelectItem>
              <SelectItem value="submitted">Đã nộp</SelectItem>
              <SelectItem value="graded">Đã chấm</SelectItem>
              <SelectItem value="overdue">Quá hạn</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={typeof searchParams.filters?.type === 'string' ? searchParams.filters.type : 'all'}
            onValueChange={(value) =>
              updateSearchParams({
                filters: {
                  ...searchParams.filters,
                  type: value === 'all' ? undefined : value as AssignmentType
                }
              })
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Loại bài tập" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="quiz">Trắc nghiệm</SelectItem>
              <SelectItem value="exam">Thi</SelectItem>
              <SelectItem value="homework">Bài tập</SelectItem>
              <SelectItem value="project">Dự án</SelectItem>
              <SelectItem value="essay">Tiểu luận</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={`${searchParams.sortBy}-${searchParams.sortOrder}`}
            onValueChange={(value) => {
              const [sortBy, sortOrder] = value.split('-');
              updateSearchParams({
                sortBy: sortBy as 'title' | 'dueDate' | 'assignedDate' | 'score',
                sortOrder: sortOrder as 'asc' | 'desc'
              });
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dueDate-asc">Hạn sớm nhất</SelectItem>
              <SelectItem value="dueDate-desc">Hạn muộn nhất</SelectItem>
              <SelectItem value="title-asc">Tên A-Z</SelectItem>
              <SelectItem value="title-desc">Tên Z-A</SelectItem>
              <SelectItem value="assignedDate-desc">Mới nhất</SelectItem>
              <SelectItem value="maxScore-desc">Điểm cao nhất</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Assignment Grid/List */}
      {loading ? (
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-full mb-4" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Chưa có bài tập nào</h2>
          <p className="text-muted-foreground mb-4">
            {searchParams.query || Object.keys(searchParams.filters || {}).length > 0
              ? 'Không tìm thấy bài tập nào phù hợp với bộ lọc của bạn.'
              : 'Hiện tại chưa có bài tập nào được giao.'}
          </p>
          {(searchParams.query || Object.keys(searchParams.filters || {}).length > 0) && (
            <Button
              variant="outline"
              onClick={() => setSearchParams({ query: '', filters: {}, sortBy: 'dueDate', sortOrder: 'asc', page: 1, limit: 12 })}
            >
              Xóa bộ lọc
            </Button>
          )}
        </div>
      ) : (
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {filteredAssignments.map((assignment) => {
            const daysUntilDue = getDaysUntilDue(assignment.dueDate);
            const isUrgent = daysUntilDue <= 3 && daysUntilDue > 0;
            const isOverdue = daysUntilDue < 0;

            return (
              <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <Badge className={getStatusColor(assignment.status)}>
                      {getStatusLabel(assignment.status)}
                    </Badge>
                    <Badge variant="outline">
                      {assignment.type === 'quiz' && 'Trắc nghiệm'}
                      {assignment.type === 'exam' && 'Thi'}
                      {assignment.type === 'homework' && 'Bài tập'}
                      {assignment.type === 'project' && 'Dự án'}
                      {assignment.type === 'essay' && 'Tiểu luận'}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pb-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {assignment.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {assignment.description}
                  </p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{assignment.instructor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      <span>{assignment.subject}</span>
                    </div>
                    {assignment.duration && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{assignment.duration} phút</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span>{assignment.questionCount} câu hỏi</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-muted-foreground" />
                      <span>{assignment.maxScore} điểm</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Ngày giao:</span>
                      <span>{formatDate(assignment.assignedDate)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Hạn nộp:</span>
                      <span className={`font-medium ${isOverdue ? 'text-red-600' : isUrgent ? 'text-orange-600' : ''}`}>
                        {formatDate(assignment.dueDate)}
                        {isOverdue && ' (Quá hạn)'}
                        {isUrgent && ` (${daysUntilDue} ngày)`}
                      </span>
                    </div>
                  </div>

                  {assignment.status === 'in_progress' && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Tiến độ</span>
                        <span>{assignment.userScore || 0}%</span>
                      </div>
                      <Progress value={assignment.userScore || 0} className="h-2" />
                    </div>
                  )}

                  {assignment.userScore !== undefined && assignment.status === 'graded' && (
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Điểm số:</span>
                        <span className="text-lg font-bold text-green-600">
                          {assignment.userScore}/{assignment.maxScore}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-0">
                  <div className="w-full space-y-2">
                    {getActionButton(assignment)}
                    <Link to={`/assignment/assignment-detail/${assignment.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="w-4 h-4 mr-2" />
                        Xem chi tiết
                      </Button>
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
