import { NextResponse } from "next/server";
import { setActiveCycle } from "@/lib/data";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await setActiveCycle(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to activate cycle";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
