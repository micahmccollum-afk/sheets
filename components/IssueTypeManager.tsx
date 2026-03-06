"use client";

import { useState, useEffect } from "react";

const DEFAULT_ISSUE_TYPES = ["Over Captured", "Under Captured", "Blurry", "Missing Sections"];

interface IssueTypeManagerProps {
  onClose: () => void;
  onUpdate: (types: string[]) => void;
}

export default function IssueTypeManager({ onClose, onUpdate }: IssueTypeManagerProps) {
  const [allTypes, setAllTypes] = useState<string[]>([]);
  const [newType, setNewType] = useState("");
  const [loading, setLoading] = useState(true);

  const customTypes = allTypes.filter((t) => !DEFAULT_ISSUE_TYPES.includes(t));

  useEffect(() => {
    fetch("/api/issue-types")
      .then((r) => r.json())
      .then((types) => {
        setAllTypes(types);
        setLoading(false);
      });
  }, []);

  const handleAdd = async () => {
    const trimmed = newType.trim();
    if (!trimmed) return;
    const res = await fetch("/api/issue-types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: trimmed }),
    });
    const data = await res.json();
    if (data.types) {
      setAllTypes(data.types);
      setNewType("");
      onUpdate(data.types);
    }
  };

  const handleRemove = async (type: string) => {
    if (DEFAULT_ISSUE_TYPES.includes(type)) return;
    const res = await fetch(`/api/issue-types/${encodeURIComponent(type)}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (data.types) {
      setAllTypes(data.types);
      onUpdate(data.types);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Manage Issue Types</h2>
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAdd())}
                placeholder="Add new issue type"
                className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-storesight-purple focus:outline-none focus:ring-1 focus:ring-storesight-purple"
              />
              <button
                type="button"
                onClick={handleAdd}
                disabled={!newType.trim()}
                className="rounded bg-storesight-purple px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                Add
              </button>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
                Default types
              </p>
              <ul className="space-y-1">
                {DEFAULT_ISSUE_TYPES.map((t) => (
                  <li key={t} className="flex items-center rounded bg-gray-50 px-3 py-2 text-sm">
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            {customTypes.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
                  Custom types
                </p>
                <ul className="space-y-1">
                  {customTypes.map((t) => (
                    <li
                      key={t}
                      className="flex items-center justify-between rounded bg-gray-50 px-3 py-2 text-sm"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() => handleRemove(t)}
                        className="text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
