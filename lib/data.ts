import { randomUUID } from "crypto";
import { getDb, isFirebaseConfigured } from "./firebase";
import { AuditRecord } from "./types";

const AUDITS_COLLECTION = "audits";

interface Config {
  customIssueTypes: string[];
}

export async function getAllAudits(): Promise<AuditRecord[]> {
  if (!isFirebaseConfigured()) return [];
  const db = getDb();
  const snapshot = await db.collection(AUDITS_COLLECTION).orderBy("createdAt", "desc").get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as AuditRecord));
}

export async function getAuditById(id: string): Promise<AuditRecord | undefined> {
  if (!isFirebaseConfigured()) return undefined;
  const db = getDb();
  const doc = await db.collection(AUDITS_COLLECTION).doc(id).get();
  if (!doc.exists) return undefined;
  return { id: doc.id, ...doc.data() } as AuditRecord;
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
