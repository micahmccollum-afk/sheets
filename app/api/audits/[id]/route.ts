import { NextResponse } from "next/server";
import { updateAudit, deleteAudit } from "@/lib/data";

const EDITABLE_FIELDS = ["category", "retailer", "pogLink", "issueType", "auditor", "notes"] as const;

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await _request.json();
    const updates: Record<string, string> = {};
    for (const key of EDITABLE_FIELDS) {
      if (body[key] !== undefined) updates[key] = String(body[key]).trim();
    }
    const record = await updateAudit(id, updates);
    if (!record) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }
    return NextResponse.json(record);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid request body";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = await deleteAudit(id);
  if (!deleted) {
    return NextResponse.json({ error: "Audit not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
