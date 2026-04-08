import { randomUUID } from "crypto";
import { readFile } from "fs/promises";
import path from "path";
import { getDb, isFirebaseConfigured } from "./firebase";
import { AuditRecord, AuditCycle } from "./types";

const AUDITS_COLLECTION = "audits";
const CYCLES_COLLECTION = "audit_cycles";

interface Config {
  customIssueTypes: string[];
}

export async function getAllAudits(cycleId?: string): Promise<AuditRecord[]> {
  const normalizeAudit = (docId: string, data: Record<string, unknown>) =>
    ({
      ...(data as unknown as AuditRecord),
      id: docId,
      status: data.status ?? false,
      isHighOverlap: data.isHighOverlap ?? false,
      severity: data.severity ?? "",
      issueType: data.issueType ?? "",
      notes: data.notes ?? "",
      auditCycleId: data.auditCycleId ?? undefined,
    }) as AuditRecord;

  const sortByCreatedAtDesc = (records: AuditRecord[]) =>
    [...records].sort(
      (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    );

  if (isFirebaseConfigured()) {
    try {
      const db = getDb();
      let query: FirebaseFirestore.Query = db.collection(AUDITS_COLLECTION);
      if (cycleId) {
        // Avoid where+orderBy index requirements; sort results in memory instead.
        query = query.where("auditCycleId", "==", cycleId);
        const snapshot = await query.get();
        return sortByCreatedAtDesc(
          snapshot.docs.map((doc) => normalizeAudit(doc.id, doc.data()))
        );
      }

      const snapshot = await query.orderBy("createdAt", "desc").get();
      return snapshot.docs.map((doc) => normalizeAudit(doc.id, doc.data()));
    } catch (error) {
      const context = cycleId ? `cycleId=${cycleId}` : "all cycles";
      console.error(`Failed to load audits from Firebase (${context})`, error);
      throw error instanceof Error ? error : new Error("Failed to load audits");
    }
  }

  try {
    const localPath = path.join(process.cwd(), "data", "audits.json");
    const contents = await readFile(localPath, "utf-8");
    const parsed = JSON.parse(contents) as Record<string, unknown>[];
    let audits = parsed.map((record, index) => normalizeAudit(record.id?.toString() ?? `local-${index}`, record));
    if (cycleId) {
      audits = audits.filter((a) => a.auditCycleId === cycleId);
    }
    return sortByCreatedAtDesc(audits);
  } catch {
    return [];
  }
}

export async function getAuditById(id: string): Promise<AuditRecord | undefined> {
  if (!isFirebaseConfigured()) return undefined;
  const db = getDb();
  const doc = await db.collection(AUDITS_COLLECTION).doc(id).get();
  if (!doc.exists) return undefined;
  const data = doc.data()!;
  return {
    id: doc.id,
    ...data,
    status: data.status ?? false,
    isHighOverlap: data.isHighOverlap ?? false,
    severity: data.severity ?? "",
    issueType: data.issueType ?? "",
    notes: data.notes ?? "",
  } as AuditRecord;
}

export async function createAudit(
  data: Omit<AuditRecord, "id" | "createdAt">
): Promise<AuditRecord> {
  if (!isFirebaseConfigured()) {
    const { getMissingFirebaseVars } = await import("./firebase");
    const missing = getMissingFirebaseVars();
    throw new Error(
      `Firebase not configured. Add to Vercel: ${missing.join(", ")}. See FIREBASE_SETUP.md.`
    );
  }
  const db = getDb();
  const id = randomUUID();
  const record: AuditRecord = {
    ...data,
    id,
    createdAt: new Date().toISOString(),
  };
  await db.collection(AUDITS_COLLECTION).doc(id).set(record);
  return record;
}

export async function updateAudit(
  id: string,
  data: Partial<AuditRecord>
): Promise<AuditRecord | null> {
  if (!isFirebaseConfigured()) return null;
  const db = getDb();
  const docRef = db.collection(AUDITS_COLLECTION).doc(id);
  const doc = await docRef.get();
  if (!doc.exists) return null;

  const updates = { ...data };
  delete (updates as Partial<AuditRecord>).id;
  delete (updates as Partial<AuditRecord>).createdAt;

  await docRef.update(updates);
  const updated = await docRef.get();
  return { id: updated.id, ...updated.data() } as AuditRecord;
}

export async function deleteAudit(id: string): Promise<boolean> {
  if (!isFirebaseConfigured()) return false;
  const db = getDb();
  const docRef = db.collection(AUDITS_COLLECTION).doc(id);
  const doc = await docRef.get();
  if (!doc.exists) return false;

  await docRef.delete();
  return true;
}

// Issue types config
const DEFAULT_ISSUE_TYPES = ["Over Captured", "Under Captured", "Blurry", "Missing Sections"];

async function getConfig(): Promise<Config> {
  if (!isFirebaseConfigured()) return { customIssueTypes: [] };
  const db = getDb();
  const doc = await db.collection("config").doc("app").get();
  if (!doc.exists) return { customIssueTypes: [] };
  const data = doc.data();
  return {
    customIssueTypes: data?.customIssueTypes ?? [],
  };
}

async function setConfig(config: Config): Promise<void> {
  if (!isFirebaseConfigured()) return;
  const db = getDb();
  await db.collection("config").doc("app").set(config, { merge: true });
}

export async function getIssueTypes(): Promise<string[]> {
  const config = await getConfig();
  const combined = [...DEFAULT_ISSUE_TYPES, ...config.customIssueTypes];
  return Array.from(new Set(combined)).sort();
}

export async function addIssueType(type: string): Promise<boolean> {
  const trimmed = type.trim();
  if (!trimmed) return false;
  const config = await getConfig();
  const lower = trimmed.toLowerCase();
  if (config.customIssueTypes.some((t) => t.toLowerCase() === lower)) return false;
  if (DEFAULT_ISSUE_TYPES.some((t) => t.toLowerCase() === lower)) return false;
  config.customIssueTypes.push(trimmed);
  config.customIssueTypes.sort();
  await setConfig(config);
  return true;
}

export async function removeIssueType(type: string): Promise<boolean> {
  const trimmed = type.trim();
  if (DEFAULT_ISSUE_TYPES.includes(trimmed)) return false;
  const config = await getConfig();
  const idx = config.customIssueTypes.findIndex((t) => t.toLowerCase() === trimmed.toLowerCase());
  if (idx === -1) return false;
  config.customIssueTypes.splice(idx, 1);
  await setConfig(config);
  return true;
}

// ── Audit Cycles ──

export async function getAllAuditCycles(): Promise<AuditCycle[]> {
  if (!isFirebaseConfigured()) return [];
  const db = getDb();
  const snapshot = await db.collection(CYCLES_COLLECTION).orderBy("createdAt", "desc").get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as AuditCycle);
}

export async function getAuditCycleById(id: string): Promise<AuditCycle | undefined> {
  if (!isFirebaseConfigured()) return undefined;
  const db = getDb();
  const doc = await db.collection(CYCLES_COLLECTION).doc(id).get();
  if (!doc.exists) return undefined;
  return { id: doc.id, ...doc.data() } as AuditCycle;
}

export async function createAuditCycle(
  data: Omit<AuditCycle, "id" | "createdAt">
): Promise<AuditCycle> {
  if (!isFirebaseConfigured()) {
    const { getMissingFirebaseVars } = await import("./firebase");
    const missing = getMissingFirebaseVars();
    throw new Error(
      `Firebase not configured. Add to Vercel: ${missing.join(", ")}. See FIREBASE_SETUP.md.`
    );
  }
  const db = getDb();
  const id = randomUUID();

  // If this cycle is active, deactivate all others
  if (data.isActive) {
    const existing = await db.collection(CYCLES_COLLECTION).where("isActive", "==", true).get();
    const batch = db.batch();
    existing.docs.forEach((doc) => batch.update(doc.ref, { isActive: false }));
    await batch.commit();
  }

  const cycle: AuditCycle = {
    ...data,
    id,
    createdAt: new Date().toISOString(),
  };
  await db.collection(CYCLES_COLLECTION).doc(id).set(cycle);
  return cycle;
}

export async function updateAuditCycle(
  id: string,
  data: Partial<AuditCycle>
): Promise<AuditCycle | null> {
  if (!isFirebaseConfigured()) return null;
  const db = getDb();
  const docRef = db.collection(CYCLES_COLLECTION).doc(id);
  const doc = await docRef.get();
  if (!doc.exists) return null;

  const updates = { ...data };
  delete (updates as Partial<AuditCycle>).id;
  delete (updates as Partial<AuditCycle>).createdAt;

  await docRef.update(updates);
  const updated = await docRef.get();
  return { id: updated.id, ...updated.data() } as AuditCycle;
}

export async function deleteAuditCycle(id: string): Promise<boolean> {
  if (!isFirebaseConfigured()) return false;
  const db = getDb();
  const docRef = db.collection(CYCLES_COLLECTION).doc(id);
  const doc = await docRef.get();
  if (!doc.exists) return false;
  await docRef.delete();
  return true;
}

export async function setActiveCycle(id: string): Promise<void> {
  if (!isFirebaseConfigured()) return;
  const db = getDb();
  // Deactivate all
  const existing = await db.collection(CYCLES_COLLECTION).where("isActive", "==", true).get();
  const batch = db.batch();
  existing.docs.forEach((doc) => batch.update(doc.ref, { isActive: false }));
  // Activate target
  batch.update(db.collection(CYCLES_COLLECTION).doc(id), { isActive: true });
  await batch.commit();
}

export async function migrateLegacyAudits(): Promise<{ cycleId: string; count: number }> {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase not configured");
  }
  const db = getDb();

  // Create a "Pre-Versioning Audits" cycle
  const cycleId = randomUUID();
  const cycle: AuditCycle = {
    id: cycleId,
    name: "Pre-Versioning Audits",
    description: "Audits created before the versioning feature was enabled",
    createdAt: new Date().toISOString(),
    isActive: false,
  };
  await db.collection(CYCLES_COLLECTION).doc(cycleId).set(cycle);

  // Find all audits without an auditCycleId
  const snapshot = await db.collection(AUDITS_COLLECTION).get();
  const batch = db.batch();
  let count = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (!data.auditCycleId) {
      batch.update(doc.ref, { auditCycleId: cycleId });
      count++;
    }
  }
  if (count > 0) await batch.commit();
  return { cycleId, count };
}
