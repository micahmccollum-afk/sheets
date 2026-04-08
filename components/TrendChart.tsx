"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { AuditCycle, AuditRecord } from "@/lib/types";
import { COMPARISON_COLORS } from "@/lib/chartColors";

const CARD_CLASS = "rounded-xl border border-gray-200 bg-white p-6 shadow-sm";

interface TrendChartProps {
  cycles: AuditCycle[];
}

interface TrendPoint {
  name: string;
  errorRate: number;
  total: number;
  fails: number;
}

export default function TrendChart({ cycles }: TrendChartProps) {
  const [data, setData] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrend() {
      // Sort cycles chronologically
      const sorted = [...cycles].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      const points: TrendPoint[] = [];
      for (const cycle of sorted) {
        try {
          const res = await fetch(`/api/audits?cycleId=${cycle.id}`);
          if (!res.ok) continue;
          const audits: AuditRecord[] = await res.json();
          const total = audits.length;
          const fails = audits.filter((a) => !(a.status ?? false)).length;
          const errorRate = total > 0 ? Math.round((fails / total) * 1000) / 10 : 0;
          points.push({
            name: cycle.name,
            errorRate,
            total,
            fails,
          });
        } catch {
          // Skip failed fetches
        }
      }
      setData(points);
      setLoading(false);
    }
    loadTrend();
  }, [cycles]);

  if (loading) {
    return (
      <div className={`${CARD_CLASS} text-center text-gray-500`}>
        Loading trend data...
      </div>
    );
  }

  if (data.length < 2) return null;

  return (
    <div className={CARD_CLASS}>
      <h3 className="mb-4 text-base font-semibold text-gray-900">
        Error Rate Trend
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 8, right: 24, top: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              angle={-20}
              textAnchor="end"
              height={60}
            />
            <YAxis
              domain={[0, 100]}
              unit="%"
              tick={{ fontSize: 12 }}
              width={45}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0]?.payload;
                return (
                  <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
                    <p className="font-medium text-gray-900">{label}</p>
                    <p className="text-sm text-gray-600">
                      Error rate: {p.errorRate}% ({p.fails} / {p.total})
                    </p>
                  </div>
                );
              }}
            />
            <Line
              type="monotone"
              dataKey="errorRate"
              stroke={COMPARISON_COLORS.current}
              strokeWidth={2}
              dot={{ r: 4, fill: COMPARISON_COLORS.current }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
