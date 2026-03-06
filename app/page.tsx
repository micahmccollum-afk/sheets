import { getAllAudits } from "@/lib/data";
import AuditTable from "@/components/AuditTable";
import type { AuditRecord } from "@/lib/types";

export default async function Home() {
  let audits: AuditRecord[];
  try {
    audits = await getAllAudits();
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
