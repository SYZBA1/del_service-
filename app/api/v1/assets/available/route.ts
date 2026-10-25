import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const startDate = searchParams.get("start");
    const endDate = searchParams.get("end");
    const ownerId = searchParams.get("ownerId");
    const minWeight = searchParams.get("minWeight");
    const transmission = searchParams.get("transmission");

    let assets = db.getAssets(ownerId || undefined);

    // Filter by category
    if (category && category !== "all") {
      assets = assets.filter((a) => a.category === category);
    }

    // Filter by JSONB specs
    if (minWeight) {
      const weightNum = parseFloat(minWeight);
      assets = assets.filter((a) => (a.specs.operatingWeightTons || 0) >= weightNum);
    }

    if (transmission) {
      assets = assets.filter((a) => a.specs.transmission === transmission);
    }

    // Anti-double-booking: exclude assets that have active bookings overlapping [startDate, endDate)
    if (startDate && endDate) {
      assets = assets.filter((asset) => {
        // If asset itself is under maintenance or retired, exclude
        if (asset.status === "maintenance" || asset.status === "retired") {
          return false;
        }

        const conflict = db.validateBookingItemConflict(asset.id, null, startDate, endDate);
        return !conflict.hasConflict;
      });
    }

    // Attach rate cards
    const enriched = assets.map((a) => ({
      ...a,
      rateCard: db.getRateCard(a.id),
      owner: db.fleetOwners.find((o) => o.id === a.ownerId),
    }));

    return NextResponse.json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch available assets" }, { status: 500 });
  }
}
