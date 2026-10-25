import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Broker } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const region = searchParams.get("region");
    const specialization = searchParams.get("specialization");
    const status = searchParams.get("status");

    let brokers = db.getBrokers(search);

    if (region && region !== "all") {
      brokers = brokers.filter(
        (b) =>
          b.regionLocation.region.toLowerCase().includes(region.toLowerCase()) ||
          (b.regionLocation.citySubcity && b.regionLocation.citySubcity.toLowerCase().includes(region.toLowerCase()))
      );
    }

    if (specialization && specialization !== "all") {
      brokers = brokers.filter(
        (b) => b.specialization?.toLowerCase() === specialization.toLowerCase()
      );
    }

    if (status && status !== "all") {
      brokers = brokers.filter((b) => b.status === status);
    }

    return NextResponse.json({
      success: true,
      count: brokers.length,
      data: brokers,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch brokers" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fullName,
      phoneNumber,
      email,
      address,
      regionLocation,
      commissionPct = 5.0,
      tinNumber,
      nationalIdNumber,
      faydaFinNumber,
      status = "active",
      specialization = "Heavy Machinery",
      payoutBank,
      notes,
    } = body;

    if (!fullName || !phoneNumber || !address) {
      return NextResponse.json(
        { success: false, error: "Full Name, Phone Number, and Address are required." },
        { status: 400 }
      );
    }

    const region = regionLocation?.region || "Addis Ababa";
    const citySubcity = regionLocation?.citySubcity || "Bole Subcity";

    const newBroker = db.addBroker({
      fullName,
      phoneNumber,
      email: email || undefined,
      address,
      regionLocation: {
        region,
        citySubcity,
      },
      commissionPct: Number(commissionPct) || 5.0,
      tinNumber: tinNumber || undefined,
      nationalIdNumber: nationalIdNumber || undefined,
      faydaFinNumber: faydaFinNumber || undefined,
      status: status || "active",
      specialization: specialization || "All Assets",
      payoutBank: payoutBank || {
        bankName: "Commercial Bank of Ethiopia (CBE)",
        accountNumber: "1000000000000",
        accountHolderName: fullName,
      },
      dealsClosedCount: 0,
      totalCommissionPaidETB: 0,
      notes: notes || undefined,
    });

    return NextResponse.json(
      {
        success: true,
        message: `Broker ${newBroker.fullName} successfully registered with ${newBroker.commissionPct}% commission.`,
        data: newBroker,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to register broker" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Broker ID is required for update." },
        { status: 400 }
      );
    }

    if (updates.commissionPct !== undefined) {
      updates.commissionPct = Number(updates.commissionPct);
    }

    const updated = db.updateBroker(id, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Broker not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Broker ${updated.fullName} updated successfully.`,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update broker" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body.id;
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Broker ID is required for deletion." },
        { status: 400 }
      );
    }

    const deleted = db.deleteBroker(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Broker not found or already deleted." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Broker successfully deleted.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete broker" },
      { status: 500 }
    );
  }
}
