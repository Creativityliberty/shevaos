import { getDriversWithPendingCash } from "@/features/cash/actions/deposit-actions";
import { HubDepositClient } from "./HubDepositClient";

export default async function HubDepositsPage() {
  const pendingCashGroups = await getDriversWithPendingCash();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">
          Versement <span className="text-primary">Hub</span>
        </h1>
        <p className="text-gray-500 font-medium mt-1">
          {pendingCashGroups.length} livreur(s) ont de l'argent à déposer.
        </p>
      </div>

      <HubDepositClient driversData={pendingCashGroups} />
    </div>
  );
}
