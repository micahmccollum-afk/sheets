import { getAllAudits } from "@/lib/data";
import SummaryCards from "@/components/SummaryCards";
import CategoryCounts from "@/components/CategoryCounts";
import IssueCharts from "@/components/IssueCharts";
import PresentationTable from "@/components/PresentationTable";
import ExportButton from "@/components/ExportButton";
import RefreshButton from "@/components/RefreshButton";

export const dynamic = "force-dynamic";

export default async function PresentationPage() {
  const audits = await getAllAudits();
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="mb-2 text-2xl font-semibold text-gray-900">POG Audit Findings</h2>
          <p className="text-sm text-gray-600">
            Summary of planogram capture issues across product categories
          </p>
        </div>
        <div className="flex gap-2">
          <RefreshButton />
          <ExportButton audits={audits} />
        </div>
      </div>
      <SummaryCards audits={audits} />
      <CategoryCounts audits={audits} />
      <IssueCharts audits={audits} />
      <PresentationTable audits={audits} />
    </div>
  );
}
