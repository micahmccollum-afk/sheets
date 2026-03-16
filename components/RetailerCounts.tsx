"use client";

import type { AuditRecord } from "@/lib/types";

interface RetailerCountsProps {
  audits: AuditRecord[];
}

export default function RetailerCounts({ audits }: RetailerCountsProps) {
  const byRetailer = audits.reduce<Record<string, number>>((acc, a) => {
    const retailer = (a.retailer || "Unspecified").trim();
    acc[retailer] = (acc[retailer] ?? 0) + 1;
    return acc;
  }, {});

  const errorsByRetailer = audits
    .filter((a) => !(a.status ?? false))
    .reduce<Record<string, number>>((acc, a) => {
      const retailer = (a.retailer || "Unspecified").trim();
      acc[retailer] = (acc[retailer] ?? 0) + 1;
      return acc;
    }, {});

  const sortedTotal = Object.entries(byRetailer).sort((a, b) => b[1] - a[1]);
  const sortedErrors = Object.entries(errorsByRetailer).sort((a, b) => b[1] - a[1]);

  if (sortedTotal.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-800">Audits by Retailer</h3>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-700">
          {sortedTotal.map(([retailer, count]) => (
            <span key={retailer}>
              {retailer}: {count}
            </span>
          ))}
        </div>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-800">Errors by Retailer</h3>
        {sortedErrors.length === 0 ? (
          <p className="text-sm text-gray-500">No errors recorded yet.</p>
        ) : (
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-700">
            {sortedErrors.map(([retailer, count]) => (
              <span key={retailer}>
                {retailer}: {count}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
