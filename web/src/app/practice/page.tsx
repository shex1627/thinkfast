"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTimer } from "@/hooks/useTimer";
import { useScoring } from "@/hooks/useScoring";
import { useAttempts } from "@/hooks/useAttempts";
import { storage } from "@/lib/storage";
import { PRESET_TOPICS, TIMER_PRESETS, DEFAULT_TIMER, TOPIC_CONCEPTS, CATEGORY_COLORS, MAX_PERSONA_LENGTH } from "@/lib/constants";
import { sanitizePersona } from "@/lib/persona";
import { generatePrompt } from "@/lib/prompt-generator";
import { generateId, formatTime, wordCount, scoreColor, scoreColorText, gradeColor, formatTimerLabel } from "@/lib/utils";
import type { Prompt, ScoreResult, PracticePhase, Topic } from "@/lib/types";

export default function PracticePage() {
  // --- State ---
  const [phase, setPhase] = useState<PracticePhase>("TOPIC_SELECT");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [customTopicInput, setCustomTopicInput] = useState("");
  const [customTopics, setCustomTopics] = useState<string[]>([]);
  const [timerDuration, setTimerDuration] = useState(DEFAULT_TIMER);
  const [currentTopic, setCurrentTopic] = useState("");
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [explanation, setExplanation] = useState("");
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [customPersona, setCustomPersona] = useState("");

  const timer = useTimer(timerDuration);
  const { isScoring, error: scoringError, requestScore } = useScoring();
  const { addAttempt } = useAttempts();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load saved state
  useEffect(() => {
    const saved = storage.getCustomTopics();
    if (saved.length) setCustomTopics(saved);
    const savedTimer = storage.getTimerDuration();
    if (savedTimer) setTimerDuration(savedTimer);
    const savedPersona = storage.getCustomPersona();
    if (savedPersona) setCustomPersona(savedPersona);
  }, []);

  // Auto-submit when timer expires
  useEffect(() => {
    if (timer.isExpired && phase === "TYPING" && explanation.trim()) {
      handleSubmit();
    }
  }, [timer.isExpired]); // eslint-disable-line react-hooks/exhaustive-deps

  const allTopics = [
    ...PRESET_TOPICS.map((t) => t.name),
    ...customTopics,
  ];
  const activeTopics = selectedTopics.length > 0 ? selectedTopics : allTopics;

  // --- Handlers ---
  const toggleTopic = (name: string) => {
    setSelectedTopics((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]
    );
  };

  const addCustomTopic = () => {
    const topic = customTopicInput.trim();
    if (!topic || customTopics.includes(topic)) return;
    const updated = [...customTopics, topic];
    setCustomTopics(updated);
    setSelectedTopics((prev) => [...prev, topic]);
    storage.saveCustomTopics(updated);
    setCustomTopicInput("");
  };

  const handleTimerChange = (duration: number) => {
    setTimerDuration(duration);
    storage.saveTimerDuration(duration);
  };

  const handleGeneratePrompt = () => {
    const topic =
      activeTopics[Math.floor(Math.random() * activeTopics.length)];
    setCurrentTopic(topic);
    setPrompt(generatePrompt(topic, "intermediate", customPersona));
    setExplanation("");
    setScoreResult(null);
    setPhase("PROMPT_DISPLAY");
  };

  const handleStartTyping = () => {
    setPhase("TYPING");
    setStartTime(Date.now());
    timer.reset();
    timer.start();
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleSubmit = useCallback(async () => {
    if (!prompt || !explanation.trim()) return;
    timer.pause();
    setPhase("SUBMITTING");

    const timeUsed = Math.min(
      Math.round((Date.now() - startTime) / 1000),
      timerDuration
    );

    const result = await requestScore({
      prompt: prompt.text,
      explanation: explanation.trim(),
      topic: currentTopic,
      audience: prompt.audienceLabel,  // Use audienceLabel to include custom personas
      difficulty: prompt.difficulty,
      timerDuration,
      timeUsed,
    });

    if (result) {
      setScoreResult(result);
      addAttempt({
        id: generateId(),
        prompt,
        explanation: explanation.trim(),
        timerDuration,
        timeUsed,
        wordCount: wordCount(explanation),
        score: result,
        createdAt: new Date().toISOString(),
      });
      setPhase("RESULTS");
    } else {
      setPhase("TYPING");
    }
  }, [prompt, explanation, startTime, timerDuration, currentTopic, requestScore, addAttempt, timer]);

  const handleReset = () => {
    setPhase("TOPIC_SELECT");
    setPrompt(null);
    setExplanation("");
    setScoreResult(null);
    timer.reset();
  };

  const handleTryAgain = () => {
    handleGeneratePrompt();
  };

  // --- Render ---
  return (
    <div className="max-w-2xl mx-auto">
      {/* ===== TOPIC SELECT ===== */}
      {phase === "TOPIC_SELECT" && (
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Choose Your Topics</h1>
          <p className="text-muted mb-6">
            Select the topics you want to practice explaining. We&apos;ll pick a
            random concept from your selection.
          </p>

          {/* Topic Grid */}
          <div className="flex flex-wrap gap-2 mb-6">
            {PRESET_TOPICS.map((topic) => {
              const isSelected = selectedTopics.includes(topic.name);
              return (
                <button
                  key={topic.id}
                  onClick={() => toggleTopic(topic.name)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                    isSelected
                      ? "bg-accent text-white border-accent"
                      : `${CATEGORY_COLORS[topic.category]} hover:border-accent`
                  }`}
                >
                  {topic.name}
                </button>
              );
            })}
            {customTopics.map((topic) => {
              const isSelected = selectedTopics.includes(topic);
              return (
                <button
                  key={topic}
                  onClick={() => toggleTopic(topic)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                    isSelected
                      ? "bg-accent text-white border-accent"
                      : "bg-gray-100 text-gray-800 border-gray-200 hover:border-accent"
                  }`}
                >
                  {topic}
                </button>
              );
            })}
          </div>

          {/* Custom Topic Input */}
          <div className="flex gap-2 mb-8">
            <input
              type="text"
              value={customTopicInput}
              onChange={(e) => setCustomTopicInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustomTopic()}
              placeholder="Add a custom topic..."
              className="flex-1 px-4 py-2 rounded-lg bg-card border border-card-border text-foreground placeholder-muted focus:outline-none focus:border-accent"
            />
            <button
              onClick={addCustomTopic}
              disabled={!customTopicInput.trim()}
              className="px-4 py-2 bg-card border border-card-border text-foreground rounded-lg hover:border-accent disabled:opacity-40 transition-colors"
            >
              Add
            </button>
          </div>

          {/* Timer Config */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3">Timer Duration</h2>
            <div className="flex flex-wrap gap-2">
              {TIMER_PRESETS.map((t) => (
                <button
                  key={t}
                  onClick={() => handleTimerChange(t)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    timerDuration === t
                      ? "bg-accent text-white border-accent"
                      : "bg-card border-card-border text-foreground hover:border-accent"
                  }`}
                >
                  {formatTimerLabel(t)}
                </button>
              ))}
            </div>
            {/* Custom timer input */}
            <div className="flex gap-2 mt-3 items-center">
              <input
                type="number"
                min={10}
                max={600}
                placeholder="Custom (sec)"
                className="w-36 px-3 py-2 rounded-lg bg-card border border-card-border text-foreground placeholder-muted text-sm focus:outline-none focus:border-accent"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const val = parseInt((e.target as HTMLInputElement).value);
                    if (val >= 10 && val <= 600) handleTimerChange(val);
                  }
                }}
              />
              <span className="text-sm text-muted">10–600 seconds</span>
            </div>
          </div>

          {/* Custom Persona */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3">Audience / Persona</h2>
            <p className="text-sm text-muted mb-2">
              Leave blank for a random audience, or define your own.
            </p>
            <input
              type="text"
              value={customPersona}
              onChange={(e) => {
                const value = e.target.value;
                setCustomPersona(value);
                storage.saveCustomPersona(value);
              }}
              maxLength={MAX_PERSONA_LENGTH}
              placeholder="e.g., a curious teenager"
              className="w-full px-4 py-2 rounded-lg bg-card border border-card-border text-foreground placeholder-muted focus:outline-none focus:border-accent"
            />
            {customPersona && (
              <p className="text-xs text-muted mt-1">
                {sanitizePersona(customPersona) !== customPersona.trim().slice(0, MAX_PERSONA_LENGTH) ? (
                  <span className="text-yellow-400">Some characters were filtered for security. </span>
                ) : null}
                {sanitizePersona(customPersona) && (
                  <span>Will use: <span className="text-foreground">{sanitizePersona(customPersona)}</span></span>
                )}
              </p>
            )}
          </div>

          {/* Start Button */}
          <button
            onClick={handleGeneratePrompt}
            className="w-full py-4 bg-accent hover:bg-accent-light text-white text-lg font-semibold rounded-lg transition-colors animate-pulse-glow"
          >
            Generate Prompt
          </button>
          {selectedTopics.length === 0 && (
            <p className="text-sm text-muted mt-2 text-center">
              No topics selected — we&apos;ll use all {allTopics.length} topics
            </p>
          )}
        </div>
      )}

      {/* ===== PROMPT DISPLAY ===== */}
      {phase === "PROMPT_DISPLAY" && prompt && (
        <div className="animate-fade-in">
          <p className="text-sm text-muted mb-2">
            Topic: <span className="text-foreground font-medium">{currentTopic}</span>
          </p>
          <div className="p-6 rounded-lg bg-card border border-card-border mb-6">
            <h2 className="text-2xl font-semibold">{prompt.text}</h2>
          </div>
          <p className="text-muted mb-6">
            You have <span className="text-foreground font-bold">{formatTimerLabel(timerDuration)}</span> to
            type your explanation. Ready?
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleStartTyping}
              className="flex-1 py-3 bg-accent hover:bg-accent-light text-white font-semibold rounded-lg transition-colors text-lg"
            >
              Start Timer
            </button>
            <button
              onClick={handleGeneratePrompt}
              className="px-6 py-3 border border-card-border text-foreground rounded-lg hover:border-accent transition-colors"
            >
              Skip
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 border border-card-border text-muted rounded-lg hover:border-accent transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {/* ===== TYPING ===== */}
      {(phase === "TYPING" || phase === "SUBMITTING") && prompt && (
        <div className="animate-fade-in">
          <div className="p-4 rounded-lg bg-card border border-card-border mb-4">
            <p className="text-lg font-medium">{prompt.text}</p>
          </div>

          {/* Timer Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span
                className={`text-2xl font-mono font-bold ${
                  timer.percentRemaining > 50
                    ? "text-green-400"
                    : timer.percentRemaining > 20
                    ? "text-yellow-400"
                    : "text-red-400"
                }`}
              >
                {formatTime(timer.timeRemaining)}
              </span>
              <span className="text-sm text-muted">
                {wordCount(explanation)} words
              </span>
            </div>
            <div className="w-full h-2 bg-card-border rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                  timer.percentRemaining > 50
                    ? "bg-green-500"
                    : timer.percentRemaining > 20
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${timer.percentRemaining}%` }}
              />
            </div>
          </div>

          {/* Text Area */}
          <textarea
            ref={textareaRef}
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            disabled={timer.isExpired || phase === "SUBMITTING"}
            placeholder="Start typing your explanation..."
            className="w-full h-64 p-4 rounded-lg bg-card border border-card-border text-foreground font-mono text-sm resize-none focus:outline-none focus:border-accent placeholder-muted disabled:opacity-50"
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                handleSubmit();
              }
            }}
          />

          {/* Submit */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSubmit}
              disabled={!explanation.trim() || phase === "SUBMITTING"}
              className="flex-1 py-3 bg-accent hover:bg-accent-light text-white font-semibold rounded-lg transition-colors disabled:opacity-40"
            >
              {phase === "SUBMITTING" ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Claude is scoring...
                </span>
              ) : (
                "Submit (Cmd+Enter)"
              )}
            </button>
            <button
              onClick={handleReset}
              disabled={phase === "SUBMITTING"}
              className="px-6 py-3 border border-card-border text-muted rounded-lg hover:border-accent transition-colors disabled:opacity-40"
            >
              Cancel
            </button>
          </div>

          {scoringError && (
            <p className="mt-3 text-red-400 text-sm">{scoringError}</p>
          )}
        </div>
      )}

      {/* ===== RESULTS ===== */}
      {phase === "RESULTS" && scoreResult && prompt && (
        <div className="animate-fade-in">
          {/* Overall Score */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-4 p-6 rounded-xl bg-card border border-card-border">
              <div>
                <div className={`text-6xl font-bold ${scoreColorText(scoreResult.overall.score)}`}>
                  {scoreResult.overall.score}
                </div>
                <div className="text-sm text-muted">/10</div>
              </div>
              <div className="text-left">
                <div className={`text-3xl font-bold ${gradeColor(scoreResult.overall.grade)}`}>
                  {scoreResult.overall.grade}
                </div>
                <div className="text-sm text-muted">
                  {currentTopic} &middot; {formatTimerLabel(timerDuration)}
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="p-4 rounded-lg bg-card border border-card-border mb-6">
            <p className="text-foreground">{scoreResult.overall.summary}</p>
          </div>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-card border border-card-border">
              <h3 className="font-semibold text-green-400 mb-2">Strengths</h3>
              <ul className="text-sm text-muted space-y-1">
                {scoreResult.overall.strengths.map((s, i) => (
                  <li key={i}>- {s}</li>
                ))}
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-card border border-card-border">
              <h3 className="font-semibold text-yellow-400 mb-2">
                Areas to Improve
              </h3>
              <ul className="text-sm text-muted space-y-1">
                {scoreResult.overall.improvements.map((s, i) => (
                  <li key={i}>- {s}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Category Breakdown */}
          <h3 className="text-lg font-semibold mb-3">Score Breakdown</h3>
          <div className="space-y-3 mb-6">
            {(
              ["clarity", "accuracy", "structure", "completeness", "conciseness"] as const
            ).map((cat) => {
              const data = scoreResult[cat];
              return (
                <div
                  key={cat}
                  className="p-4 rounded-lg bg-card border border-card-border"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium capitalize">{cat}</span>
                    <span className={`font-bold ${scoreColorText(data.score)}`}>
                      {data.score}/10
                    </span>
                  </div>
                  <div className="w-full h-2 bg-card-border rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full animate-score-fill ${scoreColor(data.score)}`}
                      style={{ width: `${data.score * 10}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted">{data.feedback}</p>
                </div>
              );
            })}
          </div>

          {/* Your Explanation */}
          <details className="mb-4">
            <summary className="cursor-pointer text-sm text-muted hover:text-foreground transition-colors">
              Your explanation
            </summary>
            <div className="mt-2 p-4 rounded-lg bg-card border border-card-border">
              <div className="text-sm text-muted mb-2">
                Prompt: <span className="text-foreground">{prompt.text}</span>
              </div>
              <p className="font-mono text-sm whitespace-pre-wrap">
                {explanation}
              </p>
            </div>
          </details>

          {/* Model Explanation */}
          {scoreResult.modelExplanation && (
            <details className="mb-6">
              <summary className="cursor-pointer text-sm text-accent-light hover:text-accent transition-colors">
                Model explanation (reference answer)
              </summary>
              <div className="mt-2 p-4 rounded-lg bg-card border border-accent/30">
                <p className="text-sm whitespace-pre-wrap">
                  {scoreResult.modelExplanation}
                </p>
              </div>
            </details>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleTryAgain}
              className="flex-1 py-3 bg-accent hover:bg-accent-light text-white font-semibold rounded-lg transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={handleReset}
              className="flex-1 py-3 border border-card-border text-foreground rounded-lg hover:border-accent transition-colors"
            >
              Change Topics
            </button>
            <a
              href="/history"
              className="flex-1 py-3 border border-card-border text-muted rounded-lg hover:border-accent transition-colors text-center"
            >
              View History
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
