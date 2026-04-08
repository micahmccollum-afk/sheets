import { NextResponse } from "next/server";
import { updateAuditCycle, deleteAuditCycle } from "@/lib/data";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const updates: Record<string, string | boolean | undefined> = {};
    if (body.name !== undefined) updates.name = String(body.name).trim();
    if (body.description !== undefined)
      updates.description = String(body.description).trim();
    if (body.isActive !== undefined) updates.isActive = Boolean(body.isActive);

    const cycle = await updateAuditCycle(id, updates);
    if (!cycle) {
      return NextResponse.json({ error: "Cycle not found" }, { status: 404 });
    }
    return NextResponse.json(cycle);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid request body";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteAuditCycle(id);
    if (!deleted) {
      return NextResponse.json({ error: "Cycle not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Delete failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
