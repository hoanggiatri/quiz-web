import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { debounce } from "lodash";
import { currentAutoSaveService } from "@/services/autoSaveService";
import type { AutoSaveRequest } from "@/services/autoSaveService";

export interface AutoSaveData {
  questionId: string;
  selectedAnswers: string[];
  isFlagged: boolean;
  timestamp: number;
}

export interface SessionData {
  currentPage: number;
  totalAnswered: number;
  flaggedCount: number;
}

export interface AutoSavePayload {
  examQuizId: string;
  userId: string;
  changes: AutoSaveData[];
  sessionData: SessionData;
}

export type AutoSaveStatus =
  | "idle"
  | "pending"
  | "saving"
  | "success"
  | "error";

interface UseAutoSaveOptions {
  examQuizId: string;
  userId: string;
  debounceMs?: number;
  maxRetries?: number;
  retryDelayMs?: number;
}

export const useAutoSave = ({
  examQuizId,
  userId,
  debounceMs = 3000,
  maxRetries = 3,
  retryDelayMs = 1000,
}: UseAutoSaveOptions) => {
  const [localChanges, setLocalChanges] = useState<Map<string, AutoSaveData>>(
    new Map()
  );
  const [status, setStatus] = useState<AutoSaveStatus>("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);
  const sessionDataRef = useRef<SessionData>({
    currentPage: 1,
    totalAnswered: 0,
    flaggedCount: 0,
  });

  // Save to localStorage immediately for backup
  const saveToLocalStorage = useCallback(
    (changes: Map<string, AutoSaveData>) => {
      try {
        const data = {
          changes: Object.fromEntries(changes),
          sessionData: sessionDataRef.current,
          timestamp: Date.now(),
        };
        localStorage.setItem(
          `autosave_${examQuizId}_${userId}`,
          JSON.stringify(data)
        );
      } catch (error) {
        console.warn("Failed to save to localStorage:", error);
      }
    },
    [examQuizId, userId]
  );

  // Load from localStorage on init
  const loadFromLocalStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem(`autosave_${examQuizId}_${userId}`);
      if (saved) {
        const data = JSON.parse(saved);
        const changes = new Map(Object.entries(data.changes));
        setLocalChanges(changes);
        sessionDataRef.current = data.sessionData || sessionDataRef.current;
        return { changes, sessionData: data.sessionData };
      }
    } catch (error) {
      console.warn("Failed to load from localStorage:", error);
    }
    return null;
  }, [examQuizId, userId]);

  // Server save function
  const saveToServer = useCallback(
    async (changes: AutoSaveData[], sessionData: SessionData) => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      const payload: AutoSaveRequest = {
        examQuizId,
        userId,
        changes,
        sessionData,
      };

      try {
        const result = await currentAutoSaveService.saveAutoSave(payload);
        return result;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return null; // Request was cancelled, not an error
        }
        throw error;
      }
    },
    [examQuizId, userId]
  );

  // Debounced save with retry logic
  const debouncedSave = useMemo(
    () =>
      debounce(async () => {
        if (localChanges.size === 0) return;

        setStatus("saving");
        setError(null);

        try {
          const changes = Array.from(localChanges.values());
          const result = await saveToServer(changes, sessionDataRef.current);

          if (result) {
            // Success - clear local changes
            setLocalChanges(new Map());
            setStatus("success");
            setLastSaved(new Date());
            retryCountRef.current = 0;

            // Clear localStorage backup after successful save
            localStorage.removeItem(`autosave_${examQuizId}_${userId}`);

            // Auto-hide success status after 2 seconds
            setTimeout(() => {
              setStatus("idle");
            }, 2000);
          }
        } catch (error) {
          console.error("Auto-save failed:", error);

          retryCountRef.current++;
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          setError(errorMessage);

          if (retryCountRef.current < maxRetries) {
            setStatus("pending");
            // Retry with exponential backoff
            setTimeout(() => {
              debouncedSave();
            }, retryDelayMs * Math.pow(2, retryCountRef.current - 1));
          } else {
            setStatus("error");
            retryCountRef.current = 0;
          }
        }
      }, debounceMs),
    [
      localChanges,
      debounceMs,
      maxRetries,
      retryDelayMs,
      saveToServer,
      examQuizId,
      userId,
    ]
  );

  // Add or update a change
  const addChange = useCallback(
    (
      questionId: string,
      selectedAnswers: string[],
      isFlagged: boolean = false
    ) => {
      const change: AutoSaveData = {
        questionId,
        selectedAnswers,
        isFlagged,
        timestamp: Date.now(),
      };

      setLocalChanges((prev) => {
        const newMap = new Map(prev);
        newMap.set(questionId, change);

        // Save to localStorage immediately
        saveToLocalStorage(newMap);

        return newMap;
      });

      setStatus("pending");
      debouncedSave();
    },
    [debouncedSave, saveToLocalStorage]
  );

  // Update session data
  const updateSession = useCallback(
    (sessionData: Partial<SessionData>) => {
      sessionDataRef.current = { ...sessionDataRef.current, ...sessionData };

      // Trigger save if there are pending changes
      if (localChanges.size > 0) {
        debouncedSave();
      }
    },
    [localChanges.size, debouncedSave]
  );

  // Force save (for manual save or before page unload)
  const forceSave = useCallback(async () => {
    if (localChanges.size === 0) return true;

    debouncedSave.cancel(); // Cancel debounced save
    setStatus("saving");

    try {
      const changes = Array.from(localChanges.values());
      const result = await saveToServer(changes, sessionDataRef.current);

      if (result) {
        setLocalChanges(new Map());
        setStatus("success");
        setLastSaved(new Date());
        localStorage.removeItem(`autosave_${examQuizId}_${userId}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Force save failed:", error);
      setStatus("error");
      setError(error instanceof Error ? error.message : "Unknown error");
      return false;
    }
  }, [localChanges, saveToServer, examQuizId, userId, debouncedSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  // Load initial data
  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  // Save before page unload
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (localChanges.size > 0) {
        // Try to save synchronously (limited time)
        forceSave();

        // Show warning to user
        event.preventDefault();
        event.returnValue =
          "Bạn có thay đổi chưa được lưu. Bạn có chắc muốn rời khỏi trang?";
        return event.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [localChanges.size, forceSave]);

  return {
    // State
    status,
    error,
    lastSaved,
    pendingChanges: localChanges.size,
    hasUnsavedChanges: localChanges.size > 0,

    // Actions
    addChange,
    updateSession,
    forceSave,
    loadFromLocalStorage,

    // Utils
    clearError: () => setError(null),
    retry: () => {
      setError(null);
      setStatus("pending");
      debouncedSave();
    },
  };
};
