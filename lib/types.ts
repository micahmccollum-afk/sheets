export const DEFAULT_ISSUE_TYPES = [
  "Over Captured",
  "Under Captured",
  "Blurry",
  "Missing Sections",
] as const;

export const SEVERITY_OPTIONS = ["Low", "Medium", "High"] as const;

export interface AuditRecord {
  id: string;
  category: string;
  retailer: string;
  pogLink: string;
  status: boolean; // true=Pass, false=Fail
  issueType: string; // empty for Pass
  severity?: string; // required when Fail
  isHighOverlap: boolean;
  notes: string;
  createdAt: string;
  auditCycleId?: string; // links to AuditCycle; undefined = legacy/unversioned
}

export interface AuditCycle {
  id: string;
  name: string; // e.g., "March 2026 Audit"
  description?: string;
  createdAt: string;
  isActive: boolean; // only one cycle active at a time
}

export type ChangeStatus = "fixed" | "new_issue" | "persistent" | "unchanged";

export interface ComparisonResult {
  currentAudit?: AuditRecord;
  previousAudit?: AuditRecord;
  changeStatus: ChangeStatus;
  matchKey: string; // "retailer|category" composite key
}

export interface KPIDelta {
  label: string;
  currentValue: number;
  previousValue: number;
  delta: number;
  direction: "improvement" | "regression" | "neutral";
  formattedCurrent: string;
  formattedPrevious: string;
  formattedDelta: string;
}
