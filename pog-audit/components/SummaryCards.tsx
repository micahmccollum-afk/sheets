"use client";

import type { AuditRecord } from "@/lib/types";

const cardBase =
  "rounded-xl border border-gray-200 bg-white p-6 shadow-sm";

function IconTotalAudits() {
  return (
    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  );
}

function IconErrorRate() {
  return (
    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconMostCommonIssue() {
  return (
    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  );
}

interface SummaryCardsProps {
  audits: AuditRecord[];
}

export default function SummaryCards({ audits }: SummaryCardsProps) {
  const total = audits.length;
  const failures = audits.filter((a) => !(a.status ?? false)).length;

  const errorRate = total > 0 ? (failures / total) * 100 : 0;

  const failAudits = audits.filter((a) => !(a.status ?? false));
  const byIssueType = failAudits.reduce<Record<string, number>>((acc, a) => {
    const t = (a.issueType ?? "").trim();
    if (t) acc[t] = (acc[t] ?? 0) + 1;
    return acc;
  }, {});
  const topIssueType = Object.entries(byIssueType).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      <div className={cardBase}>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <IconTotalAudits />
          <span>Total Audits</span>
        </div>
        <p className="mt-2 text-4xl font-bold text-gray-900">{total}</p>
        <p className="mt-1 text-xs text-gray-400" aria-hidden>—</p>
      </div>

      <div className={cardBase}>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <IconErrorRate />
          <span>Error Rate</span>
        </div>
        <p className="mt-2 text-4xl font-bold text-gray-900">{errorRate.toFixed(1)}%</p>
        <p className="mt-1 text-xs text-gray-500">{failures} / {total}</p>
        <p className="mt-0.5 text-xs text-gray-400" aria-hidden>—</p>
      </div>

      <div className={cardBase}>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <IconMostCommonIssue />
          <span>Most Common Issue</span>
        </div>
        <p className="mt-2 text-lg font-bold text-gray-900">
          {topIssueType ? topIssueType[0] : "—"}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          {topIssueType ? `${topIssueType[1]} occurrences` : ""}
        </p>
        <p className="mt-0.5 text-xs text-gray-400" aria-hidden>—</p>
      </div>
    </div>
  );
}
