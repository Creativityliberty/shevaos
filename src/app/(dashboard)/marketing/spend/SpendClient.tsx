"use client";

import { useState } from "react";
import { 
  History, 
  Save, 
  Calendar as CalendarIcon,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Megaphone
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { upsertSpendLog } from "@/features/marketing/actions/spend-actions";

interface Props {
  activeCampaigns: any[];
  initialLogs: any[];
  initialDate: string;
}

export function SpendClient({ activeCampaigns, initialLogs, initialDate }: Props) {
  const router = useRouter();
  const [date, setDate] = useState(initialDate);
  const [isSaving, setIsSaving] = useState(false);
  const [logs, setLogs] = useState<Record<string, any>>(
    initialLogs.reduce((acc, log) => ({ 
      ...acc, 
      [log.campaign_id]: { 
        amount: log.spend_amount,
        reach: log.reach || "",
        clicks: log.clicks || ""
      } 
    }), {})
  );

  const handleUpdateLog = (campaignId: string, field: string, value: string) => {
    setLogs(prev => ({
      ...prev,
      [campaignId]: {
        ...(prev[campaignId] || { amount: "", reach: "", clicks: "" }),
        [field]: value
      }
    }));
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    let successCount = 0;
    
    try {
      const promises = Object.entries(logs).map(([campaignId, data]) => {
        if (!data.amount || data.amount === "0") return null;
        
        return upsertSpendLog({
          campaign_id: campaignId,
          log_date: date,
          spend_amount: parseFloat(data.amount),
          reach: data.reach ? parseInt(data.reach) : undefined,
          clicks: data.clicks ? parseInt(data.clicks) : undefined
        });
      }).filter(Boolean);

      if (promises.length === 0) {
        toast.info("Aucune dépense à enregistrer");
        return;
      }

      await Promise.all(promises);
      toast.success(`${promises.length} dépenses enregistrées pour le ${date}`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  };

  const totalSpent = Object.values(logs).reduce((sum, l) => sum + (parseFloat(l.amount) || 0), 0);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="rounded-[2.5rem] p-8 border-gray-100 bg-white group overflow-hidden relative">
            <div className="flex items-center gap-4 mb-4">
               <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 transition-transform group-hover:scale-110">
                  <TrendingUp className="w-6 h-6" />
               </div>
               <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Total Saisi</div>
            </div>
            <div className="text-3xl font-black text-gray-900 tracking-tight">
               {totalSpent.toLocaleString()} <span className="text-sm font-bold text-gray-400 uppercase">FCFA</span>
            </div>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-50 rounded-full blur-2xl opacity-20" />
         </Card>

         <Card className="rounded-[2.5rem] p-8 border-gray-100 bg-white">
            <div className="flex items-center gap-4 mb-4">
               <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                  <CalendarIcon className="w-6 h-6" />
               </div>
               <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Date du Journal</div>
            </div>
            <Input 
              type="date" 
              value={date} 
              onChange={(e) => {
                setDate(e.target.value);
                router.push(`/marketing/spend?date=${e.target.value}`);
              }}
              className="h-12 rounded-xl border-gray-100 bg-gray-50/50 font-bold text-center"
            />
         </Card>

         <div className="flex items-center justify-center">
            <Button 
               disabled={isSaving || totalSpent === 0}
               onClick={handleSaveAll}
               className="w-full h-20 rounded-[2rem] bg-gray-900 hover:bg-black text-white font-black text-lg uppercase tracking-widest gap-4 shadow-xl active:scale-95 transition-all"
            >
               {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
               ENREGISTRER TOUT
            </Button>
         </div>
      </div>

      {/* Entry List */}
      <Card className="rounded-[3rem] border-gray-100 bg-white overflow-hidden shadow-sm">
         <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
            <div>
               <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Saisie des Dépenses</h2>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Inscrivez les dépenses réelles par campagne</p>
            </div>
            <div className="flex items-center gap-2">
               <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase px-4 py-1.5 rounded-full">
                  {activeCampaigns.length} Campagnes Actives
               </Badge>
            </div>
         </div>

         <div className="divide-y divide-gray-50">
            {activeCampaigns.map((c) => (
               <div key={c.id} className="p-8 flex flex-col md:flex-row items-start md:items-center gap-8 group hover:bg-gray-50/50 transition-colors">
                  <div className="w-full md:w-1/3 space-y-2">
                     <div className="flex items-center gap-2">
                        <Megaphone className="w-4 h-4 text-primary" />
                        <span className="font-black text-xs text-gray-400 uppercase tracking-widest">{c.platform}</span>
                     </div>
                     <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight line-clamp-1">{c.name}</h3>
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{c.marketing_account?.name}</p>
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-2">Dépense (FCFA)</label>
                        <div className="relative">
                           <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                           <Input 
                              type="number" 
                              placeholder="0"
                              value={logs[c.id]?.amount || ""}
                              onChange={(e) => handleUpdateLog(c.id, "amount", e.target.value)}
                              className="pl-12 h-14 rounded-2xl border-gray-100 bg-white group-hover:border-primary/20 transition-all font-black text-emerald-600" 
                           />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-2">Portée (Reach)</label>
                        <Input 
                           type="number" 
                           placeholder="Ex: 5000"
                           value={logs[c.id]?.reach || ""}
                           onChange={(e) => handleUpdateLog(c.id, "reach", e.target.value)}
                           className="h-14 rounded-2xl border-gray-100 bg-white font-bold" 
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-2">Clics</label>
                        <Input 
                           type="number" 
                           placeholder="Ex: 120"
                           value={logs[c.id]?.clicks || ""}
                           onChange={(e) => handleUpdateLog(c.id, "clicks", e.target.value)}
                           className="h-14 rounded-2xl border-gray-100 bg-white font-bold" 
                        />
                     </div>
                  </div>
               </div>
            ))}

            {activeCampaigns.length === 0 && (
               <div className="py-20 text-center space-y-4">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200">
                     <AlertCircle className="w-10 h-10" />
                  </div>
                  <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Aucune campagne active</p>
                  <Button variant="link" className="text-primary font-black uppercase text-[10px]" onClick={() => router.push('/marketing/campaigns')}>
                     Activer des campagnes
                  </Button>
               </div>
            )}
         </div>
      </Card>
    </div>
  );
}
