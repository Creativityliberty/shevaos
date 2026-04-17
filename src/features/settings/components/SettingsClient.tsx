"use client";

import { useState } from "react";
import { 
  Settings, 
  Building2, 
  Globe, 
  CreditCard, 
  Bell, 
  Shield, 
  Save,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { updateTenantSettings } from "@/features/settings/actions/settings-actions";

interface Props {
  tenant: any;
}

export function SettingsClient({ tenant }: Props) {
  const [isSaving, setIsSaving] = useState(false);
  const [enterpriseName, setEnterpriseName] = useState(tenant?.name || "");

  const onSave = async () => {
    setIsSaving(true);
    try {
      await updateTenantSettings(enterpriseName, tenant.settings);
      toast.success("Paramètres enregistrés");
    } catch (err: any) {
      toast.error(err.message || "Erreur de sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 h-fit">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Config. <span className="text-primary">Système</span></h1>
          <p className="text-gray-500 font-medium">Gérez votre infrastructure E-commerce et Trésorerie.</p>
        </div>
        <Button onClick={onSave} disabled={isSaving} className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-black font-black gap-3 shadow-lg shadow-orange-100 transition-all active:scale-95">
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          ENREGISTRER LES MODIFICATIONS
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Sidebar Settings (Visual only for now) */}
        <div className="lg:col-span-3 space-y-2">
           <button className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl bg-white border border-gray-100 text-primary font-black text-sm shadow-sm">
              <Building2 className="w-5 h-5" /> ENTREPRISE
           </button>
           <button className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-gray-400 font-bold text-sm hover:bg-white transition-all">
              <Globe className="w-5 h-5" /> LOCALISATION
           </button>
           <button className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-gray-400 font-bold text-sm hover:bg-white transition-all">
              <CreditCard className="w-5 h-5" /> FACTURATION
           </button>
           <button className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-gray-400 font-bold text-sm hover:bg-white transition-all">
              <Bell className="w-5 h-5" /> NOTIFICATIONS
           </button>
           <button className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-gray-400 font-bold text-sm hover:bg-white transition-all">
              <Shield className="w-5 h-5" /> SÉCURITÉ
           </button>
        </div>

        {/* Main Settings Card */}
        <div className="lg:col-span-9 space-y-8">
           <Card className="p-10 rounded-[3rem] bg-white border-gray-100 shadow-sm space-y-8">
              <div className="border-b border-gray-100 pb-6">
                 <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Identité de l'Entreprise</h2>
                 <p className="text-gray-400 font-medium text-sm">Ces informations apparaîtront sur vos factures et bons de livraison.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Nom Commercial</label>
                    <Input 
                        value={enterpriseName}
                        onChange={(e) => setEnterpriseName(e.target.value)}
                        className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold focus:bg-white transition-all"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Slug Système (Lecture seule)</label>
                    <Input 
                        disabled
                        value={tenant?.slug || ""}
                        className="h-14 rounded-2xl border-gray-100 bg-gray-200/20 font-mono text-xs"
                    />
                 </div>
              </div>

              <div className="p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100 space-y-4">
                 <div className="flex items-center gap-3 text-blue-600">
                    <Globe className="w-6 h-6" />
                    <h3 className="font-black uppercase tracking-tight">Configuration Régionale</h3>
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                       <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Devise</p>
                       <p className="text-sm font-black text-gray-900">XAF (FCFA)</p>
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Fuseau Horaire</p>
                       <p className="text-sm font-black text-gray-900">GMT+1 (Douala)</p>
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Langue</p>
                       <p className="text-sm font-black text-gray-900">Français (FR)</p>
                    </div>
                 </div>
              </div>
           </Card>

           <Card className="p-10 rounded-[3rem] bg-gray-900 text-white space-y-6">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary" />
                 </div>
                 <div>
                    <h3 className="text-xl font-black tracking-tight">Vérification de Conformité</h3>
                    <p className="text-gray-400 font-medium text-xs">Vitesse de synchronisation : Temps réel</p>
                 </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                 Le système SHEVA OS est configuré pour isoler vos données (Tenant Isolation). 
                 Chaque transaction est signée et liée à votre identifiant d'entreprise privé.
              </p>
           </Card>
        </div>
      </div>
    </div>
  );
}
