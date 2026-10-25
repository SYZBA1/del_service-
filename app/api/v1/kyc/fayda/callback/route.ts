import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, userId, faydaFin } = body;

    // Simulated VeriFayda 2.0 eSignet OIDC exchange
    const resolvedFin = faydaFin || `FIN-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    let targetUser = userId ? db.users.find((u) => u.id === userId) : null;
    if (!targetUser && db.users.length > 0) {
      targetUser = db.users[db.users.length - 1]; // latest user
    }

    if (targetUser) {
      targetUser.faydaFinNumber = resolvedFin;
      targetUser.kycVerified = true;
      targetUser.kycDocuments = targetUser.kycDocuments || [];
      targetUser.kycDocuments.push({
        provider: "VeriFayda 2.0 eSignet OIDC",
        verifiedAt: new Date().toISOString(),
        authCode: code || "ESIGNET-AUTH-CODE-VERIFIED",
        status: "AUTHENTICATED",
      });
    }

    return NextResponse.json({
      success: true,
      message: "VeriFayda 2.0 national ID successfully verified.",
      user: targetUser,
      faydaProfile: {
        fin: resolvedFin,
        status: "VERIFIED",
        idType: "ETHIOPIAN_NATIONAL_Fayda_ID",
        verifiedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Fayda verification failed" }, { status: 500 });
  }
}
