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
}
