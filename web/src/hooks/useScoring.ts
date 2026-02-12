"use client";

import { useState, useCallback } from "react";
import type { ScoreRequest, ScoreResult, ScoreResponse } from "@/lib/types";

export function useScoring() {
  const [isScoring, setIsScoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestScore = useCallback(
    async (req: ScoreRequest): Promise<ScoreResult | null> => {
      setIsScoring(true);
      setError(null);

      try {
        const res = await fetch("/api/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(req),
        });

        const data: ScoreResponse = await res.json();

        if (!data.success || !data.result) {
          setError(data.error || "Scoring failed");
          return null;
        }

        return data.result;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Network error");
        return null;
      } finally {
        setIsScoring(false);
      }
    },
    []
  );

  return { isScoring, error, requestScore };
}
