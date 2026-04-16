import { getDriverStats } from "@/features/fleet/actions/driver-actions";
import { DriverStatsClient } from "./DriverStatsClient";

export const dynamic = "force-dynamic";

export default async function DriverStatsPage() {
  const stats = await getDriverStats();

  return (
    <div className="max-w-xl mx-auto py-6 px-4">
      <DriverStatsClient initialStats={stats} />
    </div>
  );
}
