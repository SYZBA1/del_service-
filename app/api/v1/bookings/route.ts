import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { syncBookingToCloud } from "@/lib/firebase-cloud";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let bookings = [...db.bookings];
    if (status && status !== "all") {
      bookings = bookings.filter((b) => b.status === status);
    }

    const enriched = bookings.map((b) => {
      const items = db.bookingItems
        .filter((i) => i.bookingId === b.id)
        .map((i) => ({
          ...i,
          asset: db.getAssetById(i.assetId),
          assignedOperator: i.assignedOperatorId
            ? db.users.find((u) => u.id === i.assignedOperatorId)
            : null,
        }));

      const collateral = db.collaterals.find((c) => c.bookingId === b.id);
      const invoice = db.invoices.find((inv) => inv.bookingId === b.id);

      return {
        ...b,
        items,
        collateral,
        invoice,
      };
    });

    return NextResponse.json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to list bookings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      renterId = "usr-007",
      bookingChannel = "internal_desk",
      pickupLocation,
      dropoffLocation,
      projectSiteRegion,
      isOutOfCity = false,
      destinationName,
      destinationDistanceKm,
      roundTripDistanceKm,
      agreedDealKm,
      contractDocumentUrl,
      contractDocumentName,
      contractDocumentSize,
      contractDocumentType,
      items = [], // array of { assetId, assignedOperatorId, rentalPeriodStart, rentalPeriodEnd, mobilizationFeeCharged, meterStart, meterEnd, actualUsedUnits, agreedDealUnits, overageUnits, overageSurcharge }
    } = body;

    if (!pickupLocation || !dropoffLocation || items.length === 0) {
      return NextResponse.json(
        { error: "Booking requires pickup location, dropoff location, and at least 1 asset item." },
        { status: 400 }
      );
    }

    try {
      // Database transaction with GiST exclusion constraints check
      const result = db.createBookingWithItems({
        renterId,
        bookingChannel,
        pickupLocation,
        dropoffLocation,
        projectSiteRegion,
        isOutOfCity,
        destinationName,
        destinationDistanceKm,
        roundTripDistanceKm,
        agreedDealKm,
        contractDocumentUrl,
        contractDocumentName,
        contractDocumentSize,
        contractDocumentType,
        items,
      });

      // Synchronize booking and items to Cloud Firestore
      await syncBookingToCloud({ ...result.booking, items: result.items });

      return NextResponse.json({
        success: true,
        message: "Booking and bundled items created successfully.",
        booking: result.booking,
        items: result.items,
      }, { status: 201 });
    } catch (dbErr: any) {
      if (dbErr.code === "23P01") {
        // PostgreSQL GiST Exclusion constraint code
        return NextResponse.json(
          {
            error: "Double-Booking Exclusion Conflict (PostgreSQL GiST 23P01)",
            code: "23P01",
            constraint: "no_overlapping_asset_bookings",
            detail: dbErr.message,
          },
          { status: 409 }
        );
      }
      throw dbErr;
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create booking" }, { status: 500 });
  }
}
