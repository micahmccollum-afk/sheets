import type { AuditRecord, ChangeStatus, ComparisonResult, KPIDelta } from "./types";

function normalizeKey(value: string): string {
  return (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function buildMatchKey(audit: AuditRecord): string {
  return `${normalizeKey(audit.retailer)}|${normalizeKey(audit.category)}`;
}

function groupByKey(audits: AuditRecord[]): Map<string, AuditRecord[]> {
  const map = new Map<string, AuditRecord[]>();
  for (const audit of audits) {
    const key = buildMatchKey(audit);
    const list = map.get(key) ?? [];
    list.push(audit);
    map.set(key, list);
  }
  return map;
}

/**
 * Match audits between two cycles and determine change status for each pair.
 */
export function matchAudits(
  current: AuditRecord[],
  previous: AuditRecord[]
): ComparisonResult[] {
  const currentByKey = groupByKey(current);
  const previousByKey = groupByKey(previous);
  const allKeysArr = Array.from(new Set([...Array.from(currentByKey.keys()), ...Array.from(previousByKey.keys())]));
  const results: ComparisonResult[] = [];

  for (const key of allKeysArr) {
    const curList = currentByKey.get(key) ?? [];
    const prevList = previousByKey.get(key) ?? [];

    // Sort both lists by issueType then pogLink for stable matching
    const sortFn = (a: AuditRecord, b: AuditRecord) =>
      (a.issueType ?? "").localeCompare(b.issueType ?? "") ||
      (a.pogLink ?? "").localeCompare(b.pogLink ?? "");
    curList.sort(sortFn);
    prevList.sort(sortFn);

    const maxLen = Math.max(curList.length, prevList.length);
    for (let i = 0; i < maxLen; i++) {
      const cur = curList[i];
      const prev = prevList[i];

      let changeStatus: ChangeStatus;
      if (cur && prev) {
        const curFail = !(cur.status ?? false);
        const prevFail = !(prev.status ?? false);
        if (prevFail && !curFail) changeStatus = "fixed";
        else if (!prevFail && curFail) changeStatus = "new_issue";
        else if (prevFail && curFail) changeStatus = "persistent";
        else changeStatus = "unchanged";
      } else if (cur && !prev) {
        changeStatus = !(cur.status ?? false) ? "new_issue" : "unchanged";
      } else {
        // prev exists, cur doesn't -- the issue was fixed (or item removed)
        changeStatus = !(prev!.status ?? false) ? "fixed" : "unchanged";
      }

      results.push({
        currentAudit: cur,
        previousAudit: prev,
        changeStatus,
        matchKey: key,
      });
    }
  }

  return results;
}

/**
 * Compute KPI deltas between two audit sets.
 */
export function computeKPIDeltas(
  current: AuditRecord[],
  previous: AuditRecord[]
): KPIDelta[] {
  const curTotal = current.length;
  const prevTotal = previous.length;
  const curFails = current.filter((a) => !(a.status ?? false)).length;
  const prevFails = previous.filter((a) => !(a.status ?? false)).length;
  const curOverlap = current.filter((a) => a.isHighOverlap ?? false).length;
  const prevOverlap = previous.filter((a) => a.isHighOverlap ?? false).length;

  const curErrorRate = curTotal > 0 ? (curFails / curTotal) * 100 : 0;
  const prevErrorRate = prevTotal > 0 ? (prevFails / prevTotal) * 100 : 0;
  const curOverlapRate = curTotal > 0 ? (curOverlap / curTotal) * 100 : 0;
  const prevOverlapRate = prevTotal > 0 ? (prevOverlap / prevTotal) * 100 : 0;

  // Most common issue
  const getTopIssue = (audits: AuditRecord[]) => {
    const fails = audits.filter((a) => !(a.status ?? false));
    const counts: Record<string, number> = {};
    for (const a of fails) {
      const t = (a.issueType ?? "").trim();
      if (t) counts[t] = (counts[t] ?? 0) + 1;
    }
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0] ?? null;
  };
  const curTopIssue = getTopIssue(current);
  const prevTopIssue = getTopIssue(previous);

  const errorDelta = curErrorRate - prevErrorRate;
  const overlapDelta = curOverlapRate - prevOverlapRate;
  const totalDelta = curTotal - prevTotal;
  const issueDelta = (curTopIssue?.[1] ?? 0) - (prevTopIssue?.[1] ?? 0);

  // For error rate and overlap rate, lower is better
  const lowerIsBetter = (delta: number): "improvement" | "regression" | "neutral" =>
    Math.abs(delta) < 0.1 ? "neutral" : delta < 0 ? "improvement" : "regression";

  return [
    {
      label: "Total Audits",
      currentValue: curTotal,
      previousValue: prevTotal,
      delta: totalDelta,
      direction: "neutral",
      formattedCurrent: String(curTotal),
      formattedPrevious: String(prevTotal),
      formattedDelta: totalDelta >= 0 ? `+${totalDelta}` : String(totalDelta),
    },
    {
      label: "Error Rate",
      currentValue: curErrorRate,
      previousValue: prevErrorRate,
      delta: errorDelta,
      direction: lowerIsBetter(errorDelta),
      formattedCurrent: `${curErrorRate.toFixed(1)}%`,
      formattedPrevious: `${prevErrorRate.toFixed(1)}%`,
      formattedDelta:
        `${errorDelta >= 0 ? "+" : ""}${errorDelta.toFixed(1)}%`,
    },
    {
      label: "High Overlap Rate",
      currentValue: curOverlapRate,
      previousValue: prevOverlapRate,
      delta: overlapDelta,
      direction: lowerIsBetter(overlapDelta),
      formattedCurrent: `${curOverlapRate.toFixed(1)}%`,
      formattedPrevious: `${prevOverlapRate.toFixed(1)}%`,
      formattedDelta:
        `${overlapDelta >= 0 ? "+" : ""}${overlapDelta.toFixed(1)}%`,
    },
    {
      label: "Most Common Issue",
      currentValue: curTopIssue?.[1] ?? 0,
      previousValue: prevTopIssue?.[1] ?? 0,
      delta: issueDelta,
      direction: lowerIsBetter(issueDelta),
      formattedCurrent: curTopIssue ? `${curTopIssue[0]} (${curTopIssue[1]})` : "None",
      formattedPrevious: prevTopIssue ? `${prevTopIssue[0]} (${prevTopIssue[1]})` : "None",
      formattedDelta: issueDelta >= 0 ? `+${issueDelta}` : String(issueDelta),
    },
  ];
}

export interface ChartComparisonData {
  errorRateByCategory: {
    name: string;
    currentRate: number;
    previousRate: number;
    delta: number;
  }[];
  issueTypeDistribution: {
    name: string;
    currentCount: number;
    previousCount: number;
    delta: number;
  }[];
  auditsByRetailer: {
    name: string;
    currentCount: number;
    previousCount: number;
    delta: number;
  }[];
}

/**
 * Compute side-by-side chart data for two audit sets.
 */
export function computeChartComparisons(
  current: AuditRecord[],
  previous: AuditRecord[]
): ChartComparisonData {
  // Error rate by category
  const categoryStats = (audits: AuditRecord[]) => {
    const map: Record<string, { total: number; fail: number }> = {};
    for (const a of audits) {
      const cat = (a.category || "Uncategorized").trim();
      if (!map[cat]) map[cat] = { total: 0, fail: 0 };
      map[cat].total += 1;
      if (!(a.status ?? false)) map[cat].fail += 1;
    }
    return map;
  };
  const curCats = categoryStats(current);
  const prevCats = categoryStats(previous);
  const allCats = new Set([...Object.keys(curCats), ...Object.keys(prevCats)]);

  const errorRateByCategory = Array.from(allCats)
    .map((name) => {
      const cur = curCats[name];
      const prev = prevCats[name];
      const currentRate = cur && cur.total > 0 ? (cur.fail / cur.total) * 100 : 0;
      const previousRate = prev && prev.total > 0 ? (prev.fail / prev.total) * 100 : 0;
      return {
        name,
        currentRate: Math.round(currentRate * 10) / 10,
        previousRate: Math.round(previousRate * 10) / 10,
        delta: Math.round((currentRate - previousRate) * 10) / 10,
      };
    })
    .sort((a, b) => b.currentRate - a.currentRate);

  // Issue type distribution
  const issueStats = (audits: AuditRecord[]) => {
    const map: Record<string, number> = {};
    for (const a of audits) {
      if (a.status ?? false) continue;
      const t = (a.issueType ?? "").trim();
      if (t) map[t] = (map[t] ?? 0) + 1;
    }
    return map;
  };
  const curIssues = issueStats(current);
  const prevIssues = issueStats(previous);
  const allIssues = new Set([...Object.keys(curIssues), ...Object.keys(prevIssues)]);

  const issueTypeDistribution = Array.from(allIssues)
    .map((name) => ({
      name,
      currentCount: curIssues[name] ?? 0,
      previousCount: prevIssues[name] ?? 0,
      delta: (curIssues[name] ?? 0) - (prevIssues[name] ?? 0),
    }))
    .sort((a, b) => b.currentCount - a.currentCount);

  // Audits by retailer
  const retailerStats = (audits: AuditRecord[]) => {
    const map: Record<string, number> = {};
    for (const a of audits) {
      const r = (a.retailer || "Unknown").trim();
      map[r] = (map[r] ?? 0) + 1;
    }
    return map;
  };
  const curRetailers = retailerStats(current);
  const prevRetailers = retailerStats(previous);
  const allRetailers = new Set([...Object.keys(curRetailers), ...Object.keys(prevRetailers)]);

  const auditsByRetailer = Array.from(allRetailers)
    .map((name) => ({
      name,
      currentCount: curRetailers[name] ?? 0,
      previousCount: prevRetailers[name] ?? 0,
      delta: (curRetailers[name] ?? 0) - (prevRetailers[name] ?? 0),
    }))
    .sort((a, b) => b.currentCount - a.currentCount);

  return { errorRateByCategory, issueTypeDistribution, auditsByRetailer };
}
