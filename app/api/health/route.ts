import { NextResponse } from "next/server";
import { isFirebaseConfigured, getMissingFirebaseVars } from "@/lib/firebase";

export async function GET() {
  const configured = isFirebaseConfigured();
  const missing = configured ? [] : getMissingFirebaseVars();
  return NextResponse.json({
    firebase: configured ? "configured" : "not configured",
    ...(missing.length > 0 && { missing }),
  });
}
