import { NextResponse } from "next/server";
import { getDb, isFirebaseConfigured } from "@/lib/firebase";

export async function POST(request: Request) {
  try {
    if (!isFirebaseConfigured()) {
      return NextResponse.json(
        { error: "Firebase not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { sourceCycleId, targetCycleId } = body;

    if (!targetCycleId) {
      return NextResponse.json(
        { error: "targetCycleId is required" },
        { status: 400 }
      );
    }

    const db = getDb();
    // Query audits to reassign
    let query: FirebaseFirestore.Query = db.collection("audits");
    if (sourceCycleId === "__unassigned__") {
      // Find audits with no cycle
      const snapshot = await db.collection("audits").get();
      const batch = db.batch();
      let count = 0;
      for (const doc of snapshot.docs) {
        const data = doc.data();
        if (!data.auditCycleId) {
          batch.update(doc.ref, { auditCycleId: targetCycleId });
          count++;
        }
      }
      if (count > 0) await batch.commit();
      return NextResponse.json({ reassigned: count });
    } else if (sourceCycleId) {
      query = query.where("auditCycleId", "==", sourceCycleId);
    } else {
      // Reassign ALL audits
      const snapshot = await db.collection("audits").get();
      const batch = db.batch();
      let count = 0;
      for (const doc of snapshot.docs) {
        batch.update(doc.ref, { auditCycleId: targetCycleId });
        count++;
      }
      if (count > 0) await batch.commit();
      return NextResponse.json({ reassigned: count });
    }

    const snapshot = await query.get();
    const batch = db.batch();
    let count = 0;
    for (const doc of snapshot.docs) {
      batch.update(doc.ref, { auditCycleId: targetCycleId });
      count++;
    }
    if (count > 0) await batch.commit();
    return NextResponse.json({ reassigned: count });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bulk reassign failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
