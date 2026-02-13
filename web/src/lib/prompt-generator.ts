import { AudienceType, DifficultyLevel, Prompt } from "./types";
import { TOPIC_CONCEPTS, AUDIENCE_LABELS } from "./constants";
import { generateId } from "./utils";
import { sanitizePersona } from "./persona";

const TEMPLATES = [
  "[{topic}] Explain {concept} to {audience}.",
  "[{topic}] What is {concept} and why does it matter? Explain for {audience}.",
  "[{topic}] Describe how {concept} works to {audience}.",
  "[{topic}] Summarize {concept} in a way that {audience} would understand.",
  "[{topic}] What are the most important things to know about {concept}? Explain for {audience}.",
  "[{topic}] Walk through {concept} step by step for {audience}.",
  "[{topic}] If {audience} asked you about {concept}, what would you say?",
  "[{topic}] What common misconceptions exist about {concept}? Explain for {audience}.",
];

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generatePrompt(
  topic: string,
  difficulty: DifficultyLevel = "intermediate",
  customPersona?: string
): Prompt {
  const concepts = TOPIC_CONCEPTS[topic];
  const concept = concepts
    ? randomChoice(concepts)
    : `a key concept from ${topic}`;

  let audience: AudienceType;
  let audienceLabel: string;

  const sanitized = customPersona ? sanitizePersona(customPersona) : "";
  if (sanitized) {
    audience = "non-technical"; // fallback type for custom personas
    audienceLabel = sanitized;
  } else {
    const audienceKeys = Object.keys(AUDIENCE_LABELS) as AudienceType[];
    audience = randomChoice(audienceKeys);
    audienceLabel = AUDIENCE_LABELS[audience];
  }

  const template = randomChoice(TEMPLATES);
  const text = template
    .replace(/\{topic\}/g, topic)
    .replace(/\{concept\}/g, concept)
    .replace(/\{audience\}/g, audienceLabel);

  return {
    id: generateId(),
    text,
    topic,
    concept,
    audience,
    audienceLabel,  // This contains the custom persona or default label
    difficulty,
  };
}
