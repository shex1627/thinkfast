import { Attempt } from "./types";

const ATTEMPTS_KEY = "thinkfast_attempts";
const TOPICS_KEY = "thinkfast_custom_topics";
const TIMER_KEY = "thinkfast_timer";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export const storage = {
  getAttempts(): Attempt[] {
    if (!isBrowser()) return [];
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    return raw ? JSON.parse(raw) : [];
  },

  saveAttempt(attempt: Attempt): void {
    const attempts = this.getAttempts();
    attempts.unshift(attempt);
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
  },

  getAttempt(id: string): Attempt | undefined {
    return this.getAttempts().find((a) => a.id === id);
  },

  deleteAttempt(id: string): void {
    const attempts = this.getAttempts().filter((a) => a.id !== id);
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
  },

  clearAll(): void {
    localStorage.removeItem(ATTEMPTS_KEY);
  },

  getCustomTopics(): string[] {
    if (!isBrowser()) return [];
    const raw = localStorage.getItem(TOPICS_KEY);
    return raw ? JSON.parse(raw) : [];
  },

  saveCustomTopics(topics: string[]): void {
    localStorage.setItem(TOPICS_KEY, JSON.stringify(topics));
  },

  getTimerDuration(): number | null {
    if (!isBrowser()) return null;
    const raw = localStorage.getItem(TIMER_KEY);
    return raw ? parseInt(raw, 10) : null;
  },

  saveTimerDuration(duration: number): void {
    localStorage.setItem(TIMER_KEY, duration.toString());
  },
};
