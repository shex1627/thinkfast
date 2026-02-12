"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { storage } from "@/lib/storage";
import {
  formatTimerLabel,
  gradeColor,
  scoreColor,
  scoreColorText,
} from "@/lib/utils";
import type { Attempt } from "@/lib/types";

export default function ResultsPage() {
  const params = useParams();
  const [attempt, setAttempt] = useState<Attempt | null>(null);

  useEffect(() => {
    const id = params.attemptId as string;
    const found = storage.getAttempt(id);
    if (found) setAttempt(found);
  }, [params.attemptId]);

  if (!attempt) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-4">Attempt not found</h1>
        <a href="/history" className="text-accent-light hover:text-accent">
          Back to History
        </a>
      </div>
    );
  }

  const { score } = attempt;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-4 p-6 rounded-xl bg-card border border-card-border">
          <div>
            <div
              className={`text-6xl font-bold ${scoreColorText(
                score.overall.score
              )}`}
            >
              {score.overall.score}
            </div>
            <div className="text-sm text-muted">/10</div>
          </div>
          <div className="text-left">
            <div
              className={`text-3xl font-bold ${gradeColor(
                score.overall.grade
              )}`}
            >
              {score.overall.grade}
            </div>
            <div className="text-sm text-muted">
              {attempt.prompt.topic} &middot;{" "}
              {formatTimerLabel(attempt.timerDuration)}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-card border border-card-border mb-6">
        <p>{score.overall.summary}</p>
      </div>

      <div className="space-y-3 mb-6">
        {(
          [
            "clarity",
            "accuracy",
            "structure",
            "completeness",
            "conciseness",
          ] as const
        ).map((cat) => {
          const data = score[cat];
          return (
            <div
              key={cat}
              className="p-4 rounded-lg bg-card border border-card-border"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium capitalize">{cat}</span>
                <span
                  className={`font-bold ${scoreColorText(data.score)}`}
                >
                  {data.score}/10
                </span>
              </div>
              <div className="w-full h-2 bg-card-border rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full ${scoreColor(data.score)}`}
                  style={{ width: `${data.score * 10}%` }}
                />
              </div>
              <p className="text-sm text-muted">{data.feedback}</p>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3">
        <a
          href="/practice"
          className="flex-1 py-3 bg-accent hover:bg-accent-light text-white text-center font-semibold rounded-lg transition-colors"
        >
          Practice Again
        </a>
        <a
          href="/history"
          className="flex-1 py-3 border border-card-border text-foreground text-center rounded-lg hover:border-accent transition-colors"
        >
          View History
        </a>
      </div>
    </div>
  );
}
