"use client";

import type { AuditRecord } from "@/lib/types";

export default function ExportButton({ audits }: { audits: AuditRecord[] }) {
  const exportToCsv = () => {
    const headers = [
      "Status",
      "Category",
      "Retailer",
      "POG Link",
      "Issue Type",
      "Severity",
      "High Overlap",
      "Notes",
    ];
    const rows = audits.map((a) =>
      [
        a.status ? "Pass" : "Fail",
        a.category,
        a.retailer,
        a.pogLink,
        a.issueType ?? "",
        a.severity ?? "",
        a.isHighOverlap ? "Yes" : "No",
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
  };

  return (
    <button
      onClick={exportToCsv}
      disabled={audits.length === 0}
      className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
    >
      Export CSV
    </button>
  );
}
