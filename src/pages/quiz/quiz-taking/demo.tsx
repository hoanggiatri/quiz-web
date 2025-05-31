import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, Flag, ArrowLeft, ArrowRight, Play } from "lucide-react";

export default function QuizTakingDemoPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Demo Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <Play className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-blue-900">Chế độ Demo</span>
        </div>
        <p className="text-sm text-blue-700 mt-1">
          Đây là bản demo của giao diện làm bài thi. Dữ liệu không được lưu.
        </p>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Demo - Bài thi Toán học</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-orange-600">
            <Clock className="w-4 h-4" />
            <span className="font-mono">45:30</span>
          </div>
          <Button variant="outline" size="sm">
            <Flag className="w-4 h-4 mr-2" />
            Đánh dấu
          </Button>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>Câu hỏi 5/20</span>
          <span>25% hoàn thành</span>
        </div>
        <Progress value={25} className="h-2" />
      </div>

      {/* Question */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Câu hỏi 5 (Demo)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-6">Tính giá trị của biểu thức: 2x + 3y khi x = 2 và y = 5</p>
          
          <div className="space-y-3">
            {['A. 19', 'B. 17', 'C. 21', 'D. 15'].map((option, index) => (
              <label key={index} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                <input type="radio" name="answer" value={option} className="w-4 h-4" />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Câu trước
        </Button>
        
        <div className="flex gap-2">
          <Button variant="outline">Lưu & Tiếp tục</Button>
          <Button>
            Câu tiếp theo
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
