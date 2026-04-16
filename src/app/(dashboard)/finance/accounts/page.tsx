import { getFinanceAccounts, getInternalTransfers } from "@/features/finance/actions/account-actions";
import { AccountsClient } from "./AccountsClient";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  const [accounts, transfers] = await Promise.all([
    getFinanceAccounts(),
    getInternalTransfers()
  ]);

  return (
    <div className="max-w-[1400px] mx-auto py-8 px-4 sm:px-6">
      <AccountsClient 
        initialAccounts={accounts} 
        initialTransfers={transfers} 
      />
    </div>
  );
}
