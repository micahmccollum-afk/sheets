import { NextResponse } from "next/server";
import { getAllAudits, createAudit } from "@/lib/data";

export async function GET() {
  const audits = getAllAudits();
  return NextResponse.json(audits);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category, retailer, pogLink, issueType, auditor, notes } = body;

    if (!category || !retailer || !pogLink || !issueType || !auditor) {
      return NextResponse.json(
        { error: "Missing required fields: category, retailer, pogLink, issueType, auditor" },
        { status: 400 }
      );
    }

    const record = await createAudit({
      category: String(category).trim(),
      retailer: String(retailer).trim(),
      pogLink: String(pogLink).trim(),
      issueType: String(issueType).trim(),
      auditor: String(auditor).trim(),
      notes: String(notes ?? "").trim(),
    });

    return NextResponse.json(record);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid request body";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
