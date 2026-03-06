import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import { put, get } from "@vercel/blob";
import { AuditRecord } from "./types";

const BLOB_PATH = "pog-audit/audits.json";
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "audits.json");

function isBlobStorageEnabled() {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

async function readAuditsBlob(): Promise<AuditRecord[]> {
  try {
    const result = await get(BLOB_PATH, { access: "private" });
    if (!result?.stream) return [];
    const text = await new Response(result.stream).text();
    return JSON.parse(text);
  } catch {
    return [];
  }
}

function readAuditsFile(): AuditRecord[] {
  ensureDataDir();
  if (!fs.existsSync(DATA_FILE)) return [];
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function readAudits(): Promise<AuditRecord[]> {
  return isBlobStorageEnabled() ? readAuditsBlob() : readAuditsFile();
}

async function writeAuditsBlob(audits: AuditRecord[]) {
  await put(BLOB_PATH, JSON.stringify(audits, null, 2), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

function writeAuditsFile(audits: AuditRecord[]) {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(audits, null, 2), "utf-8");
}

async function writeAudits(audits: AuditRecord[]) {
  if (isBlobStorageEnabled()) {
    await writeAuditsBlob(audits);
  } else {
    writeAuditsFile(audits);
  }
}

export async function getAllAudits(): Promise<AuditRecord[]> {
  return readAudits();
}

export async function getAuditById(id: string): Promise<AuditRecord | undefined> {
  const audits = await readAudits();
  return audits.find((a) => a.id === id);
}

export async function createAudit(
  data: Omit<AuditRecord, "id" | "createdAt">
): Promise<AuditRecord> {
  const audits = await readAudits();
  const record: AuditRecord = {
    ...data,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };
  audits.push(record);
  await writeAudits(audits);
  return record;
}

export async function updateAudit(
  id: string,
  data: Partial<AuditRecord>
): Promise<AuditRecord | null> {
  const audits = await readAudits();
  const index = audits.findIndex((a) => a.id === id);
  if (index === -1) return null;
  audits[index] = { ...audits[index], ...data };
  await writeAudits(audits);
  return audits[index];
}

export async function deleteAudit(id: string): Promise<boolean> {
  const audits = await readAudits();
  const filtered = audits.filter((a) => a.id !== id);
  if (filtered.length === audits.length) return false;
  await writeAudits(filtered);
  return true;
}
