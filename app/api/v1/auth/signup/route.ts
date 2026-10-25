import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { UserRole } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fullName,
      email,
      password,
      role = "head_dispatcher",
      phoneNumber = "+251911000000",
    } = body;

    if (!fullName || !email || !password) {
      return NextResponse.json({ error: "Full Name, Email, and Password are required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = db.users.find((u) => u.email?.toLowerCase() === normalizedEmail);

    if (existing) {
      return NextResponse.json({ error: `An account with email ${normalizedEmail} already exists. Please sign in or reset your password.` }, { status: 409 });
    }

    // Map 4-tier division and role display name
    let assignedDivision: "all" | "elshaday" | "liora" | "dalol" = "all";
    let roleDisplayName = "Head Dispatcher";

    if (role === "elshaday_admin") {
      assignedDivision = "elshaday";
      roleDisplayName = "Elshaday Admin (Car Rental Service)";
    } else if (role === "liora_admin") {
      assignedDivision = "liora";
      roleDisplayName = "Liora Admin (Machinery Rental Service)";
    } else if (role === "dalol_admin") {
      assignedDivision = "dalol";
      roleDisplayName = "Dalol Admin (Dalol Escrow & Cards)";
    } else {
      assignedDivision = "all";
      roleDisplayName = "Head Dispatcher";
    }

    // All new registrations require Super Admin / Head Dispatcher approval before sign in
    const status: "pending_approval" = "pending_approval";

    const newUser = db.registerUser({
      fullName,
      email: normalizedEmail,
      phoneNumber,
      role: role as UserRole,
      status,
      assignedDivision,
      confirmationEmailSent: true,
      kycVerified: true,
      faydaFinNumber: `FIN-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
    }, password);

    // Simulated Dispatched Confirmation Email Record
    const confirmationEmail = {
      to: newUser.email,
      recipientName: newUser.fullName,
      subject: `[DEL Services] Welcome & Registration Confirmation - ${roleDisplayName}`,
      body: `Hello ${newUser.fullName},\n\nThank you for registering for the DEL Services Operations Platform as a ${roleDisplayName}. Your registration has been received and a confirmation token has been logged.\n\nAccount Status: ${status === "active" ? "Active" : "Pending Head Dispatcher Approval"}.\n\nOnce Head Dispatcher reviews your account permissions, you will receive full access to the ${assignedDivision.toUpperCase()} workspace.`,
      dispatchedAt: new Date().toISOString(),
      activationToken: `ACT-${Date.now().toString(36).toUpperCase()}`,
    };

    // Trigger in-app Approval Notification to Head Dispatcher
    db.addNotification({
      title: `Role Approval: ${newUser.fullName} (${roleDisplayName})`,
      message: `${newUser.fullName} (${newUser.email}) registered for ${roleDisplayName}. Confirmation email sent to ${newUser.email}. Head Dispatcher authorization required to grant permissions and unlock terminal.`,
      type: "kyc_validation",
      recipientRole: "dispatcher",
    });

    return NextResponse.json({
      success: true,
      message: `Account created successfully for ${newUser.fullName}. Confirmation email sent to ${newUser.email}.`,
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        assignedDivision: newUser.assignedDivision,
        phoneNumber: newUser.phoneNumber,
        faydaFinNumber: newUser.faydaFinNumber,
      },
      confirmationEmail,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Registration error" }, { status: 500 });
  }
}
