"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { verifyAndLedgerDeposit } from "@/features/finance/actions/ledger-actions";
import { CheckCircle2, AlertTriangle, AlertCircle, Loader2, Landmark, Clock, Wallet } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export function FinanceDepositClient({ deposits, accounts }: { deposits: any[], accounts: any[] }) {
  const [selectedDeposit, setSelectedDeposit] = useState<any>(null);
  const [verifiedAmount, setVerifiedAmount] = useState<string>("");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Le but de la finance est de vérifier le "counted_amount" (ou le total théorique) physiquement.
  const theoricAmount = selectedDriverDeposit()?.declared_amount || 0;
  const expectedHubAmount = selectedDriverDeposit()?.counted_amount || 0;
  const verified = Number(verifiedAmount) || 0;
  const finalDiscrepancy = verified - expectedHubAmount;

  function selectedDriverDeposit() {
    return deposits.find(d => d.id === selectedDeposit?.id);
  }

  const handleVerify = async () => {
    if(!selectedDeposit) return;
    if(!verifiedAmount) { toast.error("Montant requis", { description: "Veuillez saisir la somme finale vérifiée par la banque ou par vous-même." }); return; }
    if(!selectedAccountId) { toast.error("Compte requis", { description: "Veuillez sélectionner le compte de trésorerie cible." }); return; }
    
    setIsSubmitting(true);
    try {
      const res = await verifyAndLedgerDeposit(selectedDeposit.id, verified, selectedAccountId, notes);
      if (res.success) {
        toast.success("Succès", { description: "L'argent est sécurisé, le solde du compte mis à jour et l'action gravée dans le Ledger." });
        setSelectedDeposit(null);
        setVerifiedAmount("");
        setSelectedAccountId("");
        setNotes("");
      } else {
        toast.error("Erreur d'audit", { description: res.error });
      }
    } catch(e: any) {
        toast.error("Erreur critique", { description: e.message });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* File d'attente */}
      <div className="lg:col-span-2 space-y-4">
        {deposits.length === 0 ? (
          <Card className="p-10 border-dashed border-2 flex flex-col items-center justify-center text-gray-400">
            <CheckCircle2 className="w-12 h-12 mb-3 opacity-20" />
            <span className="font-bold">Aucune vérification requise</span>
          </Card>
        ) : (
          <div className="space-y-4">
            {deposits.map(d => (
              <Card 
                key={d.id} 
                onClick={() => { setSelectedDeposit(d); setVerifiedAmount(d.counted_amount.toString()); }}
                className={`p-5 rounded-3xl cursor-pointer hover:shadow-md transition-all ${
                  selectedDeposit?.id === d.id ? "ring-2 ring-primary bg-orange-50/20" : ""
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="text-[10px] font-black uppercase text-gray-400 bg-gray-50 border-gray-100 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Validé Hub: {new Date(d.hub_validated_at).toLocaleTimeString()}
                  </Badge>
                  <span className="text-lg font-black text-gray-900">{d.counted_amount.toLocaleString()} F</span>
                </div>
                <div className="text-gray-500 font-medium text-sm">
                  Livreur : <span className="font-bold text-gray-800">{d.driver?.full_name || 'Inconnu'}</span>
                </div>
                {d.discrepancy_amount !== 0 && (
                  <div className="mt-2 text-xs font-bold text-red-500 bg-red-50 p-2 rounded-xl flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> 
                    Le Hub a signalé un écart de {Math.abs(d.discrepancy_amount).toLocaleString()} F !
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Paneau Financier */}
      <div className="lg:col-span-3">
        {selectedDeposit ? (
          <Card className="p-8 rounded-[2.5rem] bg-gray-900 text-white shadow-xl space-y-8 sticky top-8 border-gray-800">
             <div className="border-b border-gray-800 pb-6 flex items-center gap-4">
               <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center">
                 <Landmark className="w-7 h-7 text-primary" />
               </div>
               <div>
                 <h2 className="text-2xl font-black">Audit Comptable final</h2>
                 <p className="text-gray-400 text-sm font-medium">Brouillard de caisse / Validation Ledger (Inviolable)</p>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-6 bg-black/40 p-6 rounded-3xl border border-gray-800">
                <div className="space-y-1">
                  <span className="text-xs uppercase font-bold text-gray-500">Théorique Système</span>
                  <div className="text-xl font-bold text-gray-300">{theoricAmount.toLocaleString()} F</div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs uppercase font-bold text-gray-500">Déclaré par Hub</span>
                  <div className="text-xl font-bold text-primary">{expectedHubAmount.toLocaleString()} F</div>
                </div>
             </div>

             <div className="space-y-4">
                <label className="text-xs uppercase font-black text-gray-400 tracking-widest">Montant vérifié Banque/Caisse</label>
                <Input 
                  type="number"
                  className="h-16 text-3xl font-black bg-gray-800 border-gray-700 text-white focus-visible:ring-primary focus-visible:border-primary rounded-2xl pl-8"
                  value={verifiedAmount}
                  onChange={e => setVerifiedAmount(e.target.value)}
                />

                {verifiedAmount !== "" && (
                  <div className="flex gap-4 items-center">
                    {finalDiscrepancy === 0 ? (
                      <span className="flex items-center gap-2 text-emerald-400 font-bold bg-emerald-400/10 px-4 py-2 rounded-xl text-sm">
                        <CheckCircle2 className="w-5 h-5" /> Validé exact
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-red-400 font-bold bg-red-400/10 px-4 py-2 rounded-xl text-sm">
                        <AlertCircle className="w-5 h-5" /> 
                        Écart au Ledger : {finalDiscrepancy.toLocaleString()} F (Sera comptabilisé)
                      </span>
                    )}
                  </div>
                )}
             </div>

             <div className="space-y-4">
                <label className="text-xs uppercase font-black text-gray-400 tracking-widest flex items-center gap-2">
                  <Wallet className="w-3 h-3" /> Compte de Trésorerie Cible
                </label>
                <Select onValueChange={(val: string | null) => setSelectedAccountId(val ?? "")} value={selectedAccountId}>
                  <SelectTrigger className="h-12 bg-gray-800 border-gray-700 rounded-xl text-white">
                    <SelectValue placeholder="Choisir où déposer l'argent..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl bg-gray-800 text-white border-gray-700">
                    {accounts.map(acc => (
                      <SelectItem key={acc.id} value={acc.id} className="focus:bg-gray-700 focus:text-white">
                        {acc.name} ({acc.type}) — {acc.balance.toLocaleString()} F
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
             </div>

             <div>
               <label className="text-xs uppercase font-black text-gray-400 tracking-widest block mb-2">Notes d'Audit (Optionnel)</label>
               <Input 
                 placeholder="Ex: Écart validé cause pourboire / erreur monnaie livreur, billet déchiré..."
                 className="h-12 bg-gray-800 border-gray-700 rounded-xl text-white"
                 value={notes}
                 onChange={e => setNotes(e.target.value)}
               />
             </div>

             <Button 
               onClick={handleVerify}
               disabled={isSubmitting || !verifiedAmount}
               className="w-full h-14 bg-primary text-black hover:bg-primary/90 font-black text-lg rounded-2xl"
             >
               {isSubmitting ? <Loader2 className="animate-spin w-6 h-6" /> : "Générer la ligne Ledger"}
             </Button>

          </Card>
        ) : (
           <Card className="p-12 h-full rounded-[2.5rem] border-dashed border-2 flex flex-col justify-center items-center text-gray-400 bg-gray-50/50">
             <Landmark className="w-16 h-16 opacity-20 mb-4" />
             <p className="font-bold text-lg">Sélectionnez une remise</p>
             <p className="font-medium text-center text-sm max-w-sm mt-2">Cliquez sur un dépôt du Hub pour l'auditer et figer le résultat en base.</p>
           </Card>
        )}
      </div>
    </div>
  );
}
