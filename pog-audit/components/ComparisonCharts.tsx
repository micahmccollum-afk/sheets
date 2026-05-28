"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LabelList,
} from "recharts";
import type { ChartComparisonData } from "@/lib/comparison";
import { COMPARISON_COLORS } from "@/lib/chartColors";

const CARD_CLASS = "rounded-xl border border-gray-200 bg-white p-6 shadow-sm";
const CHART_TITLE_CLASS = "mb-4 text-base font-semibold text-gray-900";
const GRID_STROKE = "#e5e7eb";

interface ComparisonChartsProps {
  chartData: ChartComparisonData;
  currentLabel: string;
  previousLabel: string;
}

function DeltaLabel({ value }: { value?: number }) {
  if (value === undefined || value === 0) return null;
  const color = value < 0 ? COMPARISON_COLORS.improvement : COMPARISON_COLORS.regression;
  return (
    <span style={{ color, fontSize: 11 }}>
      {value > 0 ? "+" : ""}{value}
    </span>
  );
}

export default function ComparisonCharts({
  chartData,
  currentLabel,
  previousLabel,
}: ComparisonChartsProps) {
  const { errorRateByCategory, issueTypeDistribution, auditsByRetailer } = chartData;

  const hasData =
    errorRateByCategory.length > 0 ||
    issueTypeDistribution.length > 0 ||
    auditsByRetailer.length > 0;

  if (!hasData) {
    return (
      <div className={`${CARD_CLASS} text-center text-gray-500`}>
        No data to compare.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
      {/* Error Rate by Category - Comparison */}
      <div className="flex flex-col gap-6">
        {errorRateByCategory.length > 0 && (
          <div className={CARD_CLASS}>
            <h3 className={CHART_TITLE_CLASS}>Error Rate by Category</h3>
            <div style={{ height: Math.max(200, errorRateByCategory.length * 50) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={errorRateByCategory}
                  layout="vertical"
                  margin={{ left: 88, right: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} horizontal vertical={false} />
                  <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const p = payload[0]?.payload;
                      return (
                        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
                          <p className="font-medium text-gray-900">{label}</p>
                          <p className="text-sm" style={{ color: COMPARISON_COLORS.current }}>
                            {currentLabel}: {p.currentRate}%
                          </p>
                          <p className="text-sm" style={{ color: COMPARISON_COLORS.previous }}>
                            {previousLabel}: {p.previousRate}%
                          </p>
                          <p className="mt-1 text-sm">
                            Change: <DeltaLabel value={p.delta} />
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Legend />
                  <Bar dataKey="currentRate" name={currentLabel} fill={COMPARISON_COLORS.current} radius={[0, 4, 4, 0]} barSize={12}>
                    <LabelList dataKey="currentRate" position="right" formatter={(v) => `${v}%`} className="text-xs fill-gray-700" />
                  </Bar>
                  <Bar dataKey="previousRate" name={previousLabel} fill={COMPARISON_COLORS.previous} radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Issue Type Distribution - Comparison */}
        {issueTypeDistribution.length > 0 && (
          <div className={CARD_CLASS}>
            <h3 className={CHART_TITLE_CLASS}>Issue Type Distribution</h3>
            <div style={{ height: Math.max(200, issueTypeDistribution.length * 50) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={issueTypeDistribution}
                  layout="vertical"
                  margin={{ left: 88, right: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} horizontal vertical={false} />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const p = payload[0]?.payload;
                      return (
                        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
                          <p className="font-medium text-gray-900">{label}</p>
                          <p className="text-sm" style={{ color: COMPARISON_COLORS.current }}>
                            {currentLabel}: {p.currentCount}
                          </p>
                          <p className="text-sm" style={{ color: COMPARISON_COLORS.previous }}>
                            {previousLabel}: {p.previousCount}
                          </p>
                          <p className="mt-1 text-sm">
                            Change: <DeltaLabel value={p.delta} />
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Legend />
                  <Bar dataKey="currentCount" name={currentLabel} fill={COMPARISON_COLORS.current} radius={[0, 4, 4, 0]} barSize={12}>
                    <LabelList dataKey="currentCount" position="right" className="text-xs fill-gray-700" />
                  </Bar>
                  <Bar dataKey="previousCount" name={previousLabel} fill={COMPARISON_COLORS.previous} radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Audits by Retailer - Comparison */}
      <div className="flex flex-col gap-6">
        {auditsByRetailer.length > 0 && (
          <div className={CARD_CLASS}>
            <h3 className={CHART_TITLE_CLASS}>Audits by Retailer</h3>
            <div style={{ height: Math.max(200, auditsByRetailer.length * 50) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={auditsByRetailer}
                  layout="vertical"
                  margin={{ left: 88, right: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} horizontal vertical={false} />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const p = payload[0]?.payload;
                      return (
                        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
                          <p className="font-medium text-gray-900">{label}</p>
                          <p className="text-sm" style={{ color: COMPARISON_COLORS.current }}>
                            {currentLabel}: {p.currentCount}
                          </p>
                          <p className="text-sm" style={{ color: COMPARISON_COLORS.previous }}>
                            {previousLabel}: {p.previousCount}
                          </p>
                          <p className="mt-1 text-sm">
                            Change: <DeltaLabel value={p.delta} />
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Legend />
                  <Bar dataKey="currentCount" name={currentLabel} fill={COMPARISON_COLORS.current} radius={[0, 4, 4, 0]} barSize={12}>
                    <LabelList dataKey="currentCount" position="right" className="text-xs fill-gray-700" />
                  </Bar>
                  <Bar dataKey="previousCount" name={previousLabel} fill={COMPARISON_COLORS.previous} radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
