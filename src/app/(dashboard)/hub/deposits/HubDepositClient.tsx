"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createDepositAsHub } from "@/features/cash/actions/deposit-actions";
import { CheckCircle2, ChevronRight, DollarSign, AlertTriangle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function HubDepositClient({ driversData }: { driversData: any[] }) {
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [countedAmount, setCountedAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const totalExpected = selectedDriver?.total || 0;
  const counted = Number(countedAmount) || 0;
  const discrepancy = counted - totalExpected;

  const handleDeposit = async () => {
    if(!selectedDriver) return;
    if(!countedAmount) { toast.error("Entrez le montant compté"); return; }
    
    setIsSubmitting(true);
    try {
      const res = await createDepositAsHub(
        selectedDriver.driverId, 
        totalExpected, 
        counted, 
        selectedDriver.collections
      );
      if (res.success) {
        toast.success("Dépôt Validé!", { description: "Le versement est enregistré." });
        setSelectedDriver(null);
        setCountedAmount("");
        router.refresh();
      } else {
        toast.error("Erreur", { description: res.error });
      }
    } catch(e: any) {
        toast.error("Exception", { description: e.message });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Liste des livreurs ayant de l'argent */}
      <div className="space-y-4">
         <h2 className="text-sm font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
           <DollarSign className="w-4 h-4" /> Livreurs en retour de tournée
         </h2>
         <div className="space-y-3">
           {driversData.length === 0 ? (
             <div className="p-4 bg-gray-50 text-gray-400 rounded-2xl text-center font-medium">
               Tous les livreurs ont été soldés 🎉
             </div>
           ) : (
             driversData.map((d: any) => (
                <div 
                  key={d.driverId}
                  onClick={() => { setSelectedDriver(d); setCountedAmount(""); }}
                  className={`p-5 rounded-3xl border-2 cursor-pointer transition-all flex justify-between items-center ${
                    selectedDriver?.driverId === d.driverId
                    ? "border-primary bg-orange-50/50 shadow-md transform scale-[1.02]"
                    : "border-gray-100 bg-white hover:border-orange-100"
                  }`}
                >
                  <div>
                    <h3 className="font-bold text-gray-900">{d.driver?.full_name}</h3>
                    <p className="text-sm font-medium text-gray-500">{d.collections.length} colis livrés</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-xl text-primary">{d.total.toLocaleString()} F</p>
                    <p className="text-[10px] uppercase font-bold text-gray-400">Attendu</p>
                  </div>
                </div>
             ))
           )}
         </div>
      </div>

      {/* Paneau Validation */}
      <div>
         {selectedDriver ? (
            <Card className="p-8 rounded-[2.5rem] border-gray-100 shadow-xl space-y-6 sticky top-8">
              <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                <div>
                  <h2 className="text-2xl font-black">{selectedDriver.driver?.full_name}</h2>
                  <p className="text-gray-500 font-medium">Validation du versement</p>
                </div>
                <div className="w-12 h-12 bg-orange-50 text-primary rounded-2xl flex items-center justify-center font-black">
                  {selectedDriver.collections.length}
                </div>
              </div>

              <div className="space-y-6">
                 <div>
                    <label className="text-xs uppercase font-bold text-gray-400">Montant théorique (Système)</label>
                    <div className="text-4xl font-black my-1 text-gray-400 line-through decoration-gray-300 opacity-70">
                       {totalExpected.toLocaleString()} FCFA
                    </div>
                 </div>

                 <div>
                    <label className="text-xs uppercase font-bold text-primary">Montant compté physiquement</label>
                    <div className="relative mt-2">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-6 h-6" />
                      <Input 
                        type="number"
                        placeholder="Ex: 50000"
                        className="pl-14 h-16 text-3xl font-black rounded-2xl border-2 border-primary/20 focus-visible:ring-primary focus-visible:border-primary shadow-inner"
                        value={countedAmount}
                        onChange={(e) => setCountedAmount(e.target.value)}
                      />
                    </div>
                 </div>

                 {countedAmount !== "" && (
                    <div className={`p-4 rounded-2xl flex items-start gap-3 ${discrepancy === 0 ? "bg-emerald-50 text-emerald-700" : discrepancy < 0 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
                       {discrepancy === 0 ? (
                         <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5" />
                       ) : (
                         <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
                       )}
                       <div>
                          <p className="font-bold">
                            {discrepancy === 0 ? "Le compte est bon" : discrepancy < 0 ? "Manquant détecté" : "Surplus détecté"}
                          </p>
                          {discrepancy !== 0 && (
                            <p className="font-medium text-sm">Écart de {Math.abs(discrepancy).toLocaleString()} FCFA</p>
                          )}
                       </div>
                    </div>
                 )}

                 <Button 
                   onClick={handleDeposit}
                   disabled={isSubmitting || !countedAmount}
                   className="w-full h-14 rounded-2xl font-black text-lg bg-gray-900 text-white hover:bg-black transition-all hover:scale-[1.02]"
                 >
                   {isSubmitting ? <Loader2 className="animate-spin w-6 h-6" /> : "VALIDER LE VERSEMENT"}
                 </Button>
              </div>
            </Card>
         ) : (
            <Card className="p-12 rounded-[2.5rem] border-dashed border-2 flex flex-col justify-center items-center h-full text-gray-400">
               <DollarSign className="w-16 h-16 opacity-20 mb-4" />
               <p className="font-bold text-lg">Sélectionnez un livreur</p>
               <p className="font-medium text-center max-w-xs mt-2">Cliquez sur un livreur pour compter son cash et créer le dépôt hub.</p>
            </Card>
         )}
      </div>
    </div>
  );
}
