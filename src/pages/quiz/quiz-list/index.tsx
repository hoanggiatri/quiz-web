import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BookOpen,
  Play,
  Users,
  AlertTriangle,
  Calendar,
  User,
  Search,
  Grid3X3,
  List,
  Eye,
  ChevronLeft,
  ChevronRight} from "lucide-react";
import { quizService, type PublicQuiz } from "@/services/quizService";
import { useClassContext } from "@/contexts/ClassContext";
import ClassSelector from "@/components/common/ClassSelector";
import "@/styles/quiz-shared.css";
import "./style.css";


export default function QuizListPage() {
  const { selectedClass, loading: classLoading } = useClassContext();
  const [quizzes, setQuizzes] = useState<PublicQuiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<PublicQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [searchParams, setSearchParams] = useState({
    query: '',
    filters: { status: 'all' as 'all' | 'available' | 'upcoming' | 'expired' },
    sortBy: 'newest' as 'newest' | 'oldest' | 'title' | 'questions' | 'startTime',
    sortOrder: 'desc' as 'asc' | 'desc',
    page: 1,
    limit: 12
  });

  // Helper functions - moved before useEffect to avoid hoisting issues
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getQuizStatus = (quiz: PublicQuiz): 'available' | 'upcoming' | 'expired' => {
    const now = new Date();
    const startTime = new Date(quiz.startTime);
    const endTime = new Date(quiz.endTime);

    if (now < startTime) return 'upcoming';
    if (now > endTime) return 'expired';
    return 'available';
  };


  const getStatusBadge = (quiz: PublicQuiz) => {
    const status = getQuizStatus(quiz);

    switch (status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Đang mở</Badge>;
      case 'upcoming':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Sắp diễn ra</Badge>;
      case 'expired':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">Đã kết thúc</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  // Update search params helper
  const updateSearchParams = (updates: Partial<typeof searchParams>) => {
    setSearchParams(prev => ({
      ...prev,
      ...updates,
      page: updates.page || 1 // Reset to page 1 when changing filters
    }));
  };

  // Load quizzes from API based on selected class
  useEffect(() => {
    const loadQuizzes = async () => {
      if (!selectedClass) {
        setQuizzes([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await quizService.getExamQuizzesByClassId(selectedClass.id);
        if (response.status === 200 && response.data) {
          setQuizzes(response.data);
        } else {
          throw new Error(response.message || 'Không thể tải danh sách bài thi');
        }
      } catch (err) {
        console.error('Error loading quizzes:', err);
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    if (!classLoading) {
      loadQuizzes();
    }
  }, [selectedClass, classLoading]);

  // Filter and sort quizzes
  useEffect(() => {
    let filtered = [...quizzes];

    // Apply search filter
    if (searchParams.query.trim()) {
      filtered = filtered.filter(quiz =>
        quiz.title.toLowerCase().includes(searchParams.query.toLowerCase()) ||
        quiz.code?.toLowerCase().includes(searchParams.query.toLowerCase()) ||
        quiz.createdBy.toLowerCase().includes(searchParams.query.toLowerCase())
      );
    }

    // Apply status filter
    if (searchParams.filters.status !== "all") {
      filtered = filtered.filter(quiz => {
        const status = getQuizStatus(quiz);
        return status === searchParams.filters.status;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (searchParams.sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        case "questions":
          return b.totalQuestions - a.totalQuestions;
        case "startTime":
          return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        default:
          return 0;
      }
    });

    setFilteredQuizzes(filtered);
  }, [quizzes, searchParams]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: filteredQuizzes.length,
      available: filteredQuizzes.filter(q => getQuizStatus(q) === 'available').length,
      upcoming: filteredQuizzes.filter(q => getQuizStatus(q) === 'upcoming').length,
      expired: filteredQuizzes.filter(q => getQuizStatus(q) === 'expired').length,
    };
  }, [filteredQuizzes]);

  // Pagination
  const totalPages = Math.ceil(filteredQuizzes.length / searchParams.limit);
  const startIndex = (searchParams.page - 1) * searchParams.limit;
  const endIndex = startIndex + searchParams.limit;
  const paginatedQuizzes = filteredQuizzes.slice(startIndex, endIndex);



  // Show error state
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
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Danh sách bài thi</h1>
          <p className="text-muted-foreground">
            Quản lý và theo dõi các bài thi trực tuyến
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ClassSelector />
          <Link to="/quiz/quiz-taking-demo">
            <Button variant="outline" size="sm" className="bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100">
              <Play className="w-4 h-4 mr-2" />
              Demo Quiz
            </Button>
          </Link>
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Tổng số</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.available}</div>
            <div className="text-sm text-muted-foreground">Đang mở</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.upcoming}</div>
            <div className="text-sm text-muted-foreground">Sắp diễn ra</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
            <div className="text-sm text-muted-foreground">Đã kết thúc</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm bài thi theo tên, mã hoặc giảng viên..."
              value={searchParams.query}
              onChange={(e) => updateSearchParams({ query: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Select
            value={searchParams.filters.status}
            onValueChange={(value) =>
              updateSearchParams({
                filters: {
                  ...searchParams.filters,
                  status: value as 'all' | 'available' | 'upcoming' | 'expired'
                }
              })
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="available">Đang mở</SelectItem>
              <SelectItem value="upcoming">Sắp diễn ra</SelectItem>
              <SelectItem value="expired">Đã kết thúc</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={`${searchParams.sortBy}-${searchParams.sortOrder}`}
            onValueChange={(value) => {
              const [sortBy, sortOrder] = value.split('-');
              updateSearchParams({
                sortBy: sortBy as 'newest' | 'oldest' | 'title' | 'questions' | 'startTime',
                sortOrder: sortOrder as 'asc' | 'desc'
              });
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest-desc">Mới nhất</SelectItem>
              <SelectItem value="oldest-asc">Cũ nhất</SelectItem>
              <SelectItem value="title-asc">Tên A-Z</SelectItem>
              <SelectItem value="questions-desc">Số câu hỏi</SelectItem>
              <SelectItem value="startTime-asc">Thời gian bắt đầu</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className={`gap-6 ${viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3" : "flex flex-col"}`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="space-y-2 mb-4">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        /* Error State */
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : paginatedQuizzes.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">
            {!selectedClass ? 'Chọn lớp học để xem bài thi' : 'Không tìm thấy bài thi'}
          </h2>
          <p className="text-muted-foreground">
            {!selectedClass
              ? 'Vui lòng chọn một lớp học từ dropdown ở trên để xem danh sách bài thi.'
              : searchParams.query
                ? 'Không có bài thi nào phù hợp với từ khóa tìm kiếm.'
                : 'Hiện tại chưa có bài thi nào trong lớp học này.'
            }
          </p>
        </div>
      ) : (
        <>
          {/* Quiz List */}
          <div className={`gap-6 ${viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3" : "flex flex-col"}`}>
            {paginatedQuizzes.map((quiz) => {

              return (
                <Card key={quiz.examQuizzesId} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <BookOpen className="w-5 h-5" />
                        {quiz.title}
                      </CardTitle>
                      {getStatusBadge(quiz)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span>{quiz.createdBy}</span>
                      {quiz.code && (
                        <>
                          <span>•</span>
                          <span className="font-mono">{quiz.code}</span>
                        </>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3 text-sm mb-6">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{quiz.totalQuestions} câu hỏi</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div>Bắt đầu: {formatDate(quiz.startTime)}</div>
                          <div>Kết thúc: {formatDate(quiz.endTime)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Link to={`/quiz/quiz-detail/${quiz.examQuizzesId}`}>
                        <Button variant="outline" className="w-full">
                          <Eye className="w-4 h-4 mr-2" />
                          Xem chi tiết
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8">
              <div className="text-sm text-muted-foreground">
                Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredQuizzes.length)} trong tổng số {filteredQuizzes.length} bài thi
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateSearchParams({ page: searchParams.page - 1 })}
                  disabled={searchParams.page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Trước
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={searchParams.page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateSearchParams({ page: pageNum })}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}

                  {totalPages > 5 && (
                    <>
                      <span className="px-2">...</span>
                      <Button
                        variant={searchParams.page === totalPages ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateSearchParams({ page: totalPages })}
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateSearchParams({ page: searchParams.page + 1 })}
                  disabled={searchParams.page === totalPages}
                >
                  Sau
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
