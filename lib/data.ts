import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import { AuditRecord } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "audits.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readAudits(): AuditRecord[] {
  ensureDataDir();
  if (!fs.existsSync(DATA_FILE)) {
    return [];
  }
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeAudits(audits: AuditRecord[]) {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(audits, null, 2), "utf-8");
}

export function getAllAudits(): AuditRecord[] {
  return readAudits();
}

export function getAuditById(id: string): AuditRecord | undefined {
  return readAudits().find((a) => a.id === id);
}

export function createAudit(data: Omit<AuditRecord, "id" | "createdAt">): AuditRecord {
  const audits = readAudits();
  const record: AuditRecord = {
    ...data,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };
  audits.push(record);
  writeAudits(audits);
  return record;
}

export function updateAudit(id: string, data: Partial<AuditRecord>): AuditRecord | null {
  const audits = readAudits();
  const index = audits.findIndex((a) => a.id === id);
  if (index === -1) return null;
  audits[index] = { ...audits[index], ...data };
  writeAudits(audits);
  return audits[index];
}

export function deleteAudit(id: string): boolean {
  const audits = readAudits().filter((a) => a.id !== id);
  if (audits.length === readAudits().length) return false;
  writeAudits(audits);
  return true;
}
