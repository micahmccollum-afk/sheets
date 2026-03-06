"use client";

import { useState, useEffect } from "react";
import { ISSUE_TYPES } from "@/lib/types";
import type { AuditRecord } from "@/lib/types";

interface AddEditFormProps {
  audit?: AuditRecord | null;
  categories: string[];
  retailers: string[];
  onSave: () => void;
  onCancel: () => void;
}

export default function AddEditForm({
  audit,
  categories,
  retailers,
  onSave,
  onCancel,
}: AddEditFormProps) {
  const [category, setCategory] = useState("");
  const [retailer, setRetailer] = useState("");
  const [pogLink, setPogLink] = useState("");
  const [issueType, setIssueType] = useState("Over Captured");
  const [otherIssueType, setOtherIssueType] = useState("");
  const [auditor, setAuditor] = useState("");
  const [notes, setNotes] = useState("");

  const isEditing = !!audit;

  useEffect(() => {
    if (audit) {
      setCategory(audit.category);
      setRetailer(audit.retailer);
      setPogLink(audit.pogLink);
      setIssueType(ISSUE_TYPES.includes(audit.issueType as any) ? audit.issueType : "Other");
      setOtherIssueType(ISSUE_TYPES.includes(audit.issueType as any) ? "" : audit.issueType);
      setAuditor(audit.auditor);
      setNotes(audit.notes);
    } else {
      setCategory("");
      setRetailer("");
      setPogLink("");
      setIssueType("Over Captured");
      setOtherIssueType("");
      setAuditor("");
      setNotes("");
    }
  }, [audit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const resolvedIssueType = issueType === "Other" ? otherIssueType : issueType;
    if (!resolvedIssueType.trim()) return;

    const payload = {
      category: category.trim(),
      retailer: retailer.trim(),
      pogLink: pogLink.trim(),
      issueType: resolvedIssueType.trim(),
      auditor: auditor.trim(),
      notes: notes.trim(),
    };

    try {
      if (audit) {
        await fetch(`/api/audits/${audit.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/audits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      onSave();
    } catch {
      alert("Failed to save");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {isEditing ? "Edit Entry" : "Add Entry"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              list="categories-list"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Retailer</label>
            <input
              type="text"
              value={retailer}
              onChange={(e) => setRetailer(e.target.value)}
              list="retailers-list"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g. Walmart"
              required
            />
            <datalist id="retailers-list">
              {retailers.map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">POG Link</label>
            <input
              type="url"
              value={pogLink}
              onChange={(e) => setPogLink(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="https://..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Issue Type</label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value as any)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {ISSUE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {issueType === "Other" && (
              <input
                type="text"
                value={otherIssueType}
                onChange={(e) => setOtherIssueType(e.target.value)}
                className="mt-2 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Describe issue type"
                required
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Auditor</label>
            <input
              type="text"
              value={auditor}
              onChange={(e) => setAuditor(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Your name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Details about the issue..."
            />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              {isEditing ? "Save" : "Add Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
