import { MAX_PERSONA_LENGTH } from "./constants";

const ALLOWED_CHARS = new Set(
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 -,.'"
);

export function sanitizePersona(persona: string): string {
  if (!persona) return "";

  let sanitized = persona.slice(0, MAX_PERSONA_LENGTH).trim();
  sanitized = Array.from(sanitized)
    .filter((c) => ALLOWED_CHARS.has(c))
    .join("");
  // Collapse whitespace
  sanitized = sanitized.replace(/\s+/g, " ").trim();

  return sanitized;
}
