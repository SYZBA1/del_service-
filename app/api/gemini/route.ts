import { NextRequest, NextResponse } from "next/server";
import { queryGeminiOrRag, isGeminiConfigured } from "@/lib/gemini";
import { UserRole } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt = "", role = "head_dispatcher", language } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const result = await queryGeminiOrRag(prompt, role as UserRole, language);

    return NextResponse.json({
      success: true,
      response: result.text,
      language: result.language,
      isGeminiPowered: result.isGeminiPowered,
      isConfigured: isGeminiConfigured,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gemini route error" }, { status: 500 });
  }
}
