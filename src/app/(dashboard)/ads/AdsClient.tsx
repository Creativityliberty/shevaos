"use client";

import { useState } from "react";
import { 
  Megaphone, 
  TrendingUp, 
  DollarSign, 
  Plus, 
  Loader2, 
  CheckCircle2, 
  BarChart3,
  Facebook,
  Instagram,
  Globe
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface Props {
  initialCampaigns: any[];
}

export function AdsClient({ initialCampaigns }: Props) {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    platform: "Facebook Ads",
    actual_spend: 0
  });

  const handleAdd = async () => {
    if (!newCampaign.name) return;
    setIsLoading(true);
    const supabase = createClient();
    
    try {
      // Get tenant_id
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from("user_profiles").select("tenant_id").eq("id", user?.id).single();

      const { data, error } = await supabase
        .from("ads_campaigns")
        .insert({
          tenant_id: profile?.tenant_id,
          name: newCampaign.name,
          platform: newCampaign.platform,
          actual_spend: newCampaign.actual_spend,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      
      setCampaigns([data, ...campaigns]);
      setIsAdding(false);
      setNewCampaign({ name: "", platform: "Facebook Ads", actual_spend: 0 });
      toast.success("Campagne enregistrée");
    } catch (err: any) {
      toast.error("Erreur", { description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const totalSpend = campaigns.reduce((acc, curr) => acc + (curr.actual_spend || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner pt-1">
            <Megaphone className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Performance <span className="text-indigo-600">Marketing</span></h1>
            <p className="text-gray-500 font-medium tracking-tight">Suivi du Coût d'Acquisition Client (CAC).</p>
          </div>
        </div>

        <div className="bg-indigo-600 text-white px-8 py-4 rounded-[1.5rem] shadow-xl shadow-indigo-100 text-right min-w-[200px]">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Budget Total Consommé</p>
          <p className="text-3xl font-black">{totalSpend.toLocaleString('fr-FR')} <span className="text-sm font-bold">F</span></p>
        </div>
      </div>

      {/* Input Section */}
      {isAdding ? (
        <Card className="p-8 rounded-[2.5rem] border-2 border-indigo-100 bg-indigo-50/10 animate-in slide-in-from-top-4">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-indigo-400">Nom de la Campagne</label>
                <Input 
                  placeholder="Ex: SOLDES_AVRIL_FB" 
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                  className="rounded-xl border-gray-100 h-12 font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-indigo-400">Plateforme</label>
                <select 
                  className="w-full h-12 rounded-xl border-gray-100 bg-white px-4 font-bold outline-none border focus:ring-2 ring-indigo-500"
                  value={newCampaign.platform}
                  onChange={(e) => setNewCampaign({...newCampaign, platform: e.target.value})}
                >
                  <option>Facebook Ads</option>
                  <option>Instagram Ads</option>
                  <option>Google Ads</option>
                  <option>TikTok</option>
                  <option>Autre</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-indigo-400">Dépense Actuelle (F)</label>
                <Input 
                  type="number" 
                  value={newCampaign.actual_spend}
                  onChange={(e) => setNewCampaign({...newCampaign, actual_spend: Number(e.target.value)})}
                  className="rounded-xl border-gray-100 h-12 font-black text-lg"
                />
              </div>
           </div>
           <div className="flex gap-4 mt-8">
              <Button onClick={handleAdd} className="rounded-xl px-8 bg-indigo-600 hover:bg-indigo-700 h-12 font-black" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : "ENREGISTRER LA CAMPAGNE"}
              </Button>
              <Button variant="ghost" onClick={() => setIsAdding(false)} className="rounded-xl h-12 font-bold text-gray-400">Annuler</Button>
           </div>
        </Card>
      ) : (
        <Button 
          onClick={() => setIsAdding(true)}
          className="w-full h-16 rounded-[2rem] border-2 border-dashed border-gray-200 bg-white text-gray-400 hover:text-indigo-600 hover:border-indigo-400 transition-all font-black text-lg gap-3"
        >
          <Plus className="w-6 h-6" /> NOUVELLE CAMPAGNE
        </Button>
      )}

      {/* Campaigns List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((camp) => (
          <Card key={camp.id} className="p-6 rounded-[2.5rem] border-gray-100 hover:shadow-xl hover:scale-[1.02] transition-all group overflow-hidden relative bg-white">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <BarChart3 className="w-20 h-20" />
            </div>
            
            <div className="flex justify-between items-start mb-6">
               <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                 {camp.platform.includes("Facebook") ? <Facebook className="w-5 h-5"/> : <Globe className="w-5 h-5"/>}
               </div>
               <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px] uppercase">Active</Badge>
            </div>

            <div className="space-y-4 relative">
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">{camp.name}</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{camp.platform}</p>
              </div>

              <div className="pt-4 border-t border-gray-50 flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Coût Réel</p>
                  <p className="text-2xl font-black text-gray-900">{camp.actual_spend.toLocaleString('fr-FR')} F</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Achat/Ventes</p>
                   <p className="text-xs font-black text-emerald-600">Impact Direct</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
