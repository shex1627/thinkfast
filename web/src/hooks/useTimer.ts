"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface UseTimerReturn {
  timeRemaining: number;
  isRunning: boolean;
  isExpired: boolean;
  percentRemaining: number;
  start: () => void;
  pause: () => void;
  reset: () => void;
}

export function useTimer(durationSeconds: number): UseTimerReturn {
  const [timeRemaining, setTimeRemaining] = useState(durationSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const durationRef = useRef(durationSeconds);

  useEffect(() => {
    durationRef.current = durationSeconds;
    setTimeRemaining(durationSeconds);
  }, [durationSeconds]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    clearTimer();
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearTimer();
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer]);

  const pause = useCallback(() => {
    clearTimer();
    setIsRunning(false);
  }, [clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setTimeRemaining(durationRef.current);
  }, [clearTimer]);

  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  return {
    timeRemaining,
    isRunning,
    isExpired: timeRemaining <= 0,
    percentRemaining:
      durationRef.current > 0
        ? (timeRemaining / durationRef.current) * 100
        : 0,
    start,
    pause,
    reset,
  };
}
