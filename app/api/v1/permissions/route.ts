import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { dispatchBrandedRoleEmail } from "@/lib/email-service";

export interface RoleSpec {
  id: string;
  name: string;
  division: string;
  description: string;
  badgeColor: string;
  permissions: {
    canViewAllDivisions: boolean;
    canManageCars: boolean;
    canManageMachinery: boolean;
    canManageDalol: boolean;
    canApproveKYC: boolean;
    canManageFinance: boolean;
    canManageBrokers: boolean;
    canManagePartners: boolean;
    canManageRBAC: boolean;
  };
  allowedModules: string[];
}

export const ROLES_DATA: RoleSpec[] = [
  {
    id: "head_dispatcher",
    name: "Head Dispatcher",
    division: "All Divisions (Global Consolidated)",
    description: "Full super-admin permissions to control and oversee the entire platform, all divisions, financial ledgers, and security governance.",
    badgeColor: "bg-[#df2531]/20 text-[#df2531] border-[#df2531]/40",
    permissions: {
      canViewAllDivisions: true,
      canManageCars: true,
      canManageMachinery: true,
      canManageDalol: true,
      canApproveKYC: true,
      canManageFinance: true,
      canManageBrokers: true,
      canManagePartners: true,
      canManageRBAC: true,
    },
    allowedModules: [
      "Command Center",
      "Dispatch Gantt",
      "Fleet Registry",
      "Certified Operators (ODR)",
      "Inspections & Walkaround",
      "Maintenance Schedules",
      "Elshaday Car Rental",
      "Liora Heavy Machinery",
      "Dalol Logistics Service",
      "Tax Ledger & Settlements",
      "Brokers & Commissions",
      "Partners Onboarding",
      "RBAC Governance & Permissions",
    ],
  },
  {
    id: "elshaday_admin",
    name: "Elshaday Admin",
    division: "Elshaday Car Rental Division",
    description: "Scoped admin permissions to view, manage, and dispatch passenger vehicles, commercial vans, drivers, and rental revenues.",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    permissions: {
      canViewAllDivisions: false,
      canManageCars: true,
      canManageMachinery: false,
      canManageDalol: false,
      canApproveKYC: true,
      canManageFinance: true,
      canManageBrokers: true,
      canManagePartners: true,
      canManageRBAC: false,
    },
    allowedModules: [
      "Command Center",
      "Dispatch Gantt",
      "Fleet Registry (Passenger Vehicles)",
      "Chauffeurs & Drivers",
      "Inspections & Return Walkaround",
      "Elshaday Cashflow & Ledger",
      "Car Rental Brokers",
      "Individual Fleet Hosts",
    ],
  },
  {
    id: "liora_admin",
    name: "Liora Admin",
    division: "Liora Heavy Machinery Division",
    description: "Scoped admin permissions to deploy heavy earthmoving plant, hydraulic attachments, quarry machinery, and site mobilization.",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    permissions: {
      canViewAllDivisions: false,
      canManageCars: false,
      canManageMachinery: true,
      canManageDalol: false,
      canApproveKYC: true,
      canManageFinance: true,
      canManageBrokers: true,
      canManagePartners: true,
      canManageRBAC: false,
    },
    allowedModules: [
      "Command Center",
      "Dispatch Gantt",
      "Fleet Registry (Excavators, Loaders, Breakers)",
      "Certified Operators (ODR Mobile Machinery)",
      "Site Inspections & Engine Hours",
      "Machinery Maintenance & Overhauls",
      "Liora Advance Vault & Ledger",
      "Infrastructure & Quarry Brokers",
      "Heavy Equipment Corporate Partners",
    ],
  },
  {
    id: "dalol_admin",
    name: "Dalol Admin",
    division: "Dalol Logistics & Freight Service",
    description: "Scoped admin permissions for Djibouti-Addis corridor freight dispatch, low-bed heavy transport, and RFID fuel smart releases.",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    permissions: {
      canViewAllDivisions: false,
      canManageCars: false,
      canManageMachinery: false,
      canManageDalol: true,
      canApproveKYC: false,
      canManageFinance: true,
      canManageBrokers: true,
      canManagePartners: true,
      canManageRBAC: false,
    },
    allowedModules: [
      "Command Center",
      "Fleet Registry (Corridor Freight & Lowbeds)",
      "Dalol Escrow & Freight Bookings",
      "Dalol Fuel Escrow Rail & Ledger",
      "Logistics Freight Brokers",
      "Corridor Commercial Carriers",
    ],
  },
];

export async function GET() {
  try {
    const users = db.getUsers().map((u) => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      phoneNumber: u.phoneNumber,
      role: u.role,
      status: u.status || "active",
      assignedDivision:
        u.assignedDivision ||
        (u.role === "elshaday_admin"
          ? "elshaday"
          : u.role === "liora_admin"
          ? "liora"
          : u.role === "dalol_admin"
          ? "dalol"
          : "all"),
      confirmationEmailSent: u.confirmationEmailSent || false,
      approvedBy: u.approvedBy,
      approvedAt: u.approvedAt,
      createdAt: u.createdAt,
    }));

    const pendingUsers = users.filter((u) => u.status === "pending_approval");

    return NextResponse.json({
      success: true,
      users,
      allUsers: users,
      pendingUsers,
      roles: ROLES_DATA,
      roleConfigs: ROLES_DATA,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch permissions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, userId, approverName = "Yonas Bekele", email, role, fullName } = body;

    // Direct Role Credentials Provisioning & Setup Link Generation
    if (action === "provision_credentials") {
      if (!email || !role) {
        return NextResponse.json({ error: "Email address and target role are required" }, { status: 400 });
      }

      const res = db.assignRoleCredentials(email, role, fullName);
      const roleSpec = ROLES_DATA.find((r) => r.id === role);

      // Generate and dispatch real branded HTML email
      const emailResult = await dispatchBrandedRoleEmail({
        toEmail: email,
        role,
        roleName: roleSpec?.name || role.replace("_", " ").toUpperCase(),
        divisionName: roleSpec?.division || "Enterprise Division",
        token: res.token,
        resetLink: res.resetLink,
        baseUrl: req.nextUrl?.origin || "http://localhost:3000",
      });

      return NextResponse.json({
        success: true,
        message: `Password setup & reset link dispatched to ${email} for role ${role.replace("_", " ").toUpperCase()}.`,
        user: res.user,
        token: res.token,
        resetLink: res.resetLink,
        email: res.user.email,
        role: res.user.role,
        emailSubject: emailResult.emailSubject,
        emailHtml: emailResult.emailHtml,
        sentVia: emailResult.sentVia,
      });
    }

    if (action === "approve") {
      if (!userId) {
        return NextResponse.json({ error: "User ID is required" }, { status: 400 });
      }
      const success = db.approveUser(userId, approverName);
      if (!success) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const user = db.users.find((u) => u.id === userId);
      return NextResponse.json({
        success: true,
        message: `Permissions granted. Account activated for ${user?.fullName} (${user?.role}).`,
        user,
      });
    }

    if (action === "reject") {
      if (!userId) {
        return NextResponse.json({ error: "User ID is required" }, { status: 400 });
      }
      const success = db.rejectUser(userId);
      if (!success) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: "Account registration request rejected.",
      });
    }

    if (action === "delete_user") {
      if (!userId) {
        return NextResponse.json({ error: "User ID is required" }, { status: 400 });
      }
      const success = db.deleteUser(userId);
      if (!success) {
        return NextResponse.json({ error: "User not found or already deleted" }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: "Account deleted successfully from platform directory.",
      });
    }

    if (action === "add_user") {
      if (!email || !role || !fullName) {
        return NextResponse.json({ error: "Full Name, Email, and Role are required" }, { status: 400 });
      }

      const newUser = db.addUser({
        fullName,
        email,
        role,
        phoneNumber: body.phoneNumber || "",
        assignedDivision: body.assignedDivision,
        password: body.password || "DispatcH2026!",
        status: body.status || "active",
      });

      return NextResponse.json({
        success: true,
        message: `Account created successfully for ${fullName} (${role}).`,
        user: newUser,
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Permission update error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const success = db.deleteUser(userId);
    if (!success) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully from directory.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Delete user error" }, { status: 500 });
  }
}
