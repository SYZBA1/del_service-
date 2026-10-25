import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateEthiopianPhone } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phoneNumber, otpCode } = body;

    if (!phoneNumber) {
      return NextResponse.json({ error: "Phone number is required." }, { status: 400 });
    }

    if (!validateEthiopianPhone(phoneNumber)) {
      return NextResponse.json(
        { error: "Invalid Ethiopian phone format. Use +251 9XXXXXXXX or +251 7XXXXXXXX." },
        { status: 400 }
      );
    }

    // Default test OTP is 123456 or any 6 digit code for demo
    if (otpCode && otpCode.length !== 6) {
      return NextResponse.json({ error: "OTP must be a 6-digit number." }, { status: 400 });
    }

    // Find or create user
    let user = db.users.find((u) => u.phoneNumber.replace(/\s+/g, "") === phoneNumber.replace(/\s+/g, ""));
    if (!user) {
      user = {
        id: `usr-${Date.now()}`,
        fullName: "New Customer",
        phoneNumber,
        role: "renter",
        kycVerified: false,
        createdAt: new Date().toISOString(),
      };
      db.users.push(user);
    }

    // Determine tenant/owner if user is a fleet_owner or super_admin
    const owner = db.fleetOwners.find((o) => o.primaryUserId === user?.id);

    // Simulated JWT token payload
    const tokenPayload = {
      sub: user.id,
      fullName: user.fullName,
      role: user.role,
      owner_id: owner?.id || "tenant-001",
      kyc_verified: user.kycVerified,
      fayda_fin: user.faydaFinNumber || null,
      exp: Math.floor(Date.now() / 1000) + 86400 * 7, // 7 days
    };

    return NextResponse.json({
      success: true,
      token: `del_jwt_${Buffer.from(JSON.stringify(tokenPayload)).toString("base64")}`,
      user: tokenPayload,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Authentication failed" }, { status: 500 });
  }
}
