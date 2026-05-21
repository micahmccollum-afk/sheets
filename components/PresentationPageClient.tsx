"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { AuditRecord, AuditCycle } from "@/lib/types";
import {
  matchAudits,
  computeKPIDeltas,
  computeChartComparisons,
} from "@/lib/comparison";
import TabBar from "./TabBar";
import CycleSelector from "./CycleSelector";
import SummaryCards from "./SummaryCards";
import IssueCharts from "./IssueCharts";
import AuditsCharts from "./AuditsCharts";
import PresentationTable from "./PresentationTable";
import ComparisonSummaryCards from "./ComparisonSummaryCards";
import ComparisonCharts from "./ComparisonCharts";
import ComparisonTable from "./ComparisonTable";
import TrendChart from "./TrendChart";
import ExportButton from "./ExportButton";
import RefreshButton from "./RefreshButton";
import CycleManager from "./CycleManager";
import AnalyticsFilters from "./AnalyticsFilters";

const TABS = [
  { id: "current", label: "Current Audit" },
  { id: "previous", label: "Previous Audit" },
  { id: "comparison", label: "Comparison View" },
];

interface PresentationPageClientProps {
  cycles: AuditCycle[];
  initialAudits: AuditRecord[];
  initialActiveCycleId?: string;
}

export default function PresentationPageClient({
  cycles: initialCycles,
  initialAudits,
  initialActiveCycleId,
}: PresentationPageClientProps) {
  const [cycles, setCycles] = useState(initialCycles);
  const [activeTab, setActiveTab] = useState("current");
  const [currentCycleId, setCurrentCycleId] = useState(
    initialActiveCycleId ?? cycles[0]?.id ?? ""
  );
  const [previousCycleId, setPreviousCycleId] = useState(
    cycles[1]?.id ?? cycles[0]?.id ?? ""
  );
  const [currentAudits, setCurrentAudits] = useState(initialAudits);
  const [previousAudits, setPreviousAudits] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCycleManager, setShowCycleManager] = useState(false);
  const [clubFilter, setClubFilter] = useState("");
  const [retailerFilter, setRetailerFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const hasCycles = cycles.length > 0;

  const applyFilters = useCallback(
    (list: AuditRecord[]) =>
      list.filter((a) => {
        if (clubFilter) {
          const v = (a.clubType ?? "").trim();
          if (clubFilter === "Unspecified" ? v !== "" : v !== clubFilter) return false;
        }
        if (retailerFilter && (a.retailer ?? "").trim() !== retailerFilter) return false;
        if (categoryFilter && (a.category ?? "").trim() !== categoryFilter) return false;
        return true;
      }),
    [clubFilter, retailerFilter, categoryFilter]
  );

  const filteredInitial = useMemo(() => applyFilters(initialAudits), [applyFilters, initialAudits]);

  const retailerOptions = useMemo(
    () =>
      Array.from(
        new Set(
          [...currentAudits, ...previousAudits, ...initialAudits]
            .map((a) => (a.retailer ?? "").trim())
            .filter(Boolean)
        )
      ).sort(),
    [currentAudits, previousAudits, initialAudits]
  );

  const categoryOptions = useMemo(
    () =>
      Array.from(
        new Set(
          [...currentAudits, ...previousAudits, ...initialAudits]
            .map((a) => (a.category ?? "").trim())
            .filter(Boolean)
        )
      ).sort(),
    [currentAudits, previousAudits, initialAudits]
  );

  const handleFilterChange = (next: {
    clubFilter?: string;
    retailerFilter?: string;
    categoryFilter?: string;
  }) => {
    if (next.clubFilter !== undefined) setClubFilter(next.clubFilter);
    if (next.retailerFilter !== undefined) setRetailerFilter(next.retailerFilter);
    if (next.categoryFilter !== undefined) setCategoryFilter(next.categoryFilter);
  };

  const fetchAudits = useCallback(async (cycleId: string): Promise<AuditRecord[]> => {
    const res = await fetch(`/api/audits?cycleId=${cycleId}`);
    if (!res.ok) return [];
    return res.json();
  }, []);

  const refreshCycles = useCallback(async () => {
    const res = await fetch("/api/audit-cycles");
    if (res.ok) {
      const updated = await res.json();
      setCycles(updated);
    }
  }, []);

  // Fetch current cycle audits when cycle changes
  useEffect(() => {
    if (!currentCycleId || !hasCycles) return;
    setLoading(true);
    fetchAudits(currentCycleId).then((audits) => {
      setCurrentAudits(audits);
      setLoading(false);
    });
  }, [currentCycleId, hasCycles, fetchAudits]);

  // Fetch previous cycle audits when needed
  useEffect(() => {
    if (!previousCycleId || !hasCycles) return;
    if (activeTab !== "previous" && activeTab !== "comparison") return;
    fetchAudits(previousCycleId).then(setPreviousAudits);
  }, [previousCycleId, activeTab, hasCycles, fetchAudits]);

  // If no cycles, show the original view with all audits
  if (!hasCycles) {
    return (
      <div className="space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="mb-2 text-2xl font-semibold text-gray-900">
              POG Audit Findings
            </h2>
            <p className="text-sm text-gray-600">
              Summary of planogram capture issues across product categories
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCycleManager(true)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Create Audit Cycle
            </button>
            <RefreshButton />
            <ExportButton audits={filteredInitial} />
          </div>
        </div>
        <AnalyticsFilters
          clubFilter={clubFilter}
          retailerFilter={retailerFilter}
          categoryFilter={categoryFilter}
          retailers={retailerOptions}
          categories={categoryOptions}
          onChange={handleFilterChange}
        />
        <SummaryCards audits={filteredInitial} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          <IssueCharts audits={filteredInitial} />
          <AuditsCharts audits={filteredInitial} />
        </div>
        <PresentationTable audits={filteredInitial} />
        {showCycleManager && (
          <CycleManager
            cycles={cycles}
            onClose={() => setShowCycleManager(false)}
            onRefresh={async () => {
              await refreshCycles();
              window.location.reload();
            }}
          />
        )}
      </div>
    );
  }

  const filteredCurrent = applyFilters(currentAudits);
  const filteredPrevious = applyFilters(previousAudits);

  // Compute comparison data
  const comparisonResults = matchAudits(filteredCurrent, filteredPrevious);
  const kpiDeltas = computeKPIDeltas(filteredCurrent, filteredPrevious);
  const chartComparisons = computeChartComparisons(filteredCurrent, filteredPrevious);

  const displayAudits = activeTab === "previous" ? filteredPrevious : filteredCurrent;

  const currentCycleName =
    cycles.find((c) => c.id === currentCycleId)?.name ?? "Current";
  const previousCycleName =
    cycles.find((c) => c.id === previousCycleId)?.name ?? "Previous";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="mb-2 text-2xl font-semibold text-gray-900">
            POG Audit Findings
          </h2>
          <p className="text-sm text-gray-600">
            Summary of planogram capture issues across product categories
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCycleManager(true)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Manage Cycles
          </button>
          <RefreshButton />
          <ExportButton audits={displayAudits} />
        </div>
      </div>

      {/* Cycle selectors */}
      <div className="flex flex-wrap items-center gap-4">
        <CycleSelector
          cycles={cycles}
          selectedId={currentCycleId}
          onChange={setCurrentCycleId}
          label="Current:"
        />
        {(activeTab === "previous" || activeTab === "comparison") && (
          <CycleSelector
            cycles={cycles}
            selectedId={previousCycleId}
            onChange={setPreviousCycleId}
            label="Compare against:"
          />
        )}
      </div>

      {/* Filters */}
      <AnalyticsFilters
        clubFilter={clubFilter}
        retailerFilter={retailerFilter}
        categoryFilter={categoryFilter}
        retailers={retailerOptions}
        categories={categoryOptions}
        onChange={handleFilterChange}
      />

      {/* Tabs */}
      <TabBar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {loading && (
        <div className="py-8 text-center text-gray-500">Loading audit data...</div>
      )}

      {/* Current / Previous tabs */}
      {(activeTab === "current" || activeTab === "previous") && !loading && (
        <div className="space-y-8">
          <SummaryCards audits={displayAudits} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
            <IssueCharts audits={displayAudits} />
            <AuditsCharts audits={displayAudits} />
          </div>
          <PresentationTable audits={displayAudits} />
        </div>
      )}

      {/* Comparison tab */}
      {activeTab === "comparison" && !loading && (
        <div className="space-y-8">
          <ComparisonSummaryCards deltas={kpiDeltas} />
          <ComparisonCharts
            chartData={chartComparisons}
            currentLabel={currentCycleName}
            previousLabel={previousCycleName}
          />
          <ComparisonTable
            results={comparisonResults}
            cycleNames={{
              current: currentCycleName,
              previous: previousCycleName,
            }}
          />
          {cycles.length >= 2 && (
            <TrendChart cycles={cycles} />
          )}
        </div>
      )}

      {/* Cycle Manager Modal */}
      {showCycleManager && (
        <CycleManager
          cycles={cycles}
          onClose={() => setShowCycleManager(false)}
          onRefresh={async () => {
            await refreshCycles();
            // Refetch current audits
            if (currentCycleId) {
              const audits = await fetchAudits(currentCycleId);
              setCurrentAudits(audits);
            }
          }}
        />
      )}
    </div>
  );
}
