import { NextRequest, NextResponse } from "next/server";
import { generatePrompt } from "@/lib/prompt-generator";
import type { DifficultyLevel } from "@/lib/types";

export async function GET(request: NextRequest) {
  const topic = request.nextUrl.searchParams.get("topic");
  const difficulty =
    (request.nextUrl.searchParams.get("difficulty") as DifficultyLevel) ||
    "intermediate";

  if (!topic) {
    return NextResponse.json(
      { success: false, error: "topic is required" },
      { status: 400 }
    );
  }

  const prompt = generatePrompt(topic, difficulty);
  return NextResponse.json({ success: true, prompt });
}
