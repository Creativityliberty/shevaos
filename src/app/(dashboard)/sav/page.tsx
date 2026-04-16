import { getIncidents } from "@/features/sav/actions/incident-actions";
import { SavClient } from "./SavClient";

export const dynamic = "force-dynamic";

export default async function SavPage() {
  const incidents = await getIncidents();

  return (
    <div className="max-w-[1400px] mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <SavClient initialIncidents={incidents} />
    </div>
  );
}
