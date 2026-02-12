export type TopicCategory =
  | "technology"
  | "science"
  | "humanities"
  | "business"
  | "lifestyle"
  | "custom";

export interface Topic {
  id: string;
  name: string;
  category: TopicCategory;
}

export type AudienceType =
  | "child"
  | "teenager"
  | "non-technical"
  | "peer"
  | "executive"
  | "interviewer";

export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

export interface Prompt {
  id: string;
  text: string;
  topic: string;
  concept: string;
  audience: AudienceType;
  difficulty: DifficultyLevel;
}

export type TimerDuration = number; // seconds — user configurable

export interface ScoreCategory {
  score: number;
  feedback: string;
}

export interface ScoreResult {
  clarity: ScoreCategory;
  accuracy: ScoreCategory;
  structure: ScoreCategory;
  completeness: ScoreCategory;
  conciseness: ScoreCategory;
  overall: {
    score: number;
    grade: string;
    summary: string;
    strengths: string[];
    improvements: string[];
  };
  modelExplanation: string;
}

export interface Attempt {
  id: string;
  prompt: Prompt;
  explanation: string;
  timerDuration: number;
  timeUsed: number;
  wordCount: number;
  score: ScoreResult;
  createdAt: string;
}

export interface ScoreRequest {
  prompt: string;
  explanation: string;
  topic: string;
  audience: AudienceType;
  difficulty: DifficultyLevel;
  timerDuration: number;
  timeUsed: number;
}

export interface ScoreResponse {
  success: boolean;
  result?: ScoreResult;
  error?: string;
}

export type PracticePhase =
  | "TOPIC_SELECT"
  | "PROMPT_DISPLAY"
  | "TYPING"
  | "SUBMITTING"
  | "RESULTS";
