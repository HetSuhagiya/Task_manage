import { useState, useEffect, useRef, useCallback } from "react";

interface LockedTaskTimer {
  activeTaskId: number | null;
  elapsed: number;
  isLocked: boolean;
  startTimer: (taskId: number) => void;
  stopTimer: () => void;
}

const STORAGE_KEY = "focusmirror-locked-task";

export function useLockedTaskTimer(): LockedTaskTimer {
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimestampRef = useRef<number | null>(null);

  // Load from storage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const { taskId, startTimestamp, elapsed: storedElapsed } = JSON.parse(stored);
        if (taskId && startTimestamp) {
          setActiveTaskId(taskId);
          setIsLocked(true);
          startTimestampRef.current = startTimestamp;
          setElapsed(Math.floor((Date.now() - startTimestamp) / 1000) + (storedElapsed || 0));
        }
      } catch {}
    }
    // eslint-disable-next-line
  }, []);

  // Timer effect
  useEffect(() => {
    if (activeTaskId !== null && isLocked) {
      if (!intervalRef.current) {
        intervalRef.current = setInterval(() => {
          if (startTimestampRef.current) {
            setElapsed(Math.floor((Date.now() - startTimestampRef.current) / 1000));
          }
        }, 1000);
      }
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [activeTaskId, isLocked]);

  // Persist to storage
  useEffect(() => {
    if (activeTaskId !== null && isLocked && startTimestampRef.current) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          taskId: activeTaskId,
          startTimestamp: startTimestampRef.current,
          elapsed,
        })
      );
    }
  }, [activeTaskId, isLocked, elapsed]);

  const startTimer = useCallback((taskId: number) => {
    if (isLocked) return;
    setActiveTaskId(taskId);
    setIsLocked(true);
    startTimestampRef.current = Date.now();
    setElapsed(0);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        taskId,
        startTimestamp: Date.now(),
        elapsed: 0,
      })
    );
  }, [isLocked]);

  const stopTimer = useCallback(() => {
    setActiveTaskId(null);
    setIsLocked(false);
    setElapsed(0);
    startTimestampRef.current = null;
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { activeTaskId, elapsed, isLocked, startTimer, stopTimer };
} 