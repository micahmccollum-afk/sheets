import { getAllAudits, getAllAuditCycles } from "@/lib/data";
import AuditTable from "@/components/AuditTable";
import type { AuditRecord, AuditCycle } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  let audits: AuditRecord[];
  try {
    audits = await getAllAudits();
  } catch {
    audits = [];
  }

  let cycles: AuditCycle[] = [];
  try {
    cycles = await getAllAuditCycles();
  } catch {
    cycles = [];
  }

  const activeCycleId = (cycles.find((c) => c.isActive) ?? cycles[0])?.id;

  return (
    <div>
      <h2 className="mb-4 text-xl font-medium text-gray-800">Audit Table</h2>
      <AuditTable audits={audits} cycles={cycles} activeCycleId={activeCycleId} />
    </div>
  );
}
