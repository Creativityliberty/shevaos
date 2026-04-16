import { getPendingDepositsForFinance } from "@/features/finance/actions/ledger-actions";
import { FinanceDepositClient } from "./FinanceDepositClient";

export default async function FinanceDepositsPage() {
  const pendingDeposits = await getPendingDepositsForFinance();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">
          Contrôle des <span className="text-primary">Recettes</span>
        </h1>
        <p className="text-gray-500 font-medium mt-1">
          {pendingDeposits.length} dépôt(s) validé(s) par les Hubs en attente de vérification financière.
        </p>
      </div>

      <FinanceDepositClient deposits={pendingDeposits || []} />
    </div>
  );
}
