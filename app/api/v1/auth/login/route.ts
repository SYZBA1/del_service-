import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = db.authenticateUser(email, password);

    if (!user) {
      return NextResponse.json({
        error: "Invalid email or password. Please check your credentials or reset your password."
      }, { status: 401 });
    }

    if (user.status === "pending_approval") {
      return NextResponse.json({
        error: "Your account has been created and is awaiting Head Dispatcher / Super Admin approval before you can sign in."
      }, { status: 403 });
    }

    if (user.status === "rejected") {
      return NextResponse.json({
        error: "Access Denied: This account request was declined by the Head Dispatcher."
      }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      message: `Welcome back, ${user.fullName}!`,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status || "active",
        assignedDivision: user.assignedDivision || "all",
        phoneNumber: user.phoneNumber,
        faydaFinNumber: user.faydaFinNumber,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Authentication error" }, { status: 500 });
  }
}
