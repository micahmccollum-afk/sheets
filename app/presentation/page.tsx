import { getAllAudits } from "@/lib/data";
import SummaryCards from "@/components/SummaryCards";
import IssueCharts from "@/components/IssueCharts";
import PresentationTable from "@/components/PresentationTable";

export default function PresentationPage() {
  const audits = getAllAudits();
  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2 text-2xl font-semibold text-gray-900">POG Audit Findings</h2>
        <p className="text-sm text-gray-600">
          Summary of planogram capture issues across product categories
        </p>
      </div>
      <SummaryCards audits={audits} />
      <IssueCharts audits={audits} />
      <PresentationTable audits={audits} />
    </div>
  );
}
