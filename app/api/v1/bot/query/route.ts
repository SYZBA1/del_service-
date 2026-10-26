import { NextRequest, NextResponse } from "next/server";
import { queryGeminiOrRag, isGeminiConfigured } from "@/lib/gemini";
import { UserRole } from "@/lib/types";
import { isAmharicText } from "@/lib/dels-bot-engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      message = "",
      role = "head_dispatcher",
      language,
    } = body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Query message is required." },
        { status: 400 }
      );
    }

    const detectedLang: 'en' | 'am' = language || (isAmharicText(message) ? 'am' : 'en');

    const result = await queryGeminiOrRag(
      message.trim(),
      role as UserRole,
      detectedLang
    );

    return NextResponse.json({
      success: true,
      data: {
        answer: result.text,
        language: result.language,
        isGeminiPowered: result.isGeminiPowered,
        isGeminiConfigured,
        roleScopedDivision: result.roleScopedDivision,
        isRestricted: result.isRestricted,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process Del's Bot query" },
      { status: 500 }
    );
  }
}
