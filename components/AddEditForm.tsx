"use client";

import { useState, useEffect, useRef } from "react";
import type { AuditRecord, AuditCycle } from "@/lib/types";
import { SEVERITY_OPTIONS } from "@/lib/types";
import ComboboxWithAdd from "./ComboboxWithAdd";
import IssueTypeManager from "./IssueTypeManager";

interface AddEditFormProps {
  audit?: AuditRecord | null;
  categories: string[];
  retailers: string[];
  issueTypes: string[];
  onIssueTypesChange?: (types: string[]) => void;
  onSave: (savedRecord?: AuditRecord) => void;
  onCancel: () => void;
  auditCycleId?: string;
  cycles?: AuditCycle[];
}

export default function AddEditForm({
  audit,
  categories,
  retailers,
  issueTypes,
  onIssueTypesChange,
  onSave,
  onCancel,
  auditCycleId,
  cycles = [],
}: AddEditFormProps) {
  const [status, setStatus] = useState<boolean>(true); // true=Pass, false=Fail
  const [selectedCycleId, setSelectedCycleId] = useState(auditCycleId ?? "");
  const [category, setCategory] = useState("");
  const [retailer, setRetailer] = useState("");
  const [pogLink, setPogLink] = useState("");
  const [issueType, setIssueType] = useState("");
  const [severity, setSeverity] = useState("");
  const [isHighOverlap, setIsHighOverlap] = useState(false);
  const [notes, setNotes] = useState("");
  const [showIssueTypeManager, setShowIssueTypeManager] = useState(false);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const isEditing = !!audit;
  const isFail = !status;

  useEffect(() => {
    if (audit) {
      setStatus(audit.status ?? false);
      setCategory(audit.category);
      setRetailer(audit.retailer);
      setPogLink(audit.pogLink);
      setIssueType(audit.issueType ?? "");
      setSeverity(audit.severity ?? "");
      setIsHighOverlap(audit.isHighOverlap ?? false);
      setNotes(audit.notes ?? "");
      setSelectedCycleId(audit.auditCycleId ?? "");
    } else {
      setStatus(true);
      setCategory("");
      setRetailer("");
      setPogLink("");
      setIssueType(issueTypes[0] ?? "");
      setSeverity("Medium");
      setIsHighOverlap(false);
      setNotes("");
    }
  }, [audit, issueTypes]);

  const handlePogLinkChange = (value: string) => {
    setPogLink(value);
    if (value.trim()) {
      submitButtonRef.current?.focus();
    }
  };

  const handlePogLinkPaste = () => {
    setTimeout(() => submitButtonRef.current?.focus(), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFail && !issueType.trim()) {
      return;
    }
    if (isFail && !severity.trim()) {
      return;
    }

    const payload: Record<string, unknown> = {
      category: category.trim(),
      retailer: retailer.trim(),
      pogLink: pogLink.trim(),
      status,
      issueType: isFail ? issueType.trim() : "",
      severity: isFail ? severity.trim() : undefined,
      isHighOverlap,
      notes: isFail ? (notes ?? "").trim() : "",
    };
    if (selectedCycleId) {
      payload.auditCycleId = selectedCycleId;
    }

    try {
      const res = audit
        ? await fetch(`/api/audits/${audit.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/audits", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = (err as { error?: string }).error ?? `Failed to save (${res.status})`;
        alert(msg);
        return;
      }
      const savedRecord = await res.json();
      onSave(savedRecord);
    } catch {
      alert("Failed to save");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          {isEditing ? "Edit Entry" : "Add Entry"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Status Toggle */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Status</label>
            <div className="inline-flex rounded-lg border border-gray-300 bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => setStatus(true)}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  status ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Pass
              </button>
              <button
                type="button"
                onClick={() => setStatus(false)}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  !status ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Fail
              </button>
            </div>
          </div>

          {cycles.length > 0 && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Audit Cycle</label>
              <select
                value={selectedCycleId}
                onChange={(e) => setSelectedCycleId(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-storesight-purple focus:outline-none focus:ring-1 focus:ring-storesight-purple"
              >
                <option value="">No Cycle</option>
                {cycles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}{c.isActive ? " (Active)" : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              list="categories-list"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-storesight-purple focus:outline-none focus:ring-1 focus:ring-storesight-purple"
              placeholder="e.g. Baby Care"
              required
            />
            <datalist id="categories-list">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Retailer</label>
            <ComboboxWithAdd
              value={retailer}
              onChange={setRetailer}
              options={retailers}
              placeholder="e.g. Walmart"
              addLabel="Add Retailer"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">POG Link</label>
            <input
              type="url"
              value={pogLink}
              onChange={(e) => handlePogLinkChange(e.target.value)}
              onPaste={handlePogLinkPaste}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-storesight-purple focus:outline-none focus:ring-1 focus:ring-storesight-purple"
              placeholder="https://..."
              required
            />
          </div>

          {isFail && (
            <>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">Issue Type</label>
                  <button
                    type="button"
                    onClick={() => setShowIssueTypeManager(true)}
                    className="text-xs text-storesight-purple hover:underline"
                  >
                    Manage types
                  </button>
                </div>
                <ComboboxWithAdd
                  value={issueType}
                  onChange={setIssueType}
                  options={issueTypes}
                  placeholder="Type or select issue type"
                  addLabel="Add Issue Type"
                  onAddNew={async (newType) => {
                    try {
                      const res = await fetch("/api/issue-types", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ type: newType }),
                      });
                      const data = await res.json().catch(() => ({}));
                      if (!res.ok) {
                        alert((data as { error?: string }).error ?? "Failed to add issue type");
                        return;
                      }
                      if (data.types) {
                        onIssueTypesChange?.(data.types);
                      }
                    } catch {
                      alert("Failed to add issue type");
                    }
                  }}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-storesight-purple focus:outline-none focus:ring-1 focus:ring-storesight-purple"
                  required={isFail}
                >
                  {SEVERITY_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {showIssueTypeManager && (
            <IssueTypeManager
              onClose={() => setShowIssueTypeManager(false)}
              onUpdate={(types) => onIssueTypesChange?.(types)}
            />
          )}

          <div>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={isHighOverlap}
                onChange={(e) => setIsHighOverlap(e.target.checked)}
                className="rounded border-gray-300 text-storesight-purple focus:ring-storesight-purple"
              />
              <span className="text-sm font-medium text-gray-700">High Overlap</span>
            </label>
          </div>

          {isFail && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-storesight-purple focus:outline-none focus:ring-1 focus:ring-storesight-purple"
                placeholder="Details about the issue..."
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              ref={submitButtonRef}
              type="submit"
              className="rounded bg-storesight-purple px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              {isEditing ? "Save" : "Add Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
