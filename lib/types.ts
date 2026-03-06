export const DEFAULT_ISSUE_TYPES = [
  "Over Captured",
  "Under Captured",
  "Blurry",
  "Missing Sections",
] as const;

export interface AuditRecord {
  id: string;
  category: string;
  retailer: string;
  pogLink: string;
  issueType: string;
  auditor: string;
  notes: string;
  createdAt: string;
}
