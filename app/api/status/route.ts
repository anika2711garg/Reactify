import { NextResponse } from "next/server";
import { getAiKeys } from "@/lib/ai/env";

export async function GET() {
  const { groqKey, googleKey } = getAiKeys();
  return NextResponse.json({
    groq: Boolean(groqKey),
    google: Boolean(googleKey),
    groqModel: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
    geminiModel: process.env.GEMINI_MODEL || "gemini-3.6-flash",
  });
}
