import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bookingItemId = searchParams.get("bookingItemId");

    let list = [...db.inspections];
    if (bookingItemId) {
      list = list.filter((i) => i.bookingItemId === bookingItemId);
    }

    return NextResponse.json({
      success: true,
      count: list.length,
      data: list,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch inspections" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      bookingItemId,
      inspectionType = "check_out",
      inspectorUserId = "usr-003",
      meterReading,
      fuelPercentage = 100,
      damageMarkers = [],
      walkaroundPhotos = [],
    } = body;

    if (!bookingItemId || meterReading === undefined) {
      return NextResponse.json(
        { error: "Booking item ID and meter reading are required." },
        { status: 400 }
      );
    }

    const item = db.bookingItems.find((b) => b.id === bookingItemId);
    if (!item) {
      return NextResponse.json({ error: "Booking item not found" }, { status: 404 });
    }

    const inspector = db.users.find((u) => u.id === inspectorUserId);

    // Records inspection and executes database trigger fn_after_inspection_meter_sync
    const inspection = db.recordInspection({
      bookingItemId,
      inspectionType,
      inspectorUserId,
      inspectorName: inspector?.fullName,
      meterReading: parseFloat(meterReading),
      fuelPercentage: parseInt(fuelPercentage, 10),
      damageMarkers,
      walkaroundPhotos,
    });

    const asset = db.getAssetById(item.assetId);

    return NextResponse.json({
      success: true,
      message: "Inspection recorded and PostgreSQL meter sync trigger executed.",
      inspection,
      assetState: {
        id: asset?.id,
        currentMeterReading: asset?.currentMeterReading,
        status: asset?.status,
        isUnderMaintenance: asset?.status === "maintenance",
      },
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to record inspection" }, { status: 500 });
  }
}
