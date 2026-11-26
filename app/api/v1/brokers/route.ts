import { NextRequest, NextResponse } from "next/server";
import { db, INITIAL_BROKERS } from "@/lib/db";
import { Broker } from "@/lib/types";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const region = searchParams.get("region");
    const specialization = searchParams.get("specialization");
    const status = searchParams.get("status");

    let brokers: Broker[] = [];

    // 1. Try reading from Cloud Firestore via Firebase Admin SDK
    if (adminDb) {
      try {
        const snap = await adminDb.collection("brokers").get();
        if (!snap.empty) {
          brokers = snap.docs.map((d) => d.data() as Broker);
        } else {
          // If collection is empty, seed initial brokers once
          const batch = adminDb.batch();
          for (const b of INITIAL_BROKERS) {
            const docRef = adminDb.collection("brokers").doc(b.id);
            batch.set(docRef, b);
          }
          await batch.commit();
          brokers = [...INITIAL_BROKERS];
        }
      } catch (cloudErr) {
        console.warn("Firestore Admin GET brokers error:", cloudErr);
      }
    }

    // 2. Fallback to memory store if Firestore read did not succeed
    if (brokers.length === 0) {
      brokers = db.getBrokers(search);
    } else {
      // Sync in-memory store with Firestore data
      db.brokers = brokers;
      if (search) {
        const q = search.toLowerCase();
        brokers = brokers.filter(
          (b) =>
            b.fullName.toLowerCase().includes(q) ||
            b.phoneNumber.toLowerCase().includes(q) ||
            b.address.toLowerCase().includes(q)
        );
      }
    }

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
      faydaFinStatus = "unverified",
      status = "active",
      specialization = "Heavy Machinery",
      dealsClosedCount = 0,
      totalCommissionPaidETB = 0,
      idDocumentUrl,
      idDocumentName,
      agreementDocumentUrl,
      agreementDocumentName,
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
      faydaFinStatus: faydaFinStatus || "unverified",
      status: status || "active",
      specialization: specialization || "All Assets",
      payoutBank: payoutBank || {
        bankName: "Commercial Bank of Ethiopia (CBE)",
        accountNumber: "1000000000000",
        accountHolderName: fullName,
      },
      dealsClosedCount: Number(dealsClosedCount) || 0,
      totalCommissionPaidETB: Number(totalCommissionPaidETB) || 0,
      idDocumentUrl: idDocumentUrl || undefined,
      idDocumentName: idDocumentName || undefined,
      agreementDocumentUrl: agreementDocumentUrl || undefined,
      agreementDocumentName: agreementDocumentName || undefined,
      notes: notes || undefined,
    });

    // Persist to Cloud Firestore if Admin SDK is configured
    if (adminDb) {
      try {
        await adminDb.collection("brokers").doc(newBroker.id).set(newBroker);
      } catch (cloudErr) {
        console.warn("Firestore Admin syncBroker error:", cloudErr);
      }
    }

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
    if (updates.dealsClosedCount !== undefined) {
      updates.dealsClosedCount = Number(updates.dealsClosedCount);
    }
    if (updates.totalCommissionPaidETB !== undefined) {
      updates.totalCommissionPaidETB = Number(updates.totalCommissionPaidETB);
    }

    const updated = db.updateBroker(id, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Broker not found." },
        { status: 404 }
      );
    }

    // Persist update to Cloud Firestore
    if (adminDb) {
      try {
        await adminDb.collection("brokers").doc(id).set(updated, { merge: true });
      } catch (cloudErr) {
        console.warn("Firestore Admin updateBroker error:", cloudErr);
      }
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

    // Delete from Cloud Firestore
    if (adminDb) {
      try {
        await adminDb.collection("brokers").doc(id).delete();
      } catch (cloudErr) {
        console.warn("Firestore Admin deleteBroker error:", cloudErr);
      }
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
