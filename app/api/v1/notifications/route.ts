import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { syncNotificationToCloud } from "@/lib/firebase-cloud";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role") || undefined;
    const division = searchParams.get("division") || undefined;
    const notifications = db.getNotifications(role, division);
    return NextResponse.json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load notifications" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      message,
      type = "kyc_validation",
      recipientRole = "dispatcher",
      targetDivision,
      bookingId,
      renterName,
      assetName,
      collateralType,
      contractFileName,
      contractFileSize,
      contractFileUrl,
      contractFileType,
    } = body;

    if (!title || !message) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
    }

    const notif = db.addNotification({
      title,
      message,
      type,
      recipientRole,
      targetDivision,
      bookingId,
      renterName,
      assetName,
      collateralType,
      contractFileName,
      contractFileSize,
      contractFileUrl,
      contractFileType: contractFileType || (contractFileName && /\.(png|jpe?g|webp)$/i.test(contractFileName) ? "image" : "pdf"),
    });

    // Synchronize notification to Cloud Firestore
    await syncNotificationToCloud(notif);

    return NextResponse.json(
      {
        success: true,
        message: "Notification logged successfully",
        data: notif,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create notification" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, action = "read", approverName = "Yonas Bekele", role } = body;

    if (action === "mark_all_read") {
      db.markAllNotificationsRead(role);
      return NextResponse.json({
        success: true,
        message: `All notifications for role ${role || "all"} marked as read`,
      });
    }

    if (!id) {
      return NextResponse.json({ error: "Notification ID is required" }, { status: 400 });
    }

    if (action === "approve") {
      const ok = db.approveKycNotification(id, approverName);
      if (!ok) return NextResponse.json({ error: "Notification not found" }, { status: 404 });
      const updated = db.notifications.find((n) => n.id === id);
      if (updated) await syncNotificationToCloud(updated);
      return NextResponse.json({ success: true, message: `Notification ${id} approved by ${approverName}` });
    } else if (action === "read") {
      const ok = db.markNotificationRead(id);
      if (!ok) return NextResponse.json({ error: "Notification not found" }, { status: 404 });
      const updated = db.notifications.find((n) => n.id === id);
      if (updated) await syncNotificationToCloud(updated);
      return NextResponse.json({ success: true, message: `Notification ${id} marked as read` });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update notification" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const action = searchParams.get("action");
    const role = searchParams.get("role") || undefined;

    if (action === "clear_all") {
      db.clearNotifications(role);
      return NextResponse.json({
        success: true,
        message: `All notifications cleared for role ${role || "all"}`,
      });
    }

    if (!id) {
      return NextResponse.json({ error: "Notification ID is required" }, { status: 400 });
    }

    const ok = db.deleteNotification(id);
    if (!ok) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Notification ${id} removed successfully`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete notification" }, { status: 500 });
  }
}
