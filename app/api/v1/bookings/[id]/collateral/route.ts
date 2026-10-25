import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;
    const body = await req.json();
    const {
      collateralType,
      amount,
      bankName,
      instrumentReference,
      guarantorFullName,
      guarantorPhone,
      guarantorFaydaFin,
      guarantorEmployerTin,
      contractDocumentUrl,
      isVerified = true,
      verifiedByUserId = "usr-002",
    } = body;

    const booking = db.bookings.find((b) => b.id === bookingId);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (!collateralType || !amount) {
      return NextResponse.json(
        { error: "Collateral type and security amount are required." },
        { status: 400 }
      );
    }

    const collateral = db.recordCollateral({
      bookingId,
      collateralType,
      amount: parseFloat(amount) || 0,
      bankName,
      instrumentReference,
      guarantorFullName,
      guarantorPhone,
      guarantorFaydaFin,
      guarantorEmployerTin,
      contractDocumentUrl,
      isVerified: !!isVerified,
      verifiedByUserId,
      verifiedAt: isVerified ? new Date().toISOString() : undefined,
    });

    return NextResponse.json({
      success: true,
      message: `Collateral recorded and verified. Booking ${booking.bookingReference} unlocked for dispatch.`,
      collateral,
      bookingStatus: booking.status,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to record collateral" }, { status: 500 });
  }
}
