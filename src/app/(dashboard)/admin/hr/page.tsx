import { getContracts, getRecentPayrolls } from "@/features/hr/actions/hr-actions";
import { HrClient } from "./HrClient";

export const dynamic = "force-dynamic";

export default async function HrPage() {
  const [contracts, payrolls] = await Promise.all([
    getContracts(),
    getRecentPayrolls()
  ]);

  return (
    <div className="max-w-[1400px] mx-auto py-8 px-4 sm:px-6">
      <HrClient 
        initialContracts={contracts} 
        initialPayrolls={payrolls} 
      />
    </div>
  );
}
