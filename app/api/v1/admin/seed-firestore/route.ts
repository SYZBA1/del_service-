import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        {
          success: false,
          error: "Firebase Admin is not configured. Please fill in FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in .env.local",
        },
        { status: 500 }
      );
    }

    const results: Record<string, number> = {};

    // 1. Sync Assets
    const assets = db.getAssets();
    for (const a of assets) {
      await adminDb.collection("assets").doc(a.id).set(a, { merge: true });
    }
    results.assets = assets.length;

    // 2. Sync Operators & Drivers
    const operators = db.getOperators();
    for (const op of operators) {
      await adminDb.collection("operators").doc(op.id).set(op, { merge: true });
    }
    results.operators = operators.length;

    // 3. Sync Partners
    const partners = db.getPartners();
    for (const p of partners) {
      await adminDb.collection("partners").doc(p.id).set(p, { merge: true });
    }
    results.partners = partners.length;

    // 4. Sync Brokers
    const brokers = db.getBrokers();
    for (const b of brokers) {
      await adminDb.collection("brokers").doc(b.id).set(b, { merge: true });
    }
    results.brokers = brokers.length;

    // 5. Sync Users
    const users = db.getUsers();
    for (const u of users) {
      await adminDb.collection("users").doc(u.id).set(u, { merge: true });
    }
    results.users = users.length;

    // 6. Sync Bookings
    const bookings = db.getBookings();
    for (const bk of bookings) {
      await adminDb.collection("bookings").doc(bk.id).set(bk, { merge: true });
    }
    results.bookings = bookings.length;

    // 7. Sync Invoices
    const invoices = db.getInvoices();
    for (const inv of invoices) {
      await adminDb.collection("invoices").doc(inv.id).set(inv, { merge: true });
    }
    results.invoices = invoices.length;

    // 8. Sync Notifications
    const notifs = db.getNotifications();
    for (const n of notifs) {
      await adminDb.collection("notifications").doc(n.id).set(n, { merge: true });
    }
    results.notifications = notifs.length;

    return NextResponse.json({
      success: true,
      message: "Successfully seeded existing DEL Services ERP records to Firebase Cloud Firestore!",
      syncedCounts: results,
    });
  } catch (err: any) {
    console.error("Firestore seed error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ready",
    message: "Send a POST request to this endpoint to seed all DEL Services ERP records to Firestore.",
  });
}
