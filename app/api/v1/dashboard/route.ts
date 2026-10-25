import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ownerId = searchParams.get("ownerId");

    const assets = db.getAssets(ownerId || undefined);
    const totalAssets = assets.length;
    const onRentAssets = assets.filter((a) => a.status === "on_rent").length;
    const fleetUtilizationPct = totalAssets > 0 ? Math.round((onRentAssets / totalAssets) * 100) : 0;

    const heavyMachineryOnRent = assets.filter(
      (a) => a.status === "on_rent" && (a.category === "heavy_machinery" || a.category === "power_equipment")
    ).length;
    const carsOnRent = assets.filter(
      (a) => a.status === "on_rent" && (a.category === "passenger_car" || a.category === "commercial_van")
    ).length;

    const pendingGuarantorChecks = db.collaterals.filter((c) => !c.isVerified).length;
    const overdueMaintenanceLocks = db.maintenanceSchedules.filter((m) => m.isSafetyCriticalLock).length;

    // GPS Locations for Live Map
    const gpsPins = assets
      .filter((a) => a.gpsLocation)
      .map((a) => ({
        id: a.id,
        assetName: `${a.make} ${a.model}`,
        category: a.category,
        plateNumber: a.plateNumber || a.chassisOrSerialNumber,
        status: a.status,
        meterReading: a.currentMeterReading,
        meterUnit: a.meterUnit,
        location: a.gpsLocation!,
      }));

    // Real-time Alert Queue
    const alerts: Array<{
      id: string;
      level: "critical" | "warning" | "info";
      title: string;
      message: string;
      assetId?: string;
      timestamp: string;
    }> = [];

    // 1. Geofence Breaches
    assets.forEach((a) => {
      if (a.gpsLocation?.status === "geofence_breach") {
        alerts.push({
          id: `alt-geo-${a.id}`,
          level: "critical",
          title: "GEOFENCE BREACH DETECTED",
          message: `${a.make} ${a.model} (${a.plateNumber}) moved outside authorized project boundary at ${a.gpsLocation.address}.`,
          assetId: a.id,
          timestamp: a.gpsLocation.lastUpdated,
        });
      }
    });

    // 2. Safety Maintenance Locks
    db.maintenanceSchedules.forEach((m) => {
      if (m.isSafetyCriticalLock) {
        const asset = db.getAssetById(m.assetId);
        alerts.push({
          id: `alt-maint-${m.id}`,
          level: "critical",
          title: "SAFETY-CRITICAL ENGINE LOCK",
          message: `${asset?.make} ${asset?.model} exceeded ${m.serviceIntervalHours || m.serviceIntervalKm} ${asset?.meterUnit === 'odometer_km' ? 'KM' : 'Hours'} service threshold (${asset?.currentMeterReading} units). Ignition interlock engaged.`,
          assetId: m.assetId,
          timestamp: "Active Now",
        });
      }
    });

    // 3. Pending Guarantor / KYC Checks
    db.collaterals.forEach((c) => {
      if (!c.isVerified) {
        const b = db.bookings.find((bk) => bk.id === c.bookingId);
        alerts.push({
          id: `alt-col-${c.id}`,
          level: "warning",
          title: "PENDING GUARANTOR VERIFICATION",
          message: `Booking ${b?.bookingReference}: ${c.guarantorFullName || c.collateralType} verification required before dispatch unlock.`,
          timestamp: "Pending",
        });
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        kpis: {
          fleetUtilizationPct,
          activeOnRentTotal: onRentAssets,
          heavyMachineryOnRent,
          carsOnRent,
          pendingGuarantorChecks,
          overdueMaintenanceLocks,
          totalFleetCount: totalAssets,
          totalTenants: db.fleetOwners.length,
        },
        gpsPins,
        alerts,
        recentBookings: db.bookings.slice(-5).reverse(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load dashboard data" }, { status: 500 });
  }
}
