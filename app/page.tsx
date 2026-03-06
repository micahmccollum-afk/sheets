import { getAllAudits } from "@/lib/data";
import AuditTable from "@/components/AuditTable";

export default function Home() {
  let audits;
  try {
    audits = getAllAudits();
  } catch {
    audits = [];
  }
  return (
    <div>
      <h2 className="mb-4 text-xl font-medium text-gray-800">Audit Table</h2>
      <AuditTable audits={audits} />
    </div>
  );
}
