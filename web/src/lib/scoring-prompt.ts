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

  const audienceDesc = AUDIENCE_LABELS[audience] || audience;
  const wordCount = explanation.split(/\s+/).filter(Boolean).length;

  // Time-based expectations (ported from Streamlit POC)
  let timeContext: string;
  let completenessNote: string;
  if (timerDuration <= 60) {
    timeContext =
      "very short time (≤60s) - expect bullet points or a brief paragraph covering key ideas only";
    completenessNote =
      "For this short timeframe, completeness means hitting 2-3 key points, not exhaustive coverage";
  } else if (timerDuration <= 120) {
    timeContext =
      "moderate time (60-120s) - expect 1-2 paragraphs with main concepts and an example";
    completenessNote =
      "Should cover main concepts with at least one concrete example or analogy";
  } else {
    timeContext =
      "extended time (>120s) - expect well-developed explanation with examples, nuance, and structure";
    completenessNote =
      "Should provide thorough coverage with examples, context, and possibly counterexamples";
  }

  return `You are an expert communication coach and subject matter expert in "${topic}". Evaluate how well someone explained a concept under time pressure.

## Context
- **Prompt given**: "${prompt}"
- **Target audience**: ${audienceDesc}
- **Difficulty level**: ${difficulty}
- **Time allowed**: ${timerDuration} seconds (${timeContext})
- **Time used**: ${timeUsed} seconds
- **Word count**: ${wordCount} words

## The Explanation
"""
${explanation}
"""

## Evaluation Guidelines

**Time-Adjusted Expectations**:
- ${completenessNote}
- Minor typos, grammar issues, or abrupt endings are acceptable given time pressure
- Prioritize clarity and accuracy over polish
- Judge completeness relative to the time constraint - shorter times should NOT be penalized for brevity

**Scoring Dimensions**:
1. **Clarity** (1-10): Is it understandable for the target audience?
2. **Accuracy** (1-10): Are the core concepts technically correct?
3. **Structure** (1-10): Is there logical flow (even if brief)?
4. **Completeness** (1-10): Does it cover what's reasonable given ${timerDuration} seconds?
5. **Conciseness** (1-10): Efficient use of limited time?

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
