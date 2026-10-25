import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Asset, AssetRateCard } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ownerId = searchParams.get("ownerId");
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    let assets = db.getAssets(ownerId || undefined);

    if (category && category !== "all") {
      assets = assets.filter((a) => a.category === category);
    }
    if (status && status !== "all") {
      assets = assets.filter((a) => a.status === status);
    }

    const enriched = assets.map((a) => ({
      ...a,
      rateCard: db.getRateCard(a.id),
      owner: db.fleetOwners.find((o) => o.id === a.ownerId),
      parentAsset: a.parentAssetId ? db.getAssetById(a.parentAssetId) : null,
      attachments: db.assets.filter((child) => child.parentAssetId === a.id),
    }));

    return NextResponse.json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to list assets" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      ownerId = "tenant-001",
      parentAssetId = null,
      category,
      make,
      model,
      manufactureYear,
      plateNumber,
      chassisOrSerialNumber,
      libreCertificateNo,
      bolloExpiryDate,
      insuranceExpiryDate,
      meterUnit,
      currentMeterReading = 0,
      requiresCompanyOperator = false,
      gpsTrackerImei,
      specs = {},
      rateCard,
    } = body;

    if (!category || !make || !model || !chassisOrSerialNumber || !meterUnit) {
      return NextResponse.json(
        { error: "Missing required asset fields (category, make, model, chassisOrSerialNumber, meterUnit)." },
        { status: 400 }
      );
    }

    const newAsset: Asset = {
      id: `ast-${Date.now()}`,
      ownerId,
      parentAssetId,
      category,
      make,
      model,
      manufactureYear: parseInt(manufactureYear, 10) || 2024,
      plateNumber: plateNumber || undefined,
      chassisOrSerialNumber,
      libreCertificateNo,
      bolloExpiryDate,
      insuranceExpiryDate,
      meterUnit,
      currentMeterReading: parseFloat(currentMeterReading) || 0,
      requiresCompanyOperator: !!requiresCompanyOperator,
      gpsTrackerImei,
      status: "available",
      specs,
      gpsLocation: {
        lat: 9.01 + (Math.random() - 0.5) * 0.05,
        lng: 38.75 + (Math.random() - 0.5) * 0.05,
        speed: 0,
        address: "DEL Central Depot, Addis Ababa",
        status: "idle",
        lastUpdated: "Just registered",
      },
      createdAt: new Date().toISOString(),
    };

    db.assets.push(newAsset);

    if (rateCard) {
      const newRateCard: AssetRateCard = {
        id: `rc-${Date.now()}`,
        assetId: newAsset.id,
        dailyRate: parseFloat(rateCard.dailyRate) || 0,
        weeklyRate: parseFloat(rateCard.weeklyRate) || 0,
        monthlyRate: parseFloat(rateCard.monthlyRate) || 0,
        includedMeterUnitsPerDay: parseFloat(rateCard.includedMeterUnitsPerDay) || (meterUnit === "odometer_km" ? 200 : 8),
        overtimeRatePerUnit: parseFloat(rateCard.overtimeRatePerUnit) || 0,
        idleDayMinimumHours: parseFloat(rateCard.idleDayMinimumHours) || 4,
        operatorDailyRate: parseFloat(rateCard.operatorDailyRate) || 0,
        operatorPerDiemRate: parseFloat(rateCard.operatorPerDiemRate) || 0,
        defaultMobilizationFee: parseFloat(rateCard.defaultMobilizationFee) || 0,
        securityDepositAmount: parseFloat(rateCard.securityDepositAmount) || 0,
      };
      db.rateCards[newAsset.id] = newRateCard;
    }

    return NextResponse.json({
      success: true,
      message: "Asset and Rate Card registered successfully",
      asset: {
        ...newAsset,
        rateCard: db.getRateCard(newAsset.id),
      },
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create asset" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Asset ID is required for update" }, { status: 400 });
    }

    const updated = db.updateAsset(id, updates);
    if (!updated) {
      return NextResponse.json({ error: `Asset with ID ${id} not found` }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Asset ${updated.make} ${updated.model} updated successfully`,
      data: {
        ...updated,
        rateCard: db.getRateCard(updated.id),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update asset" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Asset ID is required" }, { status: 400 });
    }

    const ok = db.deleteAsset(id);
    if (!ok) {
      return NextResponse.json({ error: `Asset with ID ${id} not found` }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Asset ${id} deleted successfully from Fleet Registry`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete asset" }, { status: 500 });
  }
}
