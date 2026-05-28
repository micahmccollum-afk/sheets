"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import type { AuditRecord } from "@/lib/types";
import { getErrorRateColor, getIssueTypeColor } from "@/lib/chartColors";

const CARD_CLASS =
  "rounded-xl border border-gray-200 bg-white p-6 shadow-sm";
const CHART_TITLE_CLASS = "mb-4 text-base font-semibold text-gray-900";
const GRID_STROKE = "#e5e7eb";
const TOP_N = 10;

interface IssueChartsProps {
  audits: AuditRecord[];
}

export default function IssueCharts({ audits }: IssueChartsProps) {
  const failAudits = audits.filter((a) => !(a.status ?? false));

  const byCategoryRaw = audits.reduce<
    Record<string, { total: number; fail: number }>
  >((acc, a) => {
    const cat = (a.category || "Uncategorized").trim();
    if (!acc[cat]) acc[cat] = { total: 0, fail: 0 };
    acc[cat].total += 1;
    if (!(a.status ?? false)) acc[cat].fail += 1;
    return acc;
  }, {});

  const errorRateByCategory = Object.entries(byCategoryRaw)
    .map(([name, { total, fail }]) => ({
      name,
      rate: total > 0 ? Math.round((fail / total) * 1000) / 10 : 0,
      total,
      fail,
      labelText: total > 0 ? `${((fail / total) * 100).toFixed(1)}%` : "0%",
    }))
    .sort((a, b) => b.rate - a.rate)
    .slice(0, TOP_N);

  const byIssueType = Object.entries(
    failAudits.reduce<Record<string, number>>((acc, a) => {
      const t = (a.issueType ?? "").trim();
      if (t) acc[t] = (acc[t] ?? 0) + 1;
      return acc;
    }, {})
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, TOP_N);

  if (audits.length === 0) {
    return (
      <div className={`${CARD_CLASS} text-center text-gray-500`}>
        Add audit entries to see charts.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className={CARD_CLASS}>
        <h3 className={CHART_TITLE_CLASS}>Error Rate by Category</h3>
        <div className="h-72">
          {errorRateByCategory.length === 0 ? (
            <div className="flex h-full items-center justify-center text-gray-500 text-sm">
              No category data to display.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={errorRateByCategory}
                layout="vertical"
                margin={{ left: 88, right: 48 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} horizontal={true} vertical={false} />
                <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const p = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
                        <p className="font-medium text-gray-900">{label}</p>
                        <p className="text-sm text-gray-600">
                          Error rate: {p.rate}% ({p.fail} / {p.total})
                        </p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
                  {errorRateByCategory.map((entry) => (
                    <Cell key={entry.name} fill={getErrorRateColor(entry.rate)} />
                  ))}
                  <LabelList dataKey="labelText" position="right" className="text-xs fill-gray-700" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className={CARD_CLASS}>
        <h3 className={CHART_TITLE_CLASS}>Issue Type Distribution</h3>
        <div className="h-72">
          {byIssueType.length === 0 ? (
            <div className="flex h-full items-center justify-center text-gray-500 text-sm">
              No failures to display. Issue types apply to Fail entries only.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={byIssueType}
                layout="vertical"
                margin={{ left: 88, right: 48 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} horizontal={true} vertical={false} />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const p = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
                        <p className="font-medium text-gray-900">{label}</p>
                        <p className="text-sm text-gray-600">Count: {p.value}</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {byIssueType.map((entry, i) => (
                    <Cell key={entry.name} fill={getIssueTypeColor(i)} />
                  ))}
                  <LabelList dataKey="value" position="right" className="text-xs fill-gray-700" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
