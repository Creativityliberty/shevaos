"use client";

import { useState } from "react";
import { 
  AlertTriangle, 
  Bell, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Search,
  Package,
  Wallet,
  Megaphone,
  ArrowRight,
  ShieldAlert
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface AlertsClientProps {
  initialAlerts: any[];
}

const TYPE_CONFIG: Record<string, { label: string, color: string, icon: any }> = {
  'BUDGET_ADS_90PCT': { label: "Budget Ads 90%", color: "bg-orange-50 text-orange-600 border-orange-100", icon: Megaphone },
  'BUDGET_ADS_100PCT': { label: "Budget Ads Épuisé", color: "bg-red-50 text-red-600 border-red-100", icon: ShieldAlert },
  'STOCK_LOW': { label: "Stock Faible", color: "bg-orange-50 text-orange-600 border-orange-100", icon: Package },
  'STOCK_OUT': { label: "Rupture Stock", color: "bg-red-50 text-red-600 border-red-100", icon: Package },
  'CASH_DISCREPANCY': { label: "Écart de Caisse", color: "bg-red-50 text-red-600 border-red-100", icon: Wallet },
  'INTERNAL_TRANSFER': { label: "Transfert Interne", color: "bg-blue-50 text-blue-600 border-blue-100", icon: Wallet },
  'DEFAULT': { label: "Alerte Système", color: "bg-gray-50 text-gray-600 border-gray-100", icon: Bell },
};

export function AlertsClient({ initialAlerts }: AlertsClientProps) {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = 
      alert.title?.toLowerCase().includes(search.toLowerCase()) ||
      alert.message?.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = filterType === "ALL" || alert.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const getAlertIcon = (type: string) => {
    const config = TYPE_CONFIG[type] || TYPE_CONFIG.DEFAULT;
    const Icon = config.icon;
    return <Icon className="w-5 h-5" />;
  };

  const getAlertColor = (type: string) => {
    return TYPE_CONFIG[type]?.color || TYPE_CONFIG.DEFAULT.color;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 px-4 sm:px-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm transition-all">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-[1.5rem] bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-100">
            <Bell className="w-8 h-8 animate-tada" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Radar <span className="text-orange-500">Alertes</span></h1>
            <p className="text-gray-500 font-medium tracking-tight">Surveillance en temps réel des incidents critiques.</p>
          </div>
        </div>

        <div className="flex gap-4">
          <Card className="px-6 py-3 rounded-2xl border-orange-50 bg-orange-50/30 flex flex-col items-end">
            <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">En attente</span>
            <span className="text-2xl font-black text-orange-600">{alerts.length}</span>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
          <Input 
            placeholder="Filtrer les messages d'alerte..."
            className="h-14 pl-12 rounded-2xl border-gray-100 bg-white shadow-sm focus:ring-orange-500 focus:border-orange-500 font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 bg-white p-1 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto no-scrollbar">
           {["ALL", "STOCK_OUT", "BUDGET_ADS_90PCT", "CASH_DISCREPANCY"].map((t) => (
             <Button
               key={t}
               variant={filterType === t ? "default" : "ghost"}
               className={cn(
                 "rounded-xl font-bold px-4 h-12 transition-all whitespace-nowrap",
                 filterType === t ? "bg-orange-500 text-white shadow-lg shadow-orange-100" : "text-gray-500 hover:text-orange-500 hover:bg-orange-50"
               )}
               onClick={() => setFilterType(t)}
             >
               {t === "ALL" ? "Toutes" : TYPE_CONFIG[t]?.label || t}
             </Button>
           ))}
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredAlerts.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-4 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
            <CheckCircle2 className="w-16 h-16 opacity-10" />
            <p className="font-bold uppercase tracking-widest text-sm italic">Aucune alerte pour le moment</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <Card key={alert.id} className="group relative overflow-hidden rounded-[2.5rem] border-gray-50 bg-white p-6 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all duration-300">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className={cn("p-4 rounded-2xl border shrink-0", getAlertColor(alert.type))}>
                   {getAlertIcon(alert.type)}
                </div>
                
                <div className="flex-1 space-y-1 text-left">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-black text-gray-900 tracking-tight uppercase">{alert.title}</h3>
                    <Badge variant="outline" className={cn("rounded-lg font-black text-[9px] uppercase tracking-widest px-2 py-0.5 border-none", getAlertColor(alert.type))}>
                       {TYPE_CONFIG[alert.type]?.label || alert.type}
                    </Badge>
                  </div>
                  <p className="text-gray-600 font-bold leading-relaxed">{alert.message}</p>
                  <div className="flex items-center gap-4 pt-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      {format(new Date(alert.created_at), "dd MMMM à HH:mm", { locale: fr })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-50">
                   <Button variant="ghost" className="rounded-xl font-black text-[10px] uppercase tracking-widest text-gray-400 hover:text-gray-900 gap-2 h-11 px-6">
                      Archiver
                   </Button>
                   <Button className="rounded-xl bg-gray-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-widest h-11 px-6 gap-2">
                      Traiter <ArrowRight className="w-4 h-4" />
                   </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
