import { NextResponse } from "next/server";
import { getIssueTypes, addIssueType } from "@/lib/data";

export async function GET() {
  const types = await getIssueTypes();
  return NextResponse.json(types);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type } = body;
    if (!type || typeof type !== "string") {
      return NextResponse.json({ error: "Missing type" }, { status: 400 });
    }
    await addIssueType(type);
    const types = await getIssueTypes();
    return NextResponse.json({ types });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
