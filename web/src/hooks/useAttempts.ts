"use client";

import { useState, useEffect, useCallback } from "react";
import { storage } from "@/lib/storage";
import type { Attempt } from "@/lib/types";

export function useAttempts() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);

  useEffect(() => {
    setAttempts(storage.getAttempts());
  }, []);

  const addAttempt = useCallback((attempt: Attempt) => {
    storage.saveAttempt(attempt);
    setAttempts(storage.getAttempts());
  }, []);

  const getAttempt = useCallback(
    (id: string) => {
      return attempts.find((a) => a.id === id);
    },
    [attempts]
  );

  const deleteAttempt = useCallback((id: string) => {
    storage.deleteAttempt(id);
    setAttempts(storage.getAttempts());
  }, []);

  const clearAll = useCallback(() => {
    storage.clearAll();
    setAttempts([]);
  }, []);

  return { attempts, addAttempt, getAttempt, deleteAttempt, clearAll };
}
