import { NextResponse } from "next/server";
import { getAllAuditCycles, createAuditCycle } from "@/lib/data";

export async function GET() {
  const cycles = await getAllAuditCycles();
  return NextResponse.json(cycles, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, isActive } = body;

    if (!name || !String(name).trim()) {
      return NextResponse.json(
        { error: "Missing required field: name" },
        { status: 400 }
      );
    }

    const cycle = await createAuditCycle({
      name: String(name).trim(),
      description: description ? String(description).trim() : undefined,
      isActive: Boolean(isActive ?? true),
    });

    return NextResponse.json(cycle);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid request body";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
