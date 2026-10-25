import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateEthiopianQuote } from "@/lib/calculator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      assetId,
      days = 1,
      estimatedExtraUnits = 0,
      includeOperator = false,
      isOutOfCity = false,
      includeMobilization = false,
      isB2BCustomer = false,
      customerHasTin = false,
    } = body;

    const asset = db.getAssetById(assetId);
    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    const rateCard = db.getRateCard(assetId);
    if (!rateCard) {
      return NextResponse.json({ error: "Rate card not configured for asset" }, { status: 400 });
    }

    const owner = db.fleetOwners.find((o) => o.id === asset.ownerId);
    const platformCommissionPct = owner?.platformCommissionPct || 0;

    const quote = calculateEthiopianQuote(
      {
        asset,
        rateCard,
        days: parseInt(days, 10) || 1,
        estimatedExtraUnits: parseFloat(estimatedExtraUnits) || 0,
        includeOperator: !!includeOperator,
        isOutOfCity: !!isOutOfCity,
        includeMobilization: !!includeMobilization,
        isB2BCustomer: !!isB2BCustomer,
        customerHasTin: !!customerHasTin,
      },
      platformCommissionPct
    );

    return NextResponse.json({
      success: true,
      quote,
      asset: {
        id: asset.id,
        make: asset.make,
        model: asset.model,
        category: asset.category,
        plateNumber: asset.plateNumber,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Calculation failed" }, { status: 500 });
  }
}
