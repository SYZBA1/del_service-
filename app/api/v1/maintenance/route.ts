import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const enriched = db.maintenanceSchedules.map((m) => {
      const asset = db.getAssetById(m.assetId);
      const mechanic = m.mechanicUserId ? db.users.find((u) => u.id === m.mechanicUserId) : null;
      return {
        ...m,
        asset,
        mechanicName: mechanic?.fullName,
      };
    });

    return NextResponse.json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch maintenance tasks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      assetId,
      status,
      mechanicNotes,
      mechanicUserId = "usr-006",
      isSafetyCriticalLock,
      serviceType = "preventative",
      nextServiceMeter,
    } = body;

    let schedule = id ? db.maintenanceSchedules.find((m) => m.id === id) : null;

    if (schedule) {
      if (status !== undefined) schedule.status = status;
      if (mechanicNotes !== undefined) schedule.mechanicNotes = mechanicNotes;
      if (isSafetyCriticalLock !== undefined) schedule.isSafetyCriticalLock = isSafetyCriticalLock;
      if (serviceType !== undefined) schedule.serviceType = serviceType;

      // If marked completed, clear maintenance lock on asset
      if (status === "completed") {
        schedule.isSafetyCriticalLock = false;
        const asset = db.getAssetById(schedule.assetId);
        if (asset && asset.status === "maintenance") {
          asset.status = "available";
        }
        if (nextServiceMeter) {
          schedule.nextServiceMeter = parseFloat(nextServiceMeter);
        } else if (asset) {
          // Add default interval (5,000 KM or 250 Engine Hours)
          const interval = asset.meterUnit === "odometer_km" ? 5000 : 250;
          schedule.nextServiceMeter = asset.currentMeterReading + interval;
        }
      }
    } else {
      if (!assetId) {
        return NextResponse.json({ error: "assetId is required" }, { status: 400 });
      }
      const asset = db.getAssetById(assetId);
      const interval = asset?.meterUnit === "odometer_km" ? 5000 : 250;
      schedule = {
        id: `mnt-${Date.now()}`,
        assetId,
        serviceIntervalKm: asset?.meterUnit === "odometer_km" ? 5000 : undefined,
        serviceIntervalHours: asset?.meterUnit === "engine_hours" ? 250 : undefined,
        lastServiceMeter: asset?.currentMeterReading || 0,
        nextServiceMeter: nextServiceMeter || (asset?.currentMeterReading || 0) + interval,
        status: status || "open",
        isSafetyCriticalLock: !!isSafetyCriticalLock,
        mechanicNotes,
        mechanicUserId,
        serviceType,
        createdAt: new Date().toISOString(),
      };
      db.maintenanceSchedules.push(schedule);
    }

    return NextResponse.json({
      success: true,
      message: "Maintenance schedule updated successfully",
      schedule,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update maintenance" }, { status: 500 });
  }
}
