import { getCampaignsForSpendEntry, getDailySpendLogs } from "@/features/marketing/actions/spend-actions";
import { SpendClient } from "./SpendClient";

export default async function MarketingSpendPage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const date = searchParams.date || new Date().toISOString().split("T")[0];
  
  const [activeCampaigns, existingLogs] = await Promise.all([
    getCampaignsForSpendEntry(),
    getDailySpendLogs(date)
  ]);

  return (
    <div className="container mx-auto">
      <SpendClient 
        activeCampaigns={activeCampaigns} 
        initialLogs={existingLogs}
        initialDate={date}
      />
    </div>
  );
}
