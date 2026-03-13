"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import type { AuditRecord } from "@/lib/types";

const CHART_COLORS = ["#300E45", "#5c3d6e", "#f59e0b", "#ef4444", "#6b7280"];
const PASS_COLOR = "#22c55e";
const FAIL_COLOR = "#ef4444";

interface IssueChartsProps {
  audits: AuditRecord[];
}

export default function IssueCharts({ audits }: IssueChartsProps) {
  const failAudits = audits.filter((a) => !(a.status ?? false));
  const byIssueType = Object.entries(
    failAudits.reduce<Record<string, number>>((acc, a) => {
      const t = (a.issueType ?? "").trim();
      if (t) acc[t] = (acc[t] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const byCategoryRaw = audits.reduce<
    Record<string, { pass: number; fail: number }>
  >((acc, a) => {
    const cat = a.category || "Uncategorized";
    if (!acc[cat]) acc[cat] = { pass: 0, fail: 0 };
    if (a.status) acc[cat].pass++;
    else acc[cat].fail++;
    return acc;
  }, {});

  const byCategory = Object.entries(byCategoryRaw)
    .map(([name, counts]) => ({
      name,
      pass: counts.pass,
      fail: counts.fail,
      total: counts.pass + counts.fail,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 12);

  if (audits.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
        Add audit entries to see charts.
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-800">Issues by Category</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byCategory} layout="vertical" margin={{ left: 80, right: 20 }}>
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
                      <p className="text-sm text-green-600">Pass: {p.pass}</p>
                      <p className="text-sm text-red-600">Fail: {p.fail}</p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="pass" name="Pass" stackId="a" fill={PASS_COLOR} radius={[0, 0, 0, 0]} />
              <Bar dataKey="fail" name="Fail" stackId="a" fill={FAIL_COLOR} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-800">Issue Type Distribution</h3>
        <div className="h-72">
          {failAudits.length === 0 ? (
            <div className="flex h-full items-center justify-center text-gray-500">
              No failures to display. Issue types apply to Fail entries only.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byIssueType}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                >
                  {byIssueType.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
