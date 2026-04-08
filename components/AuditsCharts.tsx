"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import type { AuditRecord } from "@/lib/types";
import { VOLUME_BAR_COLOR } from "@/lib/chartColors";

const CARD_CLASS =
  "rounded-xl border border-gray-200 bg-white p-6 shadow-sm";
const CHART_TITLE_CLASS = "mb-4 text-base font-semibold text-gray-900";
const GRID_STROKE = "#e5e7eb";
const TOP_N = 10;

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
    .slice(0, TOP_N);

  const retailerMap = audits.reduce<Record<string, { total: number; displayName: string }>>((acc, a) => {
    const raw = (a.retailer || "Unspecified").trim() || "Unspecified";
    const key = raw.replace(/\s+/g, " ").toLowerCase();
    if (!acc[key]) acc[key] = { total: 0, displayName: raw };
    acc[key].total += 1;
    return acc;
  }, {});

  const byRetailer = Object.entries(retailerMap)
    .map(([, entry]) => ({ name: entry.displayName || "Unspecified", count: entry.total }))
    .sort((a, b) => b.count - a.count)
    .slice(0, TOP_N);

  if (audits.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className={CARD_CLASS}>
        <h3 className={CHART_TITLE_CLASS}>Audits by Retailer</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={byRetailer}
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
                      <p className="text-sm text-gray-600">Audits: {p.count}</p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="count" fill={VOLUME_BAR_COLOR} radius={[0, 4, 4, 0]}>
                <LabelList dataKey="count" position="right" className="text-xs fill-gray-700" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={CARD_CLASS}>
        <h3 className={CHART_TITLE_CLASS}>Audits by Category</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={byCategory}
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
                      <p className="text-sm text-gray-600">Audits: {p.count}</p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="count" fill={VOLUME_BAR_COLOR} radius={[0, 4, 4, 0]}>
                <LabelList dataKey="count" position="right" className="text-xs fill-gray-700" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
