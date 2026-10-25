import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bookingItemId = searchParams.get("bookingItemId");

    let list = [...db.timesheets];
    if (bookingItemId) {
      list = list.filter((t) => t.bookingItemId === bookingItemId);
    }

    return NextResponse.json({
      success: true,
      count: list.length,
      data: list,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch timesheets" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      bookingItemId,
      timesheetDate,
      engineHoursStart,
      engineHoursEnd,
      idleBreakdownHours = 0,
      siteSupervisorName,
      siteSupervisorPhone,
      siteSignatureUrl,
      syncedOffline = false,
    } = body;

    if (!bookingItemId || !timesheetDate || engineHoursStart === undefined || engineHoursEnd === undefined) {
      return NextResponse.json(
        { error: "Booking item ID, date, and start/end engine hours are required." },
        { status: 400 }
      );
    }

    const start = parseFloat(engineHoursStart);
    const end = parseFloat(engineHoursEnd);
    const operatingHours = Math.max(0, end - start);

    const timesheet = db.recordTimesheet({
      bookingItemId,
      timesheetDate,
      engineHoursStart: start,
      engineHoursEnd: end,
      operatingHours,
      idleBreakdownHours: parseFloat(idleBreakdownHours) || 0,
      siteSupervisorName,
      siteSupervisorPhone,
      siteSignatureUrl,
      syncedOffline: !!syncedOffline,
    });

    return NextResponse.json({
      success: true,
      message: "Daily machinery timesheet recorded successfully.",
      timesheet,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to record timesheet" }, { status: 500 });
  }
}
