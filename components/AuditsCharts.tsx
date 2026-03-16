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

const AUDIT_BAR_COLOR = "#93c5fd";
const ERROR_RATE_HIGH = "#ef4444";
const ERROR_RATE_MODERATE = "#f97316";
const ERROR_RATE_LOW = "#22c55e";

function getErrorRateSeverity(rate: number): "high" | "moderate" | "low" {
  if (rate >= 50) return "high";
  if (rate >= 25) return "moderate";
  return "low";
}

function getErrorRateColor(rate: number): string {
  const s = getErrorRateSeverity(rate);
  if (s === "high") return ERROR_RATE_HIGH;
  if (s === "moderate") return ERROR_RATE_MODERATE;
  return ERROR_RATE_LOW;
}

interface AuditsChartsProps {
  audits: AuditRecord[];
}

export default function AuditsCharts({ audits }: AuditsChartsProps) {
  const byCategory = Object.entries(
    audits.reduce<Record<string, number>>((acc, a) => {
      const cat = (a.category || "Uncategorized").trim();
      acc[cat] = (acc[cat] ?? 0) + 1;
      return acc;
    }, {})
  )
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  type RetailerEntry = { total: number; fail: number; displayName: string };
  const retailerMap = audits.reduce<Record<string, RetailerEntry>>((acc, a) => {
    const raw = (a.retailer || "Unspecified").trim() || "Unspecified";
    const key = raw.replace(/\s+/g, " ").toLowerCase();
    if (!acc[key]) acc[key] = { total: 0, fail: 0, displayName: raw };
    acc[key].total += 1;
    if (!(a.status ?? false)) acc[key].fail += 1;
    return acc;
  }, {});

  const byRetailer = Object.entries(retailerMap)
    .map(([, entry]) => ({ name: entry.displayName || "Unspecified", count: entry.total }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  const errorRateByRetailer = Object.entries(retailerMap)
    .map(([, entry]) => {
      const rate = entry.total > 0 ? (entry.fail / entry.total) * 100 : 0;
      return {
        name: entry.displayName || "Unspecified",
        rate: Math.round(rate * 10) / 10,
        total: entry.total,
        fail: entry.fail,
        labelText: `${entry.fail} / ${entry.total}`,
      };
    })
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 12);

  if (audits.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-800">Audits by Category</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byCategory} layout="vertical" margin={{ left: 80, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 12 }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const p = payload[0].payload;
                  return (
                    <div className="rounded border border-gray-200 bg-white p-3 shadow-lg">
                      <p className="font-medium text-gray-900">{label}</p>
                      <p className="text-sm text-gray-600">Audits: {p.count}</p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="count" fill={AUDIT_BAR_COLOR} radius={[0, 4, 4, 0]}>
                <LabelList dataKey="count" position="right" className="text-xs fill-gray-700" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-800">Audits by Retailer</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byRetailer} layout="vertical" margin={{ left: 120, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12 }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const p = payload[0].payload;
                  return (
                    <div className="rounded border border-gray-200 bg-white p-3 shadow-lg">
                      <p className="font-medium text-gray-900">{label}</p>
                      <p className="text-sm text-gray-600">Audits: {p.count}</p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="count" fill={AUDIT_BAR_COLOR} radius={[0, 4, 4, 0]}>
                <LabelList dataKey="count" position="right" className="text-xs fill-gray-700" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-800">Error Rate by Retailer</h3>
        <div className="h-72">
          {errorRateByRetailer.length === 0 ? (
            <div className="flex h-full items-center justify-center text-gray-500">
              No retailer data to display.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={errorRateByRetailer} layout="vertical" margin={{ left: 80, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" domain={[0, 100]} unit="%" />
                <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 12 }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const p = payload[0].payload;
                    return (
                      <div className="rounded border border-gray-200 bg-white p-3 shadow-lg">
                        <p className="font-medium text-gray-900">{label}</p>
                        <p className="text-sm text-gray-600">
                          Error rate: {p.rate}% ({p.fail} / {p.total})
                        </p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
                  {errorRateByRetailer.map((entry) => (
                    <Cell key={entry.name} fill={getErrorRateColor(entry.rate)} />
                  ))}
                  <LabelList dataKey="labelText" position="right" className="text-xs fill-gray-700" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-600">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: ERROR_RATE_HIGH }} aria-hidden />
              High (≥50%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: ERROR_RATE_MODERATE }} aria-hidden />
              Moderate (25–50%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: ERROR_RATE_LOW }} aria-hidden />
              {"Low (<25%)"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
