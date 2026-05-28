import { getAllAudits, getAllAuditCycles } from "@/lib/data";
import PresentationPageClient from "@/components/PresentationPageClient";
import type { AuditRecord, AuditCycle } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PresentationPage() {
  let audits: AuditRecord[] = [];
  let cycles: AuditCycle[] = [];
  try {
    cycles = await getAllAuditCycles();
  } catch {
    cycles = [];
  }

  try {
    const activeCycle = cycles.find((c) => c.isActive) ?? cycles[0];
    audits = activeCycle
      ? await getAllAudits(activeCycle.id)
      : await getAllAudits();
  } catch {
    audits = [];
  }

  const activeCycleId =
    (cycles.find((c) => c.isActive) ?? cycles[0])?.id ?? undefined;

  return (
    <PresentationPageClient
      cycles={cycles}
      initialAudits={audits}
      initialActiveCycleId={activeCycleId}
    />
  );
}
