"use client";

import { useMemo, useState } from "react";
import type { ComparisonResult, ChangeStatus } from "@/lib/types";
import { CHANGE_STATUS_STYLES } from "@/lib/chartColors";

const ITEMS_PER_PAGE = 20;

function StatusBadge({ status }: { status: boolean | undefined }) {
  if (status === undefined) return <span className="text-gray-400">--</span>;
  return status ? (
    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
      Pass
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
      Fail
    </span>
  );
}

function ChangeBadge({ status }: { status: ChangeStatus }) {
  const style = CHANGE_STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}
    >
      {style.label}
    </span>
  );
}

interface ComparisonTableProps {
  results: ComparisonResult[];
  cycleNames: { current: string; previous: string };
}

export default function ComparisonTable({
  results,
  cycleNames,
}: ComparisonTableProps) {
  const [changeFilter, setChangeFilter] = useState<ChangeStatus | "all">("all");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (changeFilter === "all") return results;
    return results.filter((r) => r.changeStatus === changeFilter);
  }, [results, changeFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const pageResults = filtered.slice(
    page * ITEMS_PER_PAGE,
    (page + 1) * ITEMS_PER_PAGE
  );

  // Counts per status for filter chips
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: results.length };
    for (const r of results) {
      counts[r.changeStatus] = (counts[r.changeStatus] ?? 0) + 1;
    }
    return counts;
  }, [results]);

  if (results.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-sm">
        No comparison data available. Select two audit cycles with data to compare.
      </div>
    );
  }

  const filterOptions: { value: ChangeStatus | "all"; label: string }[] = [
    { value: "all", label: "All" },
    { value: "fixed", label: "Fixed" },
    { value: "new_issue", label: "New Issue" },
    { value: "persistent", label: "Persistent" },
    { value: "unchanged", label: "Unchanged" },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 p-4">
        <h3 className="text-base font-semibold text-gray-900">
          Audit Comparison
        </h3>
        <p className="mt-1 text-xs text-gray-500">
          {cycleNames.current} vs {cycleNames.previous}
        </p>

        {/* Filter chips */}
        <div className="mt-3 flex flex-wrap gap-2">
          {filterOptions.map((opt) => {
            const count = statusCounts[opt.value] ?? 0;
            const isActive = changeFilter === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => {
                  setChangeFilter(opt.value);
                  setPage(0);
                }}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-[#300E45] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {opt.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Change
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Current Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Previous Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Retailer
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Issue Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {pageResults.map((result, i) => {
              const cur = result.currentAudit;
              const prev = result.previousAudit;
              return (
                <tr key={`${result.matchKey}-${i}`} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3">
                    <ChangeBadge status={result.changeStatus} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <StatusBadge status={cur?.status} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <StatusBadge status={prev?.status} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                    {cur?.retailer ?? prev?.retailer ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                    {cur?.category ?? prev?.category ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                    {cur?.issueType || prev?.issueType || "—"}
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-sm text-gray-500" title={cur?.notes || prev?.notes || ""}>
                    {cur?.notes || prev?.notes || "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
          <span className="text-sm text-gray-500">
            Showing {page * ITEMS_PER_PAGE + 1}–
            {Math.min((page + 1) * ITEMS_PER_PAGE, filtered.length)} of{" "}
            {filtered.length}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
