import { AudienceType, DifficultyLevel, Prompt } from "./types";
import { TOPIC_CONCEPTS, AUDIENCE_LABELS } from "./constants";
import { generateId } from "./utils";

const TEMPLATES = [
  "Explain {concept} to {audience}.",
  "What is {concept} and why does it matter? Explain for {audience}.",
  "Describe how {concept} works to {audience}.",
  "Summarize {concept} in a way that {audience} would understand.",
  "What are the most important things to know about {concept}? Explain for {audience}.",
  "Walk through {concept} step by step for {audience}.",
  "If {audience} asked you about {concept}, what would you say?",
  "What common misconceptions exist about {concept}? Explain for {audience}.",
];

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generatePrompt(
  topic: string,
  difficulty: DifficultyLevel = "intermediate"
): Prompt {
  const concepts = TOPIC_CONCEPTS[topic];
  const concept = concepts
    ? randomChoice(concepts)
    : `a key concept from ${topic}`;

  const audienceKeys = Object.keys(AUDIENCE_LABELS) as AudienceType[];
  const audience = randomChoice(audienceKeys);
  const audienceLabel = AUDIENCE_LABELS[audience];

  const template = randomChoice(TEMPLATES);
  const text = template
    .replace(/\{concept\}/g, concept)
    .replace(/\{audience\}/g, audienceLabel);

  return {
    id: generateId(),
    text,
    topic,
    concept,
    audience,
    difficulty,
  };
}
