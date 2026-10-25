import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ownerId = searchParams.get("ownerId");
    const status = searchParams.get("status");

    let list = [...db.settlements];
    if (ownerId && ownerId !== "all") {
      list = list.filter((s) => s.ownerId === ownerId);
    }
    if (status && status !== "all") {
      list = list.filter((s) => s.settlementStatus === status);
    }

    return NextResponse.json({
      success: true,
      count: list.length,
      data: list,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch settlements" }, { status: 500 });
  }
}
