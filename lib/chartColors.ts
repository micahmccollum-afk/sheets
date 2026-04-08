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

/** Comparison view colors */
export const COMPARISON_COLORS = {
  current: "#3b82f6",
  previous: "#9ca3af",
  improvement: "#22c55e",
  regression: "#ef4444",
  neutral: "#6b7280",
} as const;

export const CHANGE_STATUS_STYLES = {
  fixed: { bg: "bg-green-100", text: "text-green-800", label: "Fixed" },
  new_issue: { bg: "bg-red-100", text: "text-red-800", label: "New Issue" },
  persistent: { bg: "bg-amber-100", text: "text-amber-800", label: "Persistent" },
  unchanged: { bg: "bg-gray-100", text: "text-gray-700", label: "Unchanged" },
} as const;
