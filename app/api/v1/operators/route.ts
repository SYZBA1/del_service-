import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { OperatorDriver } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const grade = searchParams.get("grade");
    const status = searchParams.get("status");

    let operators = db.getOperators();

    if (grade && grade !== "all") {
      operators = operators.filter((o) => o.driverLicenseGrade === grade);
    }
    if (status && status !== "all") {
      operators = operators.filter((o) => o.status === status);
    }

    return NextResponse.json({
      success: true,
      count: operators.length,
      data: operators,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load operators" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fullName,
      phoneNumber,
      email,
      driverLicenseGrade = "Special Mobile Machinery",
      driverLicenseNo,
      licenseExpiryDate,
      licenseImageUrl,
      kycNidImageUrl,
      faydaFinNumber,
      workExperienceYears = 5,
      experienceDetails,
      machineryHandled = [],
      dispatchArea = "Addis Ababa & Regional Projects",
      livingArea = "Addis Ababa",
      estimatedPerDiem = 1500,
      avatarUrl,
    } = body;

    if (!fullName || !phoneNumber || !driverLicenseNo) {
      return NextResponse.json(
        { error: "Full Name, Phone Number, and Driver License Number are required." },
        { status: 400 }
      );
    }

    const newOperator = db.addOperator({
      fullName,
      phoneNumber,
      email,
      driverLicenseGrade,
      driverLicenseNo,
      licenseExpiryDate: licenseExpiryDate || "2028-12-31",
      licenseImageUrl: licenseImageUrl || "/mock/license-sample.jpg",
      kycNidImageUrl: kycNidImageUrl || "/mock/nid-sample.jpg",
      faydaFinNumber: faydaFinNumber || `FIN-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      workExperienceYears: parseInt(workExperienceYears, 10) || 5,
      experienceDetails: experienceDetails || `${workExperienceYears} years operating commercial equipment across Ethiopia.`,
      machineryHandled: Array.isArray(machineryHandled) ? machineryHandled : [machineryHandled],
      dispatchArea,
      livingArea,
      estimatedPerDiem: parseFloat(estimatedPerDiem) || 1500,
      status: "available",
      rating: 5.0,
      kycVerified: true,
      avatarUrl: avatarUrl || "/avatars/default-operator.png",
    });

    return NextResponse.json({
      success: true,
      message: `Certified Operator '${newOperator.fullName}' registered successfully in ODR module.`,
      operator: newOperator,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create operator" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Operator ID is required for update" }, { status: 400 });
    }

    const updated = db.updateOperator(id, updates);
    if (!updated) {
      return NextResponse.json({ error: `Operator with ID ${id} not found` }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Operator ${updated.fullName} updated successfully`,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update operator" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Operator ID is required" }, { status: 400 });
    }

    const ok = db.deleteOperator(id);
    if (!ok) {
      return NextResponse.json({ error: `Operator with ID ${id} not found` }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Operator ${id} removed successfully from ODR Registry`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete operator" }, { status: 500 });
  }
}
