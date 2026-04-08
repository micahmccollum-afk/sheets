"use client";

import { useState } from "react";
import type { AuditCycle } from "@/lib/types";

interface CycleManagerProps {
  cycles: AuditCycle[];
  onClose: () => void;
  onRefresh: () => void | Promise<void>;
}

export default function CycleManager({
  cycles,
  onClose,
  onRefresh,
}: CycleManagerProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [activating, setActivating] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: name.trim(),
        isActive: true,
      };
      if (description.trim()) {
        payload.description = description.trim();
      }
      const res = await fetch("/api/audit-cycles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert((err as { error?: string }).error ?? "Failed to create cycle");
        return;
      }
      setName("");
      setDescription("");
      await onRefresh();
    } catch {
      alert("Failed to create cycle");
    } finally {
      setSaving(false);
    }
  };

  const handleActivate = async (id: string) => {
    setActivating(id);
    try {
      const res = await fetch(`/api/audit-cycles/${id}/activate`, {
        method: "POST",
      });
      if (!res.ok) {
        alert("Failed to activate cycle");
        return;
      }
      await onRefresh();
    } catch {
      alert("Failed to activate cycle");
    } finally {
      setActivating(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Manage Audit Cycles
        </h2>

        {/* Create new cycle */}
        <form onSubmit={handleCreate} className="mb-6 space-y-3">
          <h3 className="text-sm font-medium text-gray-700">
            Create New Cycle
          </h3>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., April 2026 Audit"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-[#300E45] focus:outline-none focus:ring-1 focus:ring-[#300E45]"
            required
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-[#300E45] focus:outline-none focus:ring-1 focus:ring-[#300E45]"
          />
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="rounded bg-[#300E45] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Cycle"}
          </button>
        </form>

        {/* Existing cycles */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">
            Existing Cycles ({cycles.length})
          </h3>
          {cycles.length === 0 ? (
            <p className="text-sm text-gray-500">
              No audit cycles yet. Create one above.
            </p>
          ) : (
            <div className="max-h-60 space-y-2 overflow-y-auto">
              {cycles.map((cycle) => (
                <div
                  key={cycle.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2"
                >
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      {cycle.name}
                    </span>
                    {cycle.isActive && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                        Active
                      </span>
                    )}
                    {cycle.description && (
                      <p className="text-xs text-gray-500">
                        {cycle.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">
                      Created{" "}
                      {new Date(cycle.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {!cycle.isActive && (
                    <button
                      onClick={() => handleActivate(cycle.id)}
                      disabled={activating === cycle.id}
                      className="rounded border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      {activating === cycle.id
                        ? "Activating..."
                        : "Set Active"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
