import { NextRequest, NextResponse } from "next/server";
import { INITIAL_TENDERS, fetchLiveTendersFromSources, analyzeUploadedTenderDoc } from "@/lib/tenders-data";
import { TenderItem } from "@/lib/types";

// In-memory runtime tenders store
let runtimeTenders: TenderItem[] = [...INITIAL_TENDERS];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const division = searchParams.get("division");
    const source = searchParams.get("source");
    const search = searchParams.get("search");

    const now = new Date();
    // Automatic Expired Tender Filtering: Exclude any tender whose deadline has passed
    const activeTenders = runtimeTenders.filter((t) => {
      if (!t.closingDate) return true;
      return new Date(t.closingDate).getTime() + 86400000 >= now.getTime();
    });

    let filtered = [...activeTenders];

    if (division && division !== "all") {
      filtered = filtered.filter(
        (t) => t.targetDivision === division || t.targetDivision === "both"
      );
    }

    if (source && source !== "all") {
      filtered = filtered.filter((t) => t.source === source);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.titleAmharic.toLowerCase().includes(q) ||
          t.refNumber.toLowerCase().includes(q) ||
          t.issuingOrganization.toLowerCase().includes(q) ||
          t.location.toLowerCase().includes(q)
      );
    }

    const totalEstimatedBudgetETB = activeTenders.reduce(
      (acc, t) => acc + t.estimatedBudgetETB,
      0
    );
    const elshadayCount = activeTenders.filter(
      (t) => t.targetDivision === "elshaday" || t.targetDivision === "both"
    ).length;
    const lioraCount = activeTenders.filter(
      (t) => t.targetDivision === "liora" || t.targetDivision === "both"
    ).length;
    const merkatoCount = activeTenders.filter((t) => t.source === "merkato").length;
    const egpCount = activeTenders.filter((t) => t.source === "egp").length;

    return NextResponse.json({
      success: true,
      count: filtered.length,
      data: filtered,
      summary: {
        totalTenders: activeTenders.length,
        totalEstimatedBudgetETB,
        elshadayCount,
        lioraCount,
        merkatoCount,
        egpCount,
        lastSyncedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch tenders" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action = "fetch_live", fileName, fileSize, fileType, targetDivision, tenderId, checklistId, status } = body;

    // ACTION 1: Trigger Live Scraper from 2merkato.com and EGP
    if (action === "fetch_live") {
      const live = await fetchLiveTendersFromSources(["merkato", "egp"]);
      // Update runtime store
      runtimeTenders = [...live];

      return NextResponse.json({
        success: true,
        message: "Successfully synchronized with 2merkato.com and Ethiopian EGP portals.",
        tendersCount: runtimeTenders.length,
        data: runtimeTenders,
        syncedAt: new Date().toISOString(),
      });
    }

    // ACTION 2: Analyze Uploaded Tender RFP/TOR Document (Post-Purchase RAG)
    if (action === "analyze_doc") {
      if (!fileName) {
        return NextResponse.json({ error: "File name is required for RAG analysis" }, { status: 400 });
      }

      const ragResult = await analyzeUploadedTenderDoc(
        fileName,
        fileSize || "3.5 MB",
        fileType || "pdf",
        targetDivision || "both"
      );

      // If tenderId is provided, attach to that tender
      if (tenderId) {
        const tender = runtimeTenders.find((t) => t.id === tenderId);
        if (tender) {
          tender.purchasedDocName = fileName;
          tender.purchasedDocUrl = `/contracts/tenders/${fileName}`;
          tender.checklist = [...ragResult.checklist, ...tender.checklist];
        }
      }

      return NextResponse.json({
        success: true,
        message: "Document successfully parsed via Del's Bot RAG pipeline.",
        data: ragResult,
      });
    }

    // ACTION 3: Toggle checklist item status
    if (action === "update_checklist") {
      if (!tenderId || !checklistId) {
        return NextResponse.json({ error: "tenderId and checklistId are required" }, { status: 400 });
      }

      const tender = runtimeTenders.find((t) => t.id === tenderId);
      if (!tender) {
        return NextResponse.json({ error: "Tender not found" }, { status: 404 });
      }

      const item = tender.checklist.find((c) => c.id === checklistId);
      if (item) {
        item.status = status || (item.status === "completed" ? "pending" : "completed");
      }

      return NextResponse.json({
        success: true,
        message: "Checklist updated",
        checklist: tender.checklist,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process tender action" },
      { status: 500 }
    );
  }
}
