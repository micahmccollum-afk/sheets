"use client";

import type { AuditRecord } from "@/lib/types";

interface SummaryCardsProps {
  audits: AuditRecord[];
}

export default function SummaryCards({ audits }: SummaryCardsProps) {
  const byIssueType = audits.reduce<Record<string, number>>((acc, a) => {
    acc[a.issueType] = (acc[a.issueType] ?? 0) + 1;
    return acc;
  }, {});

  const byCategory = audits.reduce<Record<string, number>>((acc, a) => {
    acc[a.category] = (acc[a.category] ?? 0) + 1;
    return acc;
  }, {});

  const topIssueType = Object.entries(byIssueType).sort((a, b) => b[1] - a[1])[0];
  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-gray-500">Total Audits</p>
        <p className="mt-1 text-2xl font-semibold text-gray-900">{audits.length}</p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-gray-500">Categories Covered</p>
        <p className="mt-1 text-2xl font-semibold text-gray-900">
          {Object.keys(byCategory).length}
        </p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-gray-500">Most Common Issue</p>
        <p className="mt-1 text-lg font-semibold text-gray-900">
          {topIssueType ? `${topIssueType[0]} (${topIssueType[1]})` : "—"}
        </p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-gray-500">Highest Volume Category</p>
        <p className="mt-1 text-lg font-semibold text-gray-900">
          {topCategory ? `${topCategory[0]} (${topCategory[1]})` : "—"}
        </p>
      </div>
    </div>
  );
}
