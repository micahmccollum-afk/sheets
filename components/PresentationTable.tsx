"use client";

import { useState, useMemo } from "react";
import type { AuditRecord } from "@/lib/types";

const PAGE_SIZE = 20;

export default function PresentationTable({ audits }: { audits: AuditRecord[] }) {
  const [filterStatus, setFilterStatus] = useState<"" | "pass" | "fail">("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterIssueType, setFilterIssueType] = useState("");
  const [page, setPage] = useState(1);

  const categories = useMemo(
    () => Array.from(new Set(audits.map((a) => a.category).filter(Boolean))).sort(),
    [audits]
  );
  const issueTypes = useMemo(
    () => Array.from(new Set(audits.map((a) => a.issueType).filter(Boolean))).sort(),
    [audits]
  );

  const filtered = useMemo(() => {
    let list = [...audits];
    if (filterStatus === "pass") list = list.filter((a) => a.status);
    if (filterStatus === "fail") list = list.filter((a) => !a.status);
    if (filterCategory) list = list.filter((a) => a.category === filterCategory);
    if (filterIssueType) list = list.filter((a) => a.issueType === filterIssueType);
    return list;
  }, [audits, filterStatus, filterCategory, filterIssueType]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  if (audits.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
        No audit entries yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value as "" | "pass" | "fail");
            setPage(1);
          }}
          className="rounded border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">All</option>
          <option value="pass">Passes Only</option>
          <option value="fail">Fails Only</option>
        </select>
        <select
          value={filterCategory}
          onChange={(e) => {
            setFilterCategory(e.target.value);
            setPage(1);
          }}
          className="rounded border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={filterIssueType}
          onChange={(e) => {
            setFilterIssueType(e.target.value);
            setPage(1);
          }}
          className="rounded border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">All Issue Types</option>
          {issueTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                Retailer
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                POG Link
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                Issue Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                Severity
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                High Overlap
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {paginated.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      a.status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {a.status ? "Pass" : "Fail"}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">{a.category}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">{a.retailer}</td>
                <td className="px-4 py-3 text-sm">
                  <a
                    href={a.pogLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-storesight-purple hover:underline"
                  >
                    View POG
                  </a>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {a.issueType ? (
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        a.issueType === "Over Captured"
                          ? "bg-amber-100 text-amber-800"
                          : a.issueType === "Under Captured"
                          ? "bg-orange-100 text-orange-800"
                          : a.issueType === "Blurry"
                          ? "bg-red-100 text-red-800"
                          : a.issueType === "Missing Sections"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {a.issueType}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                  {a.severity || "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm">
                  {a.isHighOverlap ? (
                    <span className="text-green-600">✓</span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="max-w-md px-4 py-3 text-sm text-gray-600">{a.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex justify-between">
          <p className="text-sm text-gray-600">
            Showing {(page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded border border-gray-300 bg-white px-3 py-1 text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <span className="flex items-center px-3 text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded border border-gray-300 bg-white px-3 py-1 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
