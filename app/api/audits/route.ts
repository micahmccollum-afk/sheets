import { NextResponse } from "next/server";
import { getAllAudits, createAudit } from "@/lib/data";

export async function GET() {
  const audits = await getAllAudits();
  return NextResponse.json(audits, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category, retailer, pogLink, status, issueType, severity, isHighOverlap, notes } = body;

    if (
      category === undefined ||
      category === null ||
      !String(category).trim() ||
      !retailer ||
      !pogLink
    ) {
      return NextResponse.json(
        { error: "Missing required fields: category, retailer, pogLink" },
        { status: 400 }
      );
    }

    const isPass = status === true || status === "true";
    if (!isPass) {
      if (!issueType || !String(issueType).trim()) {
        return NextResponse.json(
          { error: "Issue Type is required for Fail entries" },
          { status: 400 }
        );
      }
      if (!severity || !String(severity).trim()) {
        return NextResponse.json(
          { error: "Severity is required for Fail entries" },
          { status: 400 }
        );
      }
    }

    const record = await createAudit({
      category: String(category).trim(),
      retailer: String(retailer).trim(),
      pogLink: String(pogLink).trim(),
      status: isPass,
      issueType: isPass ? "" : String(issueType).trim(),
      severity: isPass ? "" : String(severity).trim(),
      isHighOverlap: Boolean(isHighOverlap),
      notes: String(notes ?? "").trim(),
    });

    return NextResponse.json(record);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid request body";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
