import { NextRequest, NextResponse } from "next/server";
import { db, generateMock8Sides, INITIAL_PARTNERS } from "@/lib/db";
import { PartnerOnboarding } from "@/lib/types";
import { adminDb } from "@/lib/firebase-admin";
import { syncAssetToCloud, deleteAssetFromCloud } from "@/lib/firebase-cloud";

export async function GET(req: NextRequest) {
  try {
    let partners: PartnerOnboarding[] = [];

    // 1. Try reading from Cloud Firestore via Firebase Admin SDK
    if (adminDb) {
      try {
        const snap = await adminDb.collection("partners").get();
        if (!snap.empty) {
          partners = snap.docs.map((d) => d.data() as PartnerOnboarding);
        } else {
          // If Firestore collection is empty, seed initial partners once
          const batch = adminDb.batch();
          for (const p of INITIAL_PARTNERS) {
            const docRef = adminDb.collection("partners").doc(p.id);
            batch.set(docRef, p);
          }
          await batch.commit();
          partners = [...INITIAL_PARTNERS];
        }
      } catch (cloudErr) {
        console.warn("Firestore Admin GET partners error:", cloudErr);
      }
    }

    // 2. Fallback to memory store if Firestore read did not succeed
    if (partners.length === 0) {
      partners = db.getPartners();
    } else {
      // Sync in-memory store with Firestore data
      db.partners = partners;
    }

    return NextResponse.json({
      success: true,
      count: partners.length,
      data: partners,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load partners" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      ownerContact,
      ownerKycNidUrl,
      faydaFinNumber,
      libreCertificateNo,
      libreDocUrl,
      assetCategory = "passenger_car",
      condition = "excellent",
      make,
      model,
      manufactureYear = 2023,
      plateNumber,
      chassisOrSerialNumber,
      price,
      images8Sides,
      regionLocation,
      agreement,
      gps,
      deliveryClearance,
      specs,
    } = body;

    if (!ownerContact?.fullName || !ownerContact?.phoneNumber || !make || !model || !chassisOrSerialNumber || !libreCertificateNo) {
      return NextResponse.json(
        { error: "Owner Name, Phone, Make, Model, Chassis/Serial Number, and Libre Certificate No are required." },
        { status: 400 }
      );
    }

    // Default 8-side images if not uploaded or partial
    const isMachinery = assetCategory === "heavy_machinery" || assetCategory === "power_equipment";
    const fallback8Sides = generateMock8Sides(isMachinery ? "machinery" : "car", `${make} ${model}`);
    const resolved8Sides = {
      front: images8Sides?.front || fallback8Sides.front,
      front_right: images8Sides?.front_right || fallback8Sides.front_right,
      right_side: images8Sides?.right_side || fallback8Sides.right_side,
      rear_right: images8Sides?.rear_right || fallback8Sides.rear_right,
      rear: images8Sides?.rear || fallback8Sides.rear,
      rear_left: images8Sides?.rear_left || fallback8Sides.rear_left,
      left_side: images8Sides?.left_side || fallback8Sides.left_side,
      cabin_interior: images8Sides?.cabin_interior || fallback8Sides.cabin_interior,
    };

    const resolvedPrice = {
      dailyRate: parseFloat(price?.dailyRate) || 8500,
      weeklyRate: parseFloat(price?.weeklyRate) || (parseFloat(price?.dailyRate) || 8500) * 6,
      monthlyRate: parseFloat(price?.monthlyRate) || (parseFloat(price?.dailyRate) || 8500) * 22,
      securityDepositAmount: parseFloat(price?.securityDepositAmount) || 30000,
      overtimeRatePerUnit: parseFloat(price?.overtimeRatePerUnit) || 35,
    };

    const resolvedRegion = {
      region: regionLocation?.region || "Addis Ababa",
      citySubcity: regionLocation?.citySubcity || "Bole Sub-city",
      depotAddress: regionLocation?.depotAddress || "Partner Dedicated Depot, Addis Ababa",
    };

    const resolvedAgreement = {
      termsSigned: agreement?.termsSigned ?? true,
      commissionPct: parseFloat(agreement?.commissionPct) || (ownerContact.ownerTier === "corporate_partner" ? 10 : 15),
      signedDate: agreement?.signedDate || new Date().toISOString().split("T")[0],
      agreementDocUrl: agreement?.agreementDocUrl || "/contracts/partner-agreement.pdf",
    };

    const resolvedGps = {
      hasGps: !!gps?.hasGps,
      gpsTrackerImei: gps?.hasGps ? (gps?.gpsTrackerImei || `86549204910${Math.floor(1000 + Math.random() * 9000)}`) : undefined,
      trackerModel: gps?.hasGps ? (gps?.trackerModel || "Teltonika FMB920") : undefined,
    };

    const resolvedDeliveryClearance = {
      paymentMethod: deliveryClearance?.paymentMethod || "Telebirr SuperApp",
      bankName: deliveryClearance?.bankName || "Commercial Bank of Ethiopia",
      accountNumber: deliveryClearance?.accountNumber || "1000998877665",
      durationAvailableMonths: parseInt(deliveryClearance?.durationAvailableMonths, 10) || 12,
      handoverNotes: deliveryClearance?.handoverNotes || "Inspected and ready for DEL fleet deployment.",
      confirmed: !!deliveryClearance?.confirmed,
      confirmedAt: deliveryClearance?.confirmed ? new Date().toISOString() : undefined,
    };

    // Execute atomic creation of Partner and registered Asset in DatabaseStore
    const result = db.addPartnerAndAsset({
      ownerContact: {
        fullName: ownerContact.fullName,
        phoneNumber: ownerContact.phoneNumber,
        email: ownerContact.email,
        companyName: ownerContact.companyName,
        tinNumber: ownerContact.tinNumber,
        ownerTier: ownerContact.ownerTier || "individual_host",
      },
      ownerKycNidUrl: ownerKycNidUrl || "/mock/nid-partner.jpg",
      faydaFinNumber: faydaFinNumber || `FIN-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      libreCertificateNo,
      libreDocUrl: libreDocUrl || "/contracts/libre-document.pdf",
      assetCategory,
      condition,
      make,
      model,
      manufactureYear: parseInt(manufactureYear, 10) || 2023,
      plateNumber,
      chassisOrSerialNumber,
      price: resolvedPrice,
      images8Sides: resolved8Sides,
      regionLocation: resolvedRegion,
      agreement: resolvedAgreement,
      gps: resolvedGps,
      deliveryClearance: resolvedDeliveryClearance,
      specs,
    });

    // Sync to Cloud Firestore if Admin SDK is configured
    if (adminDb) {
      try {
        await adminDb.collection("partners").doc(result.partner.id).set(result.partner);
        if (result.asset) {
          await adminDb.collection("assets").doc(result.asset.id).set(result.asset);
        }
      } catch (cloudErr) {
        console.warn("Firestore Admin syncPartner error:", cloudErr);
      }
    }

    // Also sync asset to cloud
    if (result.asset) {
      await syncAssetToCloud(result.asset);
    }

    return NextResponse.json({
      success: true,
      message: `Partner '${ownerContact.fullName}' and asset '${make} ${model}' onboarded & synchronized to Fleet Registry.`,
      partner: result.partner,
      asset: result.asset,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to onboard partner" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Partner ID is required for update" }, { status: 400 });
    }

    const updated = db.updatePartner(id, updates);
    if (!updated) {
      return NextResponse.json({ error: `Partner with ID ${id} not found` }, { status: 404 });
    }

    // Persist update to Cloud Firestore
    if (adminDb) {
      try {
        await adminDb.collection("partners").doc(id).set(updated, { merge: true });
      } catch (cloudErr) {
        console.warn("Firestore Admin updatePartner error:", cloudErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Partner ${updated.ownerContact.fullName} updated successfully`,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update partner" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Partner ID is required" }, { status: 400 });
    }

    const partner = db.partners.find((p) => p.id === id);
    const assetPlate = partner?.plateNumber || partner?.chassisOrSerialNumber;
    const linkedAsset = assetPlate ? db.assets.find((a) => a.plateNumber === assetPlate || a.serialNumber === assetPlate) : null;

    const ok = db.deletePartner(id);
    if (!ok) {
      return NextResponse.json({ error: `Partner with ID ${id} not found` }, { status: 404 });
    }

    // Delete from Cloud Firestore
    if (adminDb) {
      try {
        await adminDb.collection("partners").doc(id).delete();
        if (linkedAsset) {
          await adminDb.collection("assets").doc(linkedAsset.id).delete();
        }
      } catch (cloudErr) {
        console.warn("Firestore Admin deletePartner error:", cloudErr);
      }
    }

    if (linkedAsset) {
      await deleteAssetFromCloud(linkedAsset.id);
    }

    return NextResponse.json({
      success: true,
      message: `Partner ${id} and linked asset removed successfully`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete partner" }, { status: 500 });
  }
}
