/** Volume/count charts (e.g. Audits by Retailer, Audits by Category) */
export const VOLUME_BAR_COLOR = "#3b82f6";

/** Error rate severity thresholds and colors */
export const ERROR_RATE = {
  high: "#ef4444", // >= 50%
  moderate: "#eab308", // 25-50%
  low: "#22c55e", // < 25%
} as const;

export function getErrorRateColor(rate: number): string {
  if (rate >= 50) return ERROR_RATE.high;
  if (rate >= 25) return ERROR_RATE.moderate;
  return ERROR_RATE.low;
}

/** Issue type distribution (purple palette) */
export const ISSUE_TYPE_PALETTE = [
  "#7c3aed",
  "#8b5cf6",
  "#a78bfa",
  "#c4b5fd",
] as const;

export function getIssueTypeColor(index: number): string {
  return ISSUE_TYPE_PALETTE[index % ISSUE_TYPE_PALETTE.length];
}
