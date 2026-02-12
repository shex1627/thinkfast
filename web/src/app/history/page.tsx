"use client";

import { useState, useMemo } from "react";
import { useAttempts } from "@/hooks/useAttempts";
import {
  formatTime,
  formatTimerLabel,
  gradeColor,
  scoreColorText,
} from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function HistoryPage() {
  const { attempts, clearAll } = useAttempts();
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const topics = useMemo(() => {
    const set = new Set(attempts.map((a) => a.prompt.topic));
    return Array.from(set);
  }, [attempts]);

  const filtered = useMemo(() => {
    if (topicFilter === "all") return attempts;
    return attempts.filter((a) => a.prompt.topic === topicFilter);
  }, [attempts, topicFilter]);

  const chartData = useMemo(() => {
    return [...filtered]
      .reverse()
      .map((a, i) => ({
        index: i + 1,
        score: a.score.overall.score,
        topic: a.prompt.topic,
        date: new Date(a.createdAt).toLocaleDateString(),
      }));
  }, [filtered]);

  if (attempts.length === 0) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold mb-4">No History Yet</h1>
        <p className="text-muted mb-6">
          Complete a practice session to see your progress here.
        </p>
        <a
          href="/practice"
          className="px-6 py-3 bg-accent hover:bg-accent-light text-white font-medium rounded-lg transition-colors"
        >
          Start Practicing
        </a>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Practice History</h1>
        <span className="text-sm text-muted">{attempts.length} attempts</span>
      </div>

      {/* Progress Chart */}
      {chartData.length >= 2 && (
        <div className="p-4 rounded-lg bg-card border border-card-border mb-6">
          <h2 className="text-lg font-semibold mb-3">Progress Over Time</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e30" />
              <XAxis
                dataKey="index"
                stroke="#71717a"
                fontSize={12}
                label={{
                  value: "Attempt",
                  position: "insideBottom",
                  offset: -5,
                  fill: "#71717a",
                }}
              />
              <YAxis
                domain={[0, 10]}
                stroke="#71717a"
                fontSize={12}
                label={{
                  value: "Score",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#71717a",
                }}
              />
              <Tooltip
                contentStyle={{
                  background: "#141420",
                  border: "1px solid #1e1e30",
                  borderRadius: "8px",
                  color: "#ededed",
                }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any) => [`${value}/10`, "Score"]}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                labelFormatter={(label: any) =>
                  `Attempt #${label} — ${chartData[Number(label) - 1]?.topic || ""}`
                }
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ fill: "#6366f1", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setTopicFilter("all")}
          className={`px-3 py-1 rounded-full text-sm border transition-all ${
            topicFilter === "all"
              ? "bg-accent text-white border-accent"
              : "bg-card border-card-border text-muted hover:border-accent"
          }`}
        >
          All
        </button>
        {topics.map((t) => (
          <button
            key={t}
            onClick={() => setTopicFilter(t)}
            className={`px-3 py-1 rounded-full text-sm border transition-all ${
              topicFilter === t
                ? "bg-accent text-white border-accent"
                : "bg-card border-card-border text-muted hover:border-accent"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Attempt List */}
      <div className="space-y-3 mb-8">
        {filtered.map((attempt) => (
          <div
            key={attempt.id}
            className="rounded-lg bg-card border border-card-border overflow-hidden"
          >
            <button
              onClick={() =>
                setExpandedId(expandedId === attempt.id ? null : attempt.id)
              }
              className="w-full p-4 text-left flex items-center justify-between hover:bg-card-border/30 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{attempt.prompt.text}</p>
                <p className="text-sm text-muted">
                  {attempt.prompt.topic} &middot;{" "}
                  {formatTimerLabel(attempt.timerDuration)} &middot;{" "}
                  {new Date(attempt.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <span
                  className={`text-2xl font-bold ${scoreColorText(
                    attempt.score.overall.score
                  )}`}
                >
                  {attempt.score.overall.score}
                </span>
                <span
                  className={`text-lg font-semibold ${gradeColor(
                    attempt.score.overall.grade
                  )}`}
                >
                  {attempt.score.overall.grade}
                </span>
              </div>
            </button>

            {expandedId === attempt.id && (
              <div className="p-4 border-t border-card-border animate-fade-in">
                <p className="text-sm text-muted mb-3">
                  {attempt.score.overall.summary}
                </p>

                <div className="grid grid-cols-5 gap-2 mb-3">
                  {(
                    [
                      "clarity",
                      "accuracy",
                      "structure",
                      "completeness",
                      "conciseness",
                    ] as const
                  ).map((cat) => (
                    <div key={cat} className="text-center">
                      <div
                        className={`text-lg font-bold ${scoreColorText(
                          attempt.score[cat].score
                        )}`}
                      >
                        {attempt.score[cat].score}
                      </div>
                      <div className="text-xs text-muted capitalize">{cat}</div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted">Time used:</span>{" "}
                    {attempt.timeUsed}s / {attempt.timerDuration}s
                  </div>
                  <div>
                    <span className="text-muted">Words:</span>{" "}
                    {attempt.wordCount}
                  </div>
                </div>

                <details className="mt-3">
                  <summary className="text-xs text-muted cursor-pointer hover:text-foreground">
                    Your explanation
                  </summary>
                  <p className="mt-1 text-sm font-mono whitespace-pre-wrap text-muted">
                    {attempt.explanation}
                  </p>
                </details>

                {attempt.score.modelExplanation && (
                  <details className="mt-2">
                    <summary className="text-xs text-accent-light cursor-pointer hover:text-accent">
                      Model explanation
                    </summary>
                    <p className="mt-1 text-sm whitespace-pre-wrap text-muted">
                      {attempt.score.modelExplanation}
                    </p>
                  </details>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Clear All */}
      <div className="text-center">
        <button
          onClick={() => {
            if (confirm("Clear all history? This cannot be undone.")) {
              clearAll();
            }
          }}
          className="text-sm text-muted hover:text-red-400 transition-colors"
        >
          Clear All History
        </button>
      </div>
    </div>
  );
}
