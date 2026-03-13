"use client";

import type { AuditRecord } from "@/lib/types";

interface SummaryCardsProps {
  audits: AuditRecord[];
}

export default function SummaryCards({ audits }: SummaryCardsProps) {
  const total = audits.length;
  const failures = audits.filter((a) => !(a.status ?? false)).length;
  const highOverlapCount = audits.filter((a) => a.isHighOverlap ?? false).length;

  const errorRate = total > 0 ? (failures / total) * 100 : 0;
  const highOverlapRate = total > 0 ? (highOverlapCount / total) * 100 : 0;

  const failAudits = audits.filter((a) => !(a.status ?? false));
  const byIssueType = failAudits.reduce<Record<string, number>>((acc, a) => {
    const t = (a.issueType ?? "").trim();
    if (t) acc[t] = (acc[t] ?? 0) + 1;
    return acc;
  }, {});
  const topIssueType = Object.entries(byIssueType).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-gray-500">Total Audited</p>
        <p className="mt-1 text-2xl font-semibold text-gray-900">{total}</p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-gray-500">Error Rate</p>
        <p className="mt-1 text-3xl font-semibold text-gray-900">
          {errorRate.toFixed(1)}%
        </p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-gray-500">High Overlap Rate</p>
        <p className="mt-1 text-2xl font-semibold text-gray-900">
          {highOverlapRate.toFixed(1)}%
        </p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-gray-500">Most Common Issue</p>
        <p className="mt-1 text-lg font-semibold text-gray-900">
          {topIssueType ? `${topIssueType[0]} (${topIssueType[1]})` : "—"}
        </p>
      </div>
    </div>
  );
}
