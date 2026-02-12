import { z } from "zod";

export const scoreRequestSchema = z.object({
  prompt: z.string().min(1).max(1000),
  explanation: z.string().min(1).max(10000),
  topic: z.string().min(1).max(200),
  audience: z.enum([
    "child",
    "teenager",
    "non-technical",
    "peer",
    "executive",
    "interviewer",
  ]),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  timerDuration: z.number().min(10).max(600),
  timeUsed: z.number().min(0),
});
