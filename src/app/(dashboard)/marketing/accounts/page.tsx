import { getMarketingAccounts } from "@/features/marketing/actions/account-actions";
import { AccountsClient } from "./AccountsClient";

export default async function MarketingAccountsPage() {
  const accounts = await getMarketingAccounts();

  return (
    <div className="container mx-auto">
      <AccountsClient initialAccounts={accounts} />
    </div>
  );
}
