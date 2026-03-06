export const ISSUE_TYPES = [
  "Over Captured",
  "Under Captured",
  "Blurry",
  "Missing Sections",
  "Other",
] as const;

export type IssueType = (typeof ISSUE_TYPES)[number];

export interface AuditRecord {
  id: string;
  category: string;
  retailer: string;
  pogLink: string;
  issueType: IssueType | string;
  auditor: string;
  notes: string;
  createdAt: string;
}
