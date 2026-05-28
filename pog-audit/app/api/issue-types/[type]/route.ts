import { NextResponse } from "next/server";
import { removeIssueType, getIssueTypes } from "@/lib/data";

const DEFAULT_ISSUE_TYPES = ["Over Captured", "Under Captured", "Blurry", "Missing Sections"];

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;
  const decoded = decodeURIComponent(type);
  if (DEFAULT_ISSUE_TYPES.includes(decoded)) {
    return NextResponse.json({ error: "Cannot remove default issue type" }, { status: 400 });
  }
  const removed = await removeIssueType(decoded);
  if (!removed) {
    return NextResponse.json({ error: "Issue type not found" }, { status: 404 });
  }
  const types = await getIssueTypes();
  return NextResponse.json({ types });
}
