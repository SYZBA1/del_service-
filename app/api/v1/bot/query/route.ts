import { NextRequest, NextResponse } from "next/server";
import { processDelsBotQuery } from "@/lib/dels-bot-engine";
import { UserRole } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      message = "",
      role = "head_dispatcher",
      language = "en",
      division = "all",
    } = body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Query message is required." },
        { status: 400 }
      );
    }

    const response = processDelsBotQuery({
      message,
      role: role as UserRole,
      language: language as 'en' | 'am',
      division,
    });

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process Del's Bot query" },
      { status: 500 }
    );
  }
}
