"use client";

import { useState, useEffect } from "react";
import type { AuditRecord } from "@/lib/types";
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
}

export default function AddEditForm({
  audit,
  categories,
  retailers,
  issueTypes,
  onIssueTypesChange,
  onSave,
  onCancel,
}: AddEditFormProps) {
  const [category, setCategory] = useState("");
  const [retailer, setRetailer] = useState("");
  const [pogLink, setPogLink] = useState("");
  const [issueType, setIssueType] = useState("");
  const [auditor, setAuditor] = useState("");
  const [notes, setNotes] = useState("");
  const [showIssueTypeManager, setShowIssueTypeManager] = useState(false);

  const isEditing = !!audit;

  useEffect(() => {
    if (audit) {
      setCategory(audit.category);
      setRetailer(audit.retailer);
      setPogLink(audit.pogLink);
      setIssueType(audit.issueType);
      setAuditor(audit.auditor);
      setNotes(audit.notes ?? "");
    } else {
      setCategory("");
      setRetailer("");
      setPogLink("");
      setIssueType(issueTypes[0] ?? "");
      setAuditor("Micah McCollum");
      setNotes("");
    }
  }, [audit, issueTypes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueType.trim()) return;

    const payload = {
      category: category.trim(),
      retailer: retailer.trim(),
      pogLink: pogLink.trim(),
      issueType: issueType.trim(),
      auditor: auditor.trim(),
      notes: (notes ?? "").trim(),
    };

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
              onChange={(e) => setPogLink(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-storesight-purple focus:outline-none focus:ring-1 focus:ring-storesight-purple"
              placeholder="https://..."
              required
            />
          </div>
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
          {showIssueTypeManager && (
            <IssueTypeManager
              onClose={() => setShowIssueTypeManager(false)}
              onUpdate={(types) => onIssueTypesChange?.(types)}
            />
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Auditor</label>
            <input
              type="text"
              value={auditor}
              onChange={(e) => setAuditor(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-storesight-purple focus:outline-none focus:ring-1 focus:ring-storesight-purple"
              placeholder="Your name"
              required
            />
          </div>
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
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
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
