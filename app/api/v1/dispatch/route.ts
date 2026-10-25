import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ownerId = searchParams.get("ownerId");

    const assets = db.getAssets(ownerId || undefined);
    const operators = db.getOperators();
    const bookingItems = db.bookingItems.map((item) => {
      const asset = db.getAssetById(item.assetId);
      const booking = db.bookings.find((b) => b.id === item.bookingId);
      const operator = item.assignedOperatorId
        ? db.operators.find((o) => o.id === item.assignedOperatorId) || db.users.find((u) => u.id === item.assignedOperatorId)
        : null;
      return {
        ...item,
        asset,
        booking,
        operator,
      };
    });

    const cars = assets.filter((a) => a.category === "passenger_car" || a.category === "commercial_van");
    const heavyMachinery = assets.filter((a) => a.category === "heavy_machinery" || a.category === "power_equipment");
    const attachments = assets.filter((a) => a.category === "attachment");

    return NextResponse.json({
      success: true,
      data: {
        cars,
        heavyMachinery,
        attachments,
        operators,
        bookingItems,
        tenants: db.fleetOwners,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load dispatch data" }, { status: 500 });
  }
}
