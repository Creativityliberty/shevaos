import { getLedgerEntries } from "@/features/finance/actions/ledger-actions";
import { LedgerClient } from "./LedgerClient";

export default async function FinanceLedgerPage() {
  const entries = await getLedgerEntries();

  // Analyse macro du CA global validé (Cash rentré en caisse)
  const totalVerifiedCash = entries
    .filter(e => e.type === 'CASH_VERIFIED')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  // Analyse des dépenses et ajustements (si appliqués)
  const totalExpenses = entries
    .filter(e => e.type === 'EXPENSE')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  // Le solde pur
  const netBalance = totalVerifiedCash - Math.abs(totalExpenses);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">
          Le <span className="text-primary">Grand Livre</span>
        </h1>
        <p className="text-gray-500 font-medium mt-1">
          Journal immuable des flux financiers. Aucun enregistrement ne peut être effacé ni modifié.
        </p>
      </div>

      {/* KPIS Financiers Premium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-gray-900 text-white p-6 rounded-3xl shadow-xl border border-gray-800">
            <h3 className="text-xs uppercase font-bold text-gray-500 tracking-widest">Recettes Nettes Validées</h3>
            <div className="text-3xl font-black mt-2 text-emerald-400">
               + {totalVerifiedCash.toLocaleString()} <span className="text-sm">FCFA</span>
            </div>
         </div>
         <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-xs uppercase font-bold text-gray-400 tracking-widest">Sorties & Dépenses</h3>
            <div className="text-3xl font-black mt-2 text-red-500">
               - {Math.abs(totalExpenses).toLocaleString()} <span className="text-sm">FCFA</span>
            </div>
         </div>
         <div className="bg-primary/10 p-6 rounded-3xl shadow-sm border border-primary/20">
            <h3 className="text-xs uppercase font-bold text-gray-600 tracking-widest">Solde Dispo (Caisse centrale)</h3>
            <div className="text-3xl font-black mt-2 text-gray-900">
               {netBalance.toLocaleString()} <span className="text-sm text-gray-500">FCFA</span>
            </div>
         </div>
      </div>

      <LedgerClient entries={entries || []} />
    </div>
  );
}
