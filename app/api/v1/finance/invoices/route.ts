import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Invoice } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isPaid = searchParams.get("isPaid");

    let list = [...db.invoices];
    if (isPaid !== null && isPaid !== undefined && isPaid !== "all") {
      list = list.filter((i) => String(i.isPaid) === isPaid);
    }

    const enriched = list.map((inv) => {
      const booking = db.bookings.find((b) => b.id === inv.bookingId);
      const bookingItems = db.bookingItems
        .filter((bi) => bi.bookingId === inv.bookingId)
        .map((bi) => ({
          ...bi,
          asset: bi.asset || db.getAssetById(bi.assetId),
          assignedOperator: bi.assignedOperator || (bi.assignedOperatorId ? db.getOperatorById(bi.assignedOperatorId) : null),
        }));
      const settlements = db.settlements.filter((s) => s.invoiceId === inv.id);
      const broker = inv.brokerId ? db.getBrokerById(inv.brokerId) : undefined;
      
      const primaryAsset = bookingItems[0]?.asset;
      const isCar = primaryAsset?.category === "passenger_car" || primaryAsset?.category === "commercial_van";
      const isMachinery = primaryAsset?.category === "heavy_machinery" || primaryAsset?.category === "power_equipment" || primaryAsset?.category === "attachment";

      const partnerCut = inv.partnerPayoutAmount || Math.round(inv.baseRentalAmount * 0.85);
      const brokerCut = inv.brokerCommissionAmount || (inv.brokerCommissionPct ? Math.round(inv.baseRentalAmount * (inv.brokerCommissionPct / 100)) : 0);
      const netProfit = Math.max(0, inv.totalPayable - partnerCut - brokerCut);

      return {
        ...inv,
        bookingReference: booking?.bookingReference,
        renterName: booking?.renterName,
        booking,
        bookingItems,
        primaryAsset,
        assetCategory: primaryAsset?.category,
        isCar,
        isMachinery,
        broker,
        partnerCut,
        brokerCut,
        netProfit,
        settlements,
      };
    });

    return NextResponse.json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to list invoices" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      bookingId,
      baseRentalAmount,
      overtimeUsageAmount = 0,
      operatorAndPerDiemAmount = 0,
      mobilizationAmount = 0,
      vat15PctAmount,
      withholding2PctAmount = 0,
      withholdingReceiptNo,
      totalPayable,
    } = body;

    const booking = db.bookings.find((b) => b.id === bookingId);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      bookingId,
      invoiceNumber: `INV-DEL-2026-${String(db.invoices.length + 50).padStart(4, "0")}`,
      baseRentalAmount: parseFloat(baseRentalAmount) || 0,
      overtimeUsageAmount: parseFloat(overtimeUsageAmount) || 0,
      operatorAndPerDiemAmount: parseFloat(operatorAndPerDiemAmount) || 0,
      mobilizationAmount: parseFloat(mobilizationAmount) || 0,
      vat15PctAmount: parseFloat(vat15PctAmount) || 0,
      withholding2PctAmount: parseFloat(withholding2PctAmount) || 0,
      withholdingReceiptNo,
      totalPayable: parseFloat(totalPayable) || 0,
      isPaid: false,
      createdAt: new Date().toISOString(),
    };

    db.invoices.push(newInvoice);

    return NextResponse.json({
      success: true,
      message: "Invoice generated successfully",
      invoice: newInvoice,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create invoice" }, { status: 500 });
  }
}
