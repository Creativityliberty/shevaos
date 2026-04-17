import { Suspense } from "react";
import { getMarketingAccounts } from "@/features/marketing/actions/account-actions";
import { AccountsClient } from "./AccountsClient";
import { Loader2 } from "lucide-react";

export default async function MarketingAccountsView() {
  const accounts = await getMarketingAccounts();

  return (
    <div className="container mx-auto">
      <Suspense fallback={
        <div className="flex items-center justify-center p-20 text-gray-400 gap-3 font-black uppercase tracking-widest">
          <Loader2 className="w-6 h-6 animate-spin" /> Chargement des comptes...
        </div>
      }>
        <AccountsClient initialAccounts={accounts} />
      </Suspense>
    </div>
  );
}
