import { getMarketingCampaigns } from "@/features/marketing/actions/campaign-actions";
import { getMarketingAccounts } from "@/features/marketing/actions/account-actions";
import { CampaignsClient } from "./CampaignsClient";

export default async function CampaignsPage() {
  const [campaigns, accounts] = await Promise.all([
    getMarketingCampaigns(),
    getMarketingAccounts()
  ]);

  return (
    <div className="container mx-auto">
      <CampaignsClient 
        initialCampaigns={campaigns} 
        accounts={accounts} 
      />
    </div>
  );
}
