"use client";

import { useState } from "react";
import type { AuditCycle } from "@/lib/types";

interface BulkReassignProps {
  cycles: AuditCycle[];
  onClose: () => void;
  onComplete: () => void | Promise<void>;
}

export default function BulkReassign({
  cycles,
  onClose,
  onComplete,
}: BulkReassignProps) {
  const [sourceCycleId, setSourceCycleId] = useState("__unassigned__");
  const [targetCycleId, setTargetCycleId] = useState(
    cycles.find((c) => c.isActive)?.id ?? cycles[0]?.id ?? ""
  );
  const [reassigning, setReassigning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleReassign = async () => {
    if (!targetCycleId) {
      alert("Please select a target cycle");
      return;
    }
    if (sourceCycleId === targetCycleId) {
      alert("Source and target cycles are the same");
      return;
    }

    setReassigning(true);
    setResult(null);
    try {
      const res = await fetch("/api/audits/bulk-reassign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceCycleId,
          targetCycleId,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert((err as { error?: string }).error ?? "Bulk reassign failed");
        return;
      }

      const data = await res.json();
      const targetName =
        cycles.find((c) => c.id === targetCycleId)?.name ?? "target cycle";
      setResult(
        `Successfully reassigned ${data.reassigned} audit(s) to "${targetName}"`
      );
      await onComplete();
    } catch {
      alert("Bulk reassign failed");
    } finally {
      setReassigning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-1 text-lg font-semibold text-gray-900">
          Bulk Reassign Audits
        </h2>
        <p className="mb-4 text-sm text-gray-500">
          Move all audits from one cycle to another in a single operation.
        </p>

        <div className="space-y-4">
          {/* Source */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Move audits from:
            </label>
            <select
              value={sourceCycleId}
              onChange={(e) => setSourceCycleId(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-[#300E45] focus:outline-none focus:ring-1 focus:ring-[#300E45]"
            >
              <option value="__unassigned__">
                Unassigned (no cycle)
              </option>
              <option value="">All Audits</option>
              {cycles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.isActive ? " (Active)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Target */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Move to:
            </label>
            <select
              value={targetCycleId}
              onChange={(e) => setTargetCycleId(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-[#300E45] focus:outline-none focus:ring-1 focus:ring-[#300E45]"
            >
              <option value="" disabled>
                Select target cycle
              </option>
              {cycles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.isActive ? " (Active)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Result message */}
          {result && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
              {result}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {result ? "Done" : "Cancel"}
          </button>
          {!result && (
            <button
              type="button"
              onClick={handleReassign}
              disabled={reassigning || !targetCycleId}
              className="rounded bg-[#300E45] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {reassigning ? "Reassigning..." : "Reassign Audits"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
