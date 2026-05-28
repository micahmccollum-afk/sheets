"use client";

import type { AuditCycle } from "@/lib/types";

interface CycleSelectorProps {
  cycles: AuditCycle[];
  selectedId: string;
  onChange: (id: string) => void;
  label: string;
}

export default function CycleSelector({
  cycles,
  selectedId,
  onChange,
  label,
}: CycleSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-gray-600">{label}</label>
      <select
        value={selectedId}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 shadow-sm focus:border-[#300E45] focus:outline-none focus:ring-1 focus:ring-[#300E45]"
      >
        {cycles.map((cycle) => (
          <option key={cycle.id} value={cycle.id}>
            {cycle.name}
            {cycle.isActive ? " (Active)" : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
