import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { scoreRequestSchema } from "@/lib/validators";
import { buildScoringPrompt } from "@/lib/scoring-prompt";
import type { ScoreResponse, ScoreResult } from "@/lib/types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(
  request: NextRequest
): Promise<NextResponse<ScoreResponse>> {
  try {
    const body = await request.json();
    const parsed = scoreRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request: " + parsed.error.message },
        { status: 400 }
      );
    }

    const scoringPrompt = buildScoringPrompt(parsed.data);

    const message = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 2000,
      messages: [{ role: "user", content: scoringPrompt }],
    });

    const responseText = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("");

    const jsonStart = responseText.indexOf("{");
    const jsonEnd = responseText.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) {
      return NextResponse.json(
        { success: false, error: "Failed to parse scoring response" },
        { status: 500 }
      );
    }

    const raw = JSON.parse(responseText.substring(jsonStart, jsonEnd + 1));

    const result: ScoreResult = {
      clarity: raw.clarity,
      accuracy: raw.accuracy,
      structure: raw.structure,
      completeness: raw.completeness,
      conciseness: raw.conciseness,
      overall: raw.overall,
      modelExplanation: raw.model_explanation || "",
    };

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Scoring error:", error);
    return NextResponse.json(
      { success: false, error: "Scoring failed. Check your API key." },
      { status: 500 }
    );
  }
}
