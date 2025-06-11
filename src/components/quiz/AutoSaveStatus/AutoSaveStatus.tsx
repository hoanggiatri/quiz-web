import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Cloud,
  CloudOff,
  Loader2,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Clock
} from 'lucide-react';
import { cn } from "@/lib/utils";
import type { AutoSaveStatus } from '@/hooks/useAutoSave';
import "./style.css";

interface AutoSaveStatusProps {
  status: AutoSaveStatus;
  error: string | null;
  lastSaved: Date | null;
  pendingChanges: number;
  hasUnsavedChanges: boolean;
  onRetry: () => void;
  onForceSave: () => void;
  className?: string;
}

export function AutoSaveStatus({
  status,
  error,
  lastSaved,
  pendingChanges,
  hasUnsavedChanges,
  onRetry,
  onForceSave,
  className
}: AutoSaveStatusProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Auto-hide success status after 3 seconds
  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        setShowDetails(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const getStatusIcon = () => {
    switch (status) {
      case 'saving':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return hasUnsavedChanges ? 
          <CloudOff className="h-4 w-4 text-gray-400" /> : 
          <Cloud className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'saving':
        return 'Đang lưu...';
      case 'success':
        return 'Đã lưu';
      case 'error':
        return 'Tạm dừng';
      case 'pending':
        return `Chờ lưu (${pendingChanges})`;
      default:
        return hasUnsavedChanges ? 'Chưa lưu' : 'Đã đồng bộ';
    }
  };

  const getStatusVariant = (): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'saving':
      case 'pending':
        return 'secondary';
      case 'success':
        return 'default';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    
    if (diffMinutes < 1) return 'Vừa xong';
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Main Status Badge */}
      <div className="flex items-center gap-2">
        <Badge 
          variant={getStatusVariant()}
          className={cn(
            "gap-1.5 cursor-pointer transition-all",
            status === 'error' && "animate-pulse"
          )}
          onClick={() => setShowDetails(!showDetails)}
        >
          {getStatusIcon()}
          <span className="text-xs font-medium">{getStatusText()}</span>
        </Badge>

        {/* Manual Save Button */}
        {(hasUnsavedChanges || status === 'error') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={status === 'error' ? onRetry : onForceSave}
            disabled={status === 'saving'}
            className="h-6 px-2 text-xs"
          >
            <RefreshCw className={cn(
              "h-3 w-3 mr-1",
              status === 'saving' && "animate-spin"
            )} />
            {status === 'error' ? 'Thử lại' : 'Lưu ngay'}
          </Button>
        )}
      </div>

      {/* Detailed Status */}
      {showDetails && (
        <div className="space-y-2">
          {/* Last Saved Info */}
          {lastSaved && (
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Lần cuối: {formatLastSaved(lastSaved)}
            </div>
          )}

          {/* Pending Changes Info */}
          {pendingChanges > 0 && (
            <div className="text-xs text-muted-foreground">
              {pendingChanges} thay đổi chờ lưu
            </div>
          )}

          {/* Error Alert */}
          {status === 'error' && (
            <Alert variant="default" className="py-2 border-orange-200 bg-orange-50 dark:bg-orange-950/20">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <AlertDescription className="text-xs">
                <div className="font-medium mb-1 text-orange-700 dark:text-orange-300">Lưu tự động tạm dừng</div>
                <div className="text-orange-600 dark:text-orange-400 mb-2">Vui lòng thử lại hoặc lưu thủ công</div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRetry}
                    className="h-6 px-2 text-xs border-orange-300 text-orange-700 hover:bg-orange-100"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Thử lại
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onForceSave}
                    className="h-6 px-2 text-xs border-orange-300 text-orange-700 hover:bg-orange-100"
                  >
                    Lưu thủ công
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {status === 'success' && (
            <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Tất cả thay đổi đã được lưu
            </div>
          )}

          {/* Saving Progress */}
          {status === 'saving' && (
            <div className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Đang đồng bộ với server...
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Compact version for header/footer
export function AutoSaveStatusCompact({
  status,
  pendingChanges,
  hasUnsavedChanges,
  onForceSave,
  className
}: Pick<AutoSaveStatusProps, 'status' | 'pendingChanges' | 'hasUnsavedChanges' | 'onForceSave' | 'className'>) {
  const getStatusColor = () => {
    switch (status) {
      case 'saving':
        return 'text-blue-500';
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'pending':
        return 'text-yellow-500';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("flex items-center gap-1 text-xs", getStatusColor())}>
        {status === 'saving' && <Loader2 className="h-3 w-3 animate-spin" />}
        {status === 'success' && <CheckCircle className="h-3 w-3" />}
        {status === 'error' && <AlertTriangle className="h-3 w-3 text-orange-500" />}
        {status === 'pending' && <Clock className="h-3 w-3" />}
        {status === 'idle' && (hasUnsavedChanges ? <CloudOff className="h-3 w-3" /> : <Cloud className="h-3 w-3" />)}
        
        <span>
          {status === 'saving' && 'Lưu...'}
          {status === 'success' && 'Đã lưu'}
          {status === 'error' && 'Tạm dừng'}
          {status === 'pending' && `Chờ (${pendingChanges})`}
          {status === 'idle' && (hasUnsavedChanges ? 'Chưa lưu' : 'Đồng bộ')}
        </span>
      </div>

      {hasUnsavedChanges && status !== 'saving' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onForceSave}
          className="h-5 px-1 text-xs"
        >
          Lưu
        </Button>
      )}
    </div>
  );
}
