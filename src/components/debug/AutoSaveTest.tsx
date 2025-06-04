import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { quizService } from "@/services/quizService";
import { Clock, Send, CheckCircle, AlertTriangle } from "lucide-react";

export default function AutoSaveTest() {
  const [examQuizzSubmissionId, setExamQuizzSubmissionId] = useState("3fa85f64-5717-4562-b3fc-2c963f66afa6");
  const [questionId, setQuestionId] = useState("3fa85f64-5717-4562-b3fc-2c963f66afa6");
  const [answerId, setAnswerId] = useState("3fa85f64-5717-4562-b3fc-2c963f66afa6");
  const [submissionId, setSubmissionId] = useState("bb57b271-5e2d-4820-8037-77d6b9c3a133");
  const [loading, setLoading] = useState(false);
  const [finishLoading, setFinishLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [finishResult, setFinishResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testAutoSave = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const submitData = {
        examQuizzSubmissionId,
        questionId,
        answerId: [answerId]
      };

      console.log('Testing auto-save with data:', submitData);

      const response = await quizService.submitSingleAnswer(submitData);
      
      setResult(response);
      console.log('Auto-save test result:', response);

    } catch (err) {
      console.error('Auto-save test error:', err);
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const testFinishSubmission = async () => {
    try {
      setFinishLoading(true);
      setError(null);
      setFinishResult(null);

      console.log('Testing finish submission with submissionId:', submissionId);

      const response = await quizService.finishSubmission(submissionId);

      setFinishResult(response);
      console.log('Finish submission test result:', response);

      // Log the score breakdown
      if (response.status === 200 && response.data) {
        console.log('Score breakdown:', {
          correct: response.data.correct,
          wrong: response.data.wrong,
          total: response.data.total,
          scoreDecimal: response.data.score,
          scorePercentage: (response.data.score * 100).toFixed(1) + '%'
        });
      }

    } catch (err) {
      console.error('Finish submission test error:', err);
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setFinishLoading(false);
    }
  };

  return (
    <Card className="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20">
      <CardHeader>
        <CardTitle className="text-purple-600 dark:text-purple-400 flex items-center gap-2">
          <Send className="w-5 h-5" />
          🧪 Test Auto-Save API
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Exam Quiz Submission ID:
            </label>
            <Input
              value={examQuizzSubmissionId}
              onChange={(e) => setExamQuizzSubmissionId(e.target.value)}
              placeholder="examQuizzSubmissionId"
              className="font-mono text-sm"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Question ID:
            </label>
            <Input
              value={questionId}
              onChange={(e) => setQuestionId(e.target.value)}
              placeholder="questionId"
              className="font-mono text-sm"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Answer ID:
            </label>
            <Input
              value={answerId}
              onChange={(e) => setAnswerId(e.target.value)}
              placeholder="answerId"
              className="font-mono text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Submission ID (for finish):
            </label>
            <Input
              value={submissionId}
              onChange={(e) => setSubmissionId(e.target.value)}
              placeholder="submissionId"
              className="font-mono text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            onClick={testAutoSave}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Đang test...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Test Auto-Save
              </>
            )}
          </Button>

          <Button
            onClick={testFinishSubmission}
            disabled={finishLoading}
            variant="secondary"
            className="w-full"
          >
            {finishLoading ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Đang test...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Test Finish Submission
              </>
            )}
          </Button>
        </div>

        {/* Auto-Save Result Display */}
        {result && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                Auto-Save Success (Status: {result.status})
              </span>
            </div>
            <pre className="text-xs text-green-600 dark:text-green-400 overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        {/* Finish Submission Result Display */}
        {finishResult && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                Finish Submission Success (Status: {finishResult.status})
              </span>
            </div>
            <pre className="text-xs text-blue-600 dark:text-blue-400 overflow-auto">
              {JSON.stringify(finishResult, null, 2)}
            </pre>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-700 dark:text-red-400">
                Error
              </span>
            </div>
            <p className="text-xs text-red-600 dark:text-red-400">
              {error}
            </p>
          </div>
        )}

        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
          <p className="text-xs text-yellow-700 dark:text-yellow-400">
            💡 <strong>Auto-Save API:</strong> POST /submit-answer/submit<br/>
            <strong>Payload:</strong> {`{ examQuizzSubmissionId, questionId, answerId: [string] }`}<br/><br/>
            🏁 <strong>Finish API:</strong> POST /submit-answer/finish/{submissionId}<br/>
            <strong>Payload:</strong> Empty body<br/>
            <strong>Response:</strong> {`{ correct: number, score: decimal, wrong: number, total: number }`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
