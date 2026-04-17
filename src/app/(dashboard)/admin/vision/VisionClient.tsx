"use client";

import { useState, useEffect } from "react";
import { 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Users, 
  Package, 
  ArrowRight,
  ChevronRight,
  PieChart as PieChartIcon,
  Activity,
  ShieldCheck,
  Zap,
  Star,
  DollarSign
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Props {
  initialData: any;
}

export function VisionClient({ initialData }: Props) {
  const [data, setData] = useState(initialData);
  const [activeTab, setActiveTab] = useState<"performance" | "logistics" | "inventory">("performance");

  if (!data) return <div className="p-20 text-center font-black uppercase text-gray-400">Chargement de la Vision...</div>;

  const marginRate = data.revenue > 0 ? (data.net_margin / data.revenue) * 100 : 0;

  return (
    <div className="space-y-10 animate-in fade-in zoom-in-95 duration-1000 pb-24">
      
      {/* CEO Hero Header */}
      <div className="relative overflow-hidden bg-gray-900 rounded-[3.5rem] p-12 text-white shadow-2xl shadow-gray-200">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
               <Badge className="bg-emerald-500/20 text-emerald-400 border-none px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest">
                 Vision Stratégique
               </Badge>
               <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Temps Réel</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black tracking-tighter uppercase leading-none">
              Piloting <span className="text-emerald-400">Growth</span>
            </h1>
            <p className="text-gray-400 font-medium mt-4 max-w-xl text-lg">
              Analyse consolidée de la performance, rentabilité brute et efficacité opérationnelle sur les {data.period_days} derniers jours.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
             <div className="p-6 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-md">
                <p className="text-[10px] font-black uppercase text-emerald-400 tracking-widest mb-1">Marge Nette</p>
                <p className="text-3xl font-black tabular-nums">{Math.round(marginRate)}%</p>
             </div>
             <div className="p-6 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-md">
                <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-1">Taux Succès</p>
                <p className="text-3xl font-black tabular-nums">{data.success_rate}%</p>
             </div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex justify-center">
         <div className="bg-gray-100 p-2 rounded-[2rem] flex gap-2 shadow-inner border border-gray-200">
            {["performance", "logistics", "inventory"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={cn(
                  "px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest transition-all",
                  activeTab === tab 
                    ? "bg-gray-900 text-white shadow-xl scale-105" 
                    : "text-gray-400 hover:text-gray-900"
                )}
              >
                {tab}
              </button>
            ))}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
           {activeTab === "performance" && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-5 duration-700">
                {/* Financial Health Card */}
                <Card className="p-10 rounded-[3.5rem] bg-white border-gray-100 shadow-sm col-span-2 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-10 opacity-5">
                      <TrendingUp className="w-40 h-40" />
                   </div>
                   <h3 className="text-2xl font-black uppercase mb-10 text-gray-900 tracking-tight">Santé Financière</h3>
                   
                   <div className="space-y-8">
                      <div className="flex items-end justify-between border-b border-gray-50 pb-6">
                         <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 text-left">Chiffre d'Affaires Brut</p>
                            <p className="text-4xl font-black text-gray-900">{data.revenue.toLocaleString()} F</p>
                         </div>
                         <TrendingUp className="w-8 h-8 text-emerald-500 mb-1" />
                      </div>
                      <div className="grid grid-cols-2 gap-10">
                         <div className="text-left">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Cost of Goods (COGS)</p>
                            <p className="text-2xl font-black text-red-400">-{data.cogs.toLocaleString()} F</p>
                            <div className="w-full bg-gray-50 h-1.5 rounded-full mt-3">
                               <div className="bg-red-200 h-full rounded-full" style={{ width: `${(data.cogs / data.revenue) * 100}%` }}></div>
                            </div>
                         </div>
                         <div className="text-left">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Autres Charges</p>
                            <p className="text-2xl font-black text-red-500">-{data.expenses.toLocaleString()} F</p>
                            <div className="w-full bg-gray-50 h-1.5 rounded-full mt-3">
                               <div className="bg-red-400 h-full rounded-full" style={{ width: `${(data.expenses / data.revenue) * 100}%` }}></div>
                            </div>
                         </div>
                      </div>
                      <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white flex justify-between items-center shadow-2xl">
                         <div>
                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Profit Net Réel</p>
                            <p className="text-5xl font-black">{data.net_margin.toLocaleString()} F</p>
                         </div>
                         <div className="text-right">
                            <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 flex items-center justify-center">
                               <span className="font-black text-emerald-400 text-sm">{Math.round(marginRate)}%</span>
                            </div>
                         </div>
                      </div>
                   </div>
                </Card>

                {/* Top Products */}
                <Card className="p-8 rounded-[3.5rem] bg-white border-gray-100 shadow-sm text-left h-full">
                   <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-black uppercase text-gray-900 tracking-tight">Best Sellers</h3>
                      <Star className="w-5 h-5 text-primary fill-primary" />
                   </div>
                   <div className="space-y-4">
                      {data.top_products.map((p: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl group hover:bg-black hover:text-white transition-all">
                           <div className="flex items-center gap-4">
                              <span className="text-xs font-black text-gray-300 group-hover:text-gray-600">0{i+1}</span>
                              <div>
                                 <p className="font-black text-sm truncate max-w-[120px] uppercase leading-none">{p.name}</p>
                                 <p className="text-[9px] font-bold text-gray-400 group-hover:text-gray-500 uppercase mt-1">{p.volume} unités soldes</p>
                              </div>
                           </div>
                           <p className="font-black text-sm">{p.revenue.toLocaleString()} F</p>
                        </div>
                      ))}
                   </div>
                </Card>

                {/* Volume Activity */}
                <Card className="p-8 rounded-[3.5rem] bg-gray-900 text-white shadow-sm h-full flex flex-col justify-between">
                   <div>
                      <h3 className="text-xl font-black uppercase tracking-tight">Volume Orders</h3>
                      <p className="text-xs font-bold text-gray-500 uppercase mt-1">{data.order_count} commandes traitées</p>
                   </div>
                   <div className="mt-10 flex items-center gap-4 justify-center">
                       <Zap className="w-16 h-16 text-primary animate-pulse" />
                       <p className="text-5xl font-black">{data.order_count}</p>
                   </div>
                   <Button variant="outline" className="mt-8 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-black uppercase text-[10px] tracking-widest h-12">
                      Voir Détails Logs
                   </Button>
                </Card>
             </div>
           )}

           {activeTab === "logistics" && (
              <Card className="p-10 rounded-[3.5rem] bg-white border-gray-100 shadow-sm animate-in slide-in-from-left-5 duration-700">
                 <h3 className="text-2xl font-black uppercase mb-10 text-gray-900 tracking-tight text-left">Elite Driver Performance</h3>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead>
                          <tr className="border-b border-gray-50">
                             <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Livreur</th>
                             <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Missions</th>
                             <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Succès</th>
                             <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Efficacité</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-50">
                          {data.driver_performance.map((d: any, i: number) => (
                            <tr key={i} className="group hover:bg-gray-50/50">
                               <td className="py-6 font-black text-gray-900 uppercase text-sm flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs group-hover:bg-primary transition-colors">
                                     {d.full_name.charAt(0)}
                                  </div>
                                  {d.full_name}
                               </td>
                               <td className="py-6 font-bold text-gray-500 text-sm">{d.total_assigned} missions</td>
                               <td className="py-6 font-black text-emerald-600 text-sm">{d.delivered} livrées</td>
                               <td className="py-6 text-right">
                                  <Badge className={cn(
                                    "rounded-xl px-4 py-1 border-none font-black text-[10px] uppercase",
                                    d.success_rate >= 80 ? "bg-emerald-500 text-white" : "bg-orange-500 text-white"
                                  )}>
                                     {d.success_rate}%
                                  </Badge>
                               </td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </Card>
           )}
        </div>

        {/* Sidebar Insights */}
        <div className="space-y-6">
           <Card className="p-8 rounded-[3rem] bg-gray-900 text-white relative overflow-hidden h-64 flex flex-col justify-end text-left">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                 <Target className="w-24 h-24" />
              </div>
              <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Target Achievement</h4>
              <p className="text-3xl font-black">84.2%</p>
              <p className="text-xs text-gray-400 mt-2 font-medium">Vous êtes à 15.8% de votre objectif mensuel de chiffre d'affaires.</p>
           </Card>

           <Card className="p-8 rounded-[3rem] bg-white border border-gray-100 shadow-sm text-left">
              <h4 className="text-sm font-black text-gray-900 uppercase mb-6 flex items-center gap-2">
                 <PieChartIcon className="w-4 h-4 text-emerald-500" /> Allocation Trésorerie
              </h4>
              <div className="space-y-4">
                 {[
                   { label: 'Stock / Marchandise', price: data.cogs, color: 'bg-emerald-500' },
                   { label: 'Charges Fixes', price: data.expenses, color: 'bg-gray-300' },
                   { label: 'Profit Libre', price: data.net_margin, color: 'bg-primary' },
                 ].map((item, i) => (
                   <div key={i} className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tighter">
                         <span className="text-gray-400">{item.label}</span>
                         <span className="text-gray-900">{Math.round((item.price / data.revenue) * 100)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                         <div className={cn("h-full rounded-full transition-all duration-1000", item.color)} style={{ width: `${(item.price / data.revenue) * 100}%` }}></div>
                      </div>
                   </div>
                 ))}
              </div>
              <Button className="w-full mt-8 h-12 rounded-2xl bg-gray-50 text-gray-400 hover:text-gray-900 font-black uppercase text-[10px] tracking-widest">
                 Audit Complet
              </Button>
           </Card>
        </div>

      </div>

    </div>
  );
}
