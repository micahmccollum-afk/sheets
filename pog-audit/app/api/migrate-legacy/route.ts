import { NextResponse } from "next/server";
import { migrateLegacyAudits } from "@/lib/data";

export async function POST() {
  try {
    const result = await migrateLegacyAudits();
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Migration failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
