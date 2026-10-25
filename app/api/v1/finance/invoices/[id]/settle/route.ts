import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: invoiceId } = await params;
    const body = await req.json().catch(() => ({}));
    const { paymentMethod = "Telebirr", transactionRef = `TXN-TB-${Date.now()}` } = body;

    const invoice = db.settleInvoice(invoiceId, paymentMethod);
    const settlements = db.settlements.filter((s) => s.invoiceId === invoiceId);

    return NextResponse.json({
      success: true,
      message: `Invoice ${invoice.invoiceNumber} settled via ${paymentMethod}. Host commission split ledger generated.`,
      invoice,
      transactionRef,
      settlementLedger: settlements,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Settlement failed" }, { status: 500 });
  }
}
