"use client";

import { useState, useMemo, useEffect } from "react";
import type { AuditRecord } from "@/lib/types";
import AddEditForm from "./AddEditForm";
import TrashIcon from "./TrashIcon";

const PAGE_SIZE = 25;

function exportToCsv(audits: AuditRecord[]) {
  const headers = ["Category", "Retailer", "POG Link", "Issue Type", "Auditor", "Notes"];
  const rows = audits.map((a) =>
    [
      a.category,
      a.retailer,
      a.pogLink,
      a.issueType,
      a.auditor,
      `"${(a.notes ?? "").replace(/"/g, '""')}"`,
    ].join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `pog-audit-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AuditTable({ audits: initialAudits }: { audits: AuditRecord[] }) {
  const [audits, setAudits] = useState(initialAudits);
  const [configuredIssueTypes, setConfiguredIssueTypes] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AuditRecord | null>(null);
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<keyof AuditRecord | "">("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterRetailer, setFilterRetailer] = useState("");
  const [filterIssueType, setFilterIssueType] = useState("");
  const [searchNotes, setSearchNotes] = useState("");

  useEffect(() => {
    fetch("/api/issue-types")
      .then((r) => r.json())
      .then(setConfiguredIssueTypes)
      .catch(() => setConfiguredIssueTypes([]));
  }, []);

  const refresh = async () => {
    try {
      const res = await fetch("/api/audits");
      const data = await res.json();
      if (!res.ok || !Array.isArray(data)) {
        console.error("Audits API error:", data);
        return;
      }
      setAudits(data);
    } catch (err) {
      console.error("Failed to refresh audits:", err);
    }
  };

  const categories = useMemo(
    () => Array.from(new Set(audits.map((a) => a.category).filter(Boolean))).sort(),
    [audits]
  );
  const retailers = useMemo(
    () => Array.from(new Set(audits.map((a) => a.retailer).filter(Boolean))).sort(),
    [audits]
  );
  const issueTypesFromAudits = useMemo(
    () => Array.from(new Set(audits.map((a) => a.issueType).filter(Boolean))),
    [audits]
  );
  const issueTypes = useMemo(
    () =>
      Array.from(new Set([...configuredIssueTypes, ...issueTypesFromAudits])).sort(),
    [configuredIssueTypes, issueTypesFromAudits]
  );

  const filtered = useMemo(() => {
    let list = [...audits];
    if (filterCategory) list = list.filter((a) => a.category === filterCategory);
    if (filterRetailer) list = list.filter((a) => a.retailer === filterRetailer);
    if (filterIssueType) list = list.filter((a) => a.issueType === filterIssueType);
    if (searchNotes) {
      const q = searchNotes.toLowerCase();
      list = list.filter((a) => (a.notes ?? "").toLowerCase().includes(q));
    }
    if (sortKey) {
      list.sort((a, b) => {
        const va = a[sortKey] ?? "";
        const vb = b[sortKey] ?? "";
        const cmp = String(va).localeCompare(String(vb), undefined, { sensitivity: "base" });
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return list;
  }, [audits, filterCategory, filterRetailer, filterIssueType, searchNotes, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const handleSort = (key: keyof AuditRecord) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    const res = await fetch(`/api/audits/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert((err as { error?: string }).error ?? "Failed to delete");
      return;
    }
    setAudits((prev) => prev.filter((a) => a.id !== id));
    refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="rounded bg-storesight-purple px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Add Entry
        </button>
        <button
          onClick={() => exportToCsv(filtered)}
          disabled={filtered.length === 0}
          className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Export CSV
        </button>
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
          value={filterRetailer}
          onChange={(e) => {
            setFilterRetailer(e.target.value);
            setPage(1);
          }}
          className="rounded border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">All Retailers</option>
          {retailers.map((r) => (
            <option key={r} value={r}>
              {r}
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
        <input
          type="search"
          value={searchNotes}
          onChange={(e) => {
            setSearchNotes(e.target.value);
            setPage(1);
          }}
          placeholder="Search notes..."
          className="rounded border border-gray-300 bg-white px-3 py-2 text-sm w-48"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th
                className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 hover:bg-gray-200"
                onClick={() => handleSort("category")}
              >
                Category {sortKey === "category" && (sortDir === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 hover:bg-gray-200"
                onClick={() => handleSort("retailer")}
              >
                Retailer {sortKey === "retailer" && (sortDir === "asc" ? "↑" : "↓")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                POG Link
              </th>
              <th
                className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 hover:bg-gray-200"
                onClick={() => handleSort("issueType")}
              >
                Issue Type {sortKey === "issueType" && (sortDir === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 hover:bg-gray-200"
                onClick={() => handleSort("auditor")}
              >
                Auditor {sortKey === "auditor" && (sortDir === "asc" ? "↑" : "↓")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                Notes
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No audits yet. Click &quot;Add Entry&quot; to get started.
                </td>
              </tr>
            ) : (
              paginated.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">{a.category}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">{a.retailer}</td>
                  <td className="px-4 py-3 text-sm">
                    <a
                      href={a.pogLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-storesight-purple hover:underline"
                    >
                      {a.pogLink.length > 40 ? a.pogLink.slice(0, 40) + "…" : a.pogLink}
                    </a>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
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
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">{a.auditor}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-sm text-gray-600" title={a.notes}>
                    {a.notes}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        setEditing(a);
                        setShowForm(true);
                      }}
                      className="text-storesight-purple hover:underline text-sm mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
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

      {showForm && (
        <AddEditForm
          audit={editing}
          categories={categories}
          retailers={retailers}
          issueTypes={issueTypes}
          onIssueTypesChange={setConfiguredIssueTypes}
          onSave={() => {
            refresh();
            setShowForm(false);
            setEditing(null);
          }}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
