import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { assignmentService, type Assignment } from "@/services/assignmentService";

export default function TestAssignmentApiPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [classId, setClassId] = useState<string>('12189af0-7972-4671-a673-328b0ada85e7');

  const loadAssignments = async () => {
    if (!classId) return;

    try {
      setLoading(true);
      setError(null);
      console.log('Loading assignments for classId:', classId);
      
      const response = await assignmentService.getAssignmentsByClass(classId);
      console.log('API Response:', response);
      
      setAssignments(response.data);
    } catch (err) {
      console.error('Error loading assignments:', err);
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusInfo = (deadline: string) => {
    const now = new Date();
    const dueDate = new Date(deadline);
    const diffTime = dueDate.getTime() - now.getTime();

    if (diffTime < 0) {
      return { label: 'Quá hạn', color: 'bg-red-500 text-white' };
    } else if (diffTime <= 24 * 60 * 60 * 1000) {
      return { label: 'Sắp hết hạn', color: 'bg-yellow-500 text-white' };
    } else {
      return { label: 'Đang hoạt động', color: 'bg-green-500 text-white' };
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Test Assignment API</h1>

      {/* Controls */}
      <div className="mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Class ID:</label>
              <Input
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                placeholder="Nhập Class ID..."
                className="max-w-md"
              />
              <Button onClick={loadAssignments} disabled={loading}>
                {loading ? 'Đang tải...' : 'Tải dữ liệu'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">
          Kết quả: {assignments.length} bài tập
        </h2>
        
        {assignments.length === 0 && !loading && !error && (
          <p className="text-muted-foreground">Không có dữ liệu</p>
        )}
      </div>

      {/* Assignments Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {assignments.map((assignment) => {
          const statusInfo = getStatusInfo(assignment.deadline);
          
          return (
            <Card key={assignment.assignmentId} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-lg line-clamp-2">
                    {assignment.title}
                  </CardTitle>
                  <Badge className={statusInfo.color}>
                    {statusInfo.label}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Description */}
                {assignment.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {assignment.description}
                  </p>
                )}

                {/* Assignment Info */}
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>ID:</strong> {assignment.assignmentId}
                  </div>
                  <div>
                    <strong>Giáo viên:</strong> {assignment.createdByName}
                  </div>
                  <div>
                    <strong>Hạn nộp:</strong> {formatDate(assignment.deadline)}
                  </div>
                  <div>
                    <strong>Tạo lúc:</strong> {formatDate(assignment.createdAt)}
                  </div>
                  <div>
                    <strong>Cập nhật:</strong> {formatDate(assignment.updatedAt)}
                  </div>
                  {assignment.file && (
                    <div>
                      <strong>File:</strong> Có file đính kèm
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Raw Data */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Raw Data (JSON)</h2>
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-auto text-xs">
          {JSON.stringify(assignments, null, 2)}
        </pre>
      </div>
    </div>
  );
}
