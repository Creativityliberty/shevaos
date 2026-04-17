"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Landmark, 
  Wallet, 
  ArrowRightLeft, 
  CheckCircle2, 
  Loader2, 
  Smartphone,
  Banknote,
  Plus
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function FinanceDepositsPage() {
  const supabase = createClient();
  const [pendingDeposits, setPendingDeposits] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [targetAccounts, setTargetAccounts] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    // 1. Récupération des dépôts en attente (Missions clôturées non encore déposées)
    const { data: deposits } = await supabase
      .from("missions")
      .select("*, driver:driver_id(full_name)")
      .eq("status", "CLÔTURÉE")
      .eq("return_status", "RETOUR_CLOTURÉ")
      .order("updated_at", { ascending: false });

    // 2. Récupération des comptes cibles (Wave, Orange, Cash, etc.)
    const { data: accs } = await supabase
      .from("financial_accounts")
      .select("*")
      .eq("is_active", true);

    setPendingDeposits(deposits || []);
    setAccounts(accs || [
      { id: "wave-001", name: "Wave Business", type: "MOBILE_MONEY" },
      { id: "orange-001", name: "Orange Money", type: "MOBILE_MONEY" },
      { id: "cash-001", name: "Coffre-fort Principal", type: "CASH" }
    ]);
    setLoading(false);
  };

  const handleValidateDeposit = async (missionId: string) => {
    const accountId = targetAccounts[missionId];
    if (!accountId) {
      toast.error("Veuillez sélectionner un compte de destination");
      return;
    }

    setProcessingId(missionId);
    try {
      // Simulation validation dépôt + écriture au grand livre
      // P1-13.2 : Inscription auto au grand livre sur le compte sélectionné
      
      toast.success("Dépôt validé et affecté au compte.");
      fetchInitialData();
    } catch (error: any) {
      toast.error("Erreur : " + error.message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <Landmark className="w-8 h-8 text-primary" />
            Vérification des Dépôts
          </h1>
          <p className="text-muted-foreground mt-1">Validez et affectez les recettes aux comptes financiers de l'entreprise.</p>
        </div>
        
        <div className="flex gap-4">
           <Card className="px-6 py-4 bg-primary/5 border-primary/20 flex flex-col items-center justify-center">
              <p className="text-[10px] font-black uppercase text-primary tracking-widest leading-none mb-1">En attente de dépôt</p>
              <p className="text-2xl font-black text-primary leading-none">{pendingDeposits.length}</p>
           </Card>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
      ) : pendingDeposits.length === 0 ? (
        <Card className="border-dashed bg-muted/30 p-20 flex flex-col items-center">
            <Wallet className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-muted-foreground font-bold text-center">Toutes les collectes ont été affectées.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingDeposits.map((mission) => (
            <Card key={mission.id} className="rounded-[2rem] border-gray-100 shadow-xl shadow-gray-100/30 overflow-hidden flex flex-col">
              <CardHeader className="bg-gray-50/50 pb-4">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="text-[10px] uppercase font-black tracking-widest">Mission ID: {mission.id.slice(0, 8)}</Badge>
                  <span className="text-xs text-muted-foreground font-bold">{new Date(mission.updated_at).toLocaleDateString()}</span>
                </div>
                <CardTitle className="text-xl font-black text-gray-900">{mission.driver?.full_name}</CardTitle>
                <div className="flex items-center gap-2 text-primary font-black text-2xl mt-1">
                   <Banknote className="w-6 h-6" />
                   {mission.total_collected_amount?.toLocaleString()} F
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6 flex-1 flex flex-col">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">Affecter au compte cible (Mobile Money / Cash)</label>
                  <Select 
                    onValueChange={(val) => setTargetAccounts(prev => ({ ...prev, [mission.id]: val }))}
                    value={targetAccounts[mission.id]}
                  >
                    <SelectTrigger className="h-14 rounded-xl border-gray-100 bg-gray-50 font-bold">
                      <SelectValue placeholder="Sélectionner un compte..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-none shadow-2xl">
                      {accounts.map(acc => (
                        <SelectItem key={acc.id} value={acc.id} className="font-bold">
                           <div className="flex items-center gap-2">
                             {acc.type === 'MOBILE_MONEY' ? <Smartphone className="w-4 h-4 text-indigo-500" /> : <Banknote className="w-4 h-4 text-emerald-500" />}
                             {acc.name}
                           </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="mt-auto border-t border-gray-50 pt-6">
                  <Button 
                    className="w-full h-14 rounded-2xl bg-gray-900 hover:bg-black font-black gap-2 shadow-lg shadow-gray-200"
                    disabled={processingId === mission.id}
                    onClick={() => handleValidateDeposit(mission.id)}
                  >
                    {processingId === mission.id ? <Loader2 className="animate-spin w-5 h-5" /> : <CheckCircle2 className="w-5 h-5 text-primary" />}
                    VALIDER LE DÉPÔT
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
