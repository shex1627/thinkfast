import { AudienceType, DifficultyLevel } from "./types";
import { AUDIENCE_LABELS } from "./constants";

interface ScoringPromptParams {
  prompt: string;
  explanation: string;
  topic: string;
  audience: AudienceType;
  difficulty: DifficultyLevel;
  timerDuration: number;
  timeUsed: number;
}

export function buildScoringPrompt(params: ScoringPromptParams): string {
  const {
    prompt,
    explanation,
    topic,
    audience,
    difficulty,
    timerDuration,
    timeUsed,
  } = params;

  const audienceDesc = AUDIENCE_LABELS[audience];
  const wordCount = explanation.split(/\s+/).filter(Boolean).length;

  return `You are an expert communication coach and subject matter expert in "${topic}". Evaluate how well someone explained a concept under time pressure.

## Context
- **Prompt given**: "${prompt}"
- **Target audience**: ${audienceDesc}
- **Difficulty level**: ${difficulty}
- **Time allowed**: ${timerDuration} seconds
- **Time used**: ${timeUsed} seconds
- **Word count**: ${wordCount} words

## The Explanation
"""
${explanation}
"""

## Task
Score this explanation on 5 dimensions (1-10 each). Be fair but constructive. Account for time pressure (${timerDuration}s) — minor typos or incomplete endings are expected.

### Dimensions
1. **Clarity** (1-10): Clear and understandable for ${audienceDesc}? Avoids unnecessary jargon?
2. **Accuracy** (1-10): Factually correct? Appropriate depth for "${difficulty}" level?
3. **Structure** (1-10): Logical flow? Clear beginning, middle, end?
4. **Completeness** (1-10): Key points covered given the time constraint?
5. **Conciseness** (1-10): Efficient communication? No unnecessary repetition?

### Overall
Weighted: Clarity 25%, Accuracy 25%, Structure 20%, Completeness 15%, Conciseness 15%.

Also provide a model explanation — a concise, well-structured explanation that could realistically be typed within ${timerDuration} seconds, demonstrating ideal clarity and structure for ${audienceDesc}.

Respond with ONLY this JSON (no markdown fences, no preamble):

{
  "clarity": {"score": <1-10>, "feedback": "<2-3 sentences>"},
  "accuracy": {"score": <1-10>, "feedback": "<2-3 sentences>"},
  "structure": {"score": <1-10>, "feedback": "<2-3 sentences>"},
  "completeness": {"score": <1-10>, "feedback": "<2-3 sentences>"},
  "conciseness": {"score": <1-10>, "feedback": "<2-3 sentences>"},
  "overall": {
    "score": <1-10>,
    "grade": "<A+ to F>",
    "summary": "<2-3 sentences>",
    "strengths": ["<strength>", "<strength>"],
    "improvements": ["<improvement>", "<improvement>"]
  },
  "model_explanation": "<A concise, well-structured model explanation>"
}`;
}
