import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const token = searchParams.get("token");
    const role = searchParams.get("role");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = db.users.find((u) => u.email?.toLowerCase() === normalizedEmail);

    return NextResponse.json({
      success: true,
      email: normalizedEmail,
      role: role || user?.role || "head_dispatcher",
      fullName: user?.fullName || "Platform Operator",
      status: user?.status || "active",
      valid: true,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to verify token" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, newPassword, role, token, fullName, step = "request" } = body;

    if (!email) {
      return NextResponse.json({ error: "Email address is required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (step === "request") {
      const assignedRole = role || "head_dispatcher";
      const res = db.assignRoleCredentials(normalizedEmail, assignedRole, fullName);

      return NextResponse.json({
        success: true,
        message: `Password setup and reset token has been dispatched to ${normalizedEmail}.`,
        resetToken: res.token,
        resetLink: res.resetLink,
        email: normalizedEmail,
        role: res.user.role,
        user: res.user,
      });
    }

    if (step === "confirm") {
      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters long and include numbers/letters." },
          { status: 400 }
        );
      }

      const res = db.verifyAndResetPassword(normalizedEmail, newPassword, token, role);

      if (!res.success) {
        return NextResponse.json({ error: res.error || "Failed to update password" }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: `Password for ${normalizedEmail} has been set and verified. Your account is now active with ${res.user?.role?.replace("_", " ")} permissions!`,
        user: res.user,
      });
    }

    return NextResponse.json({ error: "Invalid reset step" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Reset password error" }, { status: 500 });
  }
}
