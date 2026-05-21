"use client";

interface AnalyticsFiltersProps {
  clubFilter: string;
  retailerFilter: string;
  categoryFilter: string;
  retailers: string[];
  categories: string[];
  onChange: (next: {
    clubFilter?: string;
    retailerFilter?: string;
    categoryFilter?: string;
  }) => void;
}

const SELECT_CLASS =
  "rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-storesight-purple focus:outline-none focus:ring-1 focus:ring-storesight-purple";

export default function AnalyticsFilters({
  clubFilter,
  retailerFilter,
  categoryFilter,
  retailers,
  categories,
  onChange,
}: AnalyticsFiltersProps) {
  const hasActive = !!(clubFilter || retailerFilter || categoryFilter);

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex flex-col">
        <label className="mb-1 text-xs font-medium text-gray-600">Club / Non-Club</label>
        <select
          value={clubFilter}
          onChange={(e) => onChange({ clubFilter: e.target.value })}
          className={SELECT_CLASS}
        >
          <option value="">All</option>
          <option value="Club">Club</option>
          <option value="Non-Club">Non-Club</option>
          <option value="Unspecified">Unspecified</option>
        </select>
      </div>

      <div className="flex flex-col">
        <label className="mb-1 text-xs font-medium text-gray-600">Retailer</label>
        <select
          value={retailerFilter}
          onChange={(e) => onChange({ retailerFilter: e.target.value })}
          className={SELECT_CLASS}
        >
          <option value="">All retailers</option>
          {retailers.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col">
        <label className="mb-1 text-xs font-medium text-gray-600">Category</label>
        <select
          value={categoryFilter}
          onChange={(e) => onChange({ categoryFilter: e.target.value })}
          className={SELECT_CLASS}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {hasActive && (
        <button
          type="button"
          onClick={() =>
            onChange({ clubFilter: "", retailerFilter: "", categoryFilter: "" })
          }
          className="text-sm text-storesight-purple hover:underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
