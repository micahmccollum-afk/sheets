"use client";

import type { AuditRecord } from "@/lib/types";

interface CategoryCountsProps {
  audits: AuditRecord[];
}

export default function CategoryCounts({ audits }: CategoryCountsProps) {
  const byCategory = audits.reduce<Record<string, number>>((acc, a) => {
    const cat = (a.category || "Uncategorized").trim();
    acc[cat] = (acc[cat] ?? 0) + 1;
    return acc;
  }, {});

  const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-800">Audits by Category</h3>
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-700">
        {sorted.map(([category, count]) => (
          <span key={category}>
            {category}: {count}
          </span>
        ))}
      </div>
    </div>
  );
}
