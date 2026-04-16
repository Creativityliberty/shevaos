"use client";

import { useState } from "react";
import { 
  Ship, 
  Anchor, 
  Package, 
  ChevronRight, 
  Plus, 
  Search, 
  Calendar, 
  DollarSign, 
  Clock, 
  CheckCircle2,
  TrendingUp,
  Globe,
  Truck
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Props {
  initialImports: any[];
  suppliers: any[];
  transitAgents: any[];
}

export function ImportClient({ initialImports, suppliers, transitAgents }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [imports, setImports] = useState(initialImports);

  const statusColors: Record<string, string> = {
    'COMMANDÉ': 'bg-blue-50 text-blue-600 border-blue-100',
    'EN_MER': 'bg-indigo-50 text-indigo-600 border-indigo-100',
    'AU_PORT': 'bg-orange-50 text-orange-600 border-orange-100',
    'DÉDOUANÉ': 'bg-purple-50 text-purple-600 border-purple-100',
    'RECUPÉRÉ': 'bg-emerald-50 text-emerald-600 border-emerald-100',
    'EN_STOCK': 'bg-gray-900 text-white border-gray-900',
  };

  const statusIcons: Record<string, any> = {
    'COMMANDÉ': Clock,
    'EN_MER': Ship,
    'AU_PORT': Anchor,
    'DÉDOUANÉ': CheckCircle2,
    'RECUPÉRÉ': Truck,
    'EN_STOCK': Package,
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-100/50">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-[2rem] bg-indigo-600 text-white flex items-center justify-center shadow-2xl shadow-indigo-200">
            <Globe className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Supply <span className="text-indigo-600">Chain</span></h1>
            <p className="text-gray-500 font-bold mt-1 uppercase text-xs tracking-widest">Suivi Global des Importations & Transit</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="px-8 py-5 bg-gray-50 rounded-[2rem] text-right">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Valeur en Transit</p>
            <p className="text-2xl font-black text-gray-900">
              {imports.filter(i => i.status !== 'EN_STOCK').reduce((acc, curr) => acc + (curr.total_landed_cost || 0), 0).toLocaleString()} <span className="text-sm">F</span>
            </p>
          </div>
          <Button className="h-16 px-8 rounded-[2rem] bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 font-black gap-3 text-lg">
            <Plus className="w-6 h-6" /> NOUVEL ACHAT
          </Button>
        </div>
      </div>

      {/* Stats Quick Look */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-8 rounded-[2.5rem] bg-white border-gray-100 flex items-center gap-5">
           <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
             <Ship className="w-7 h-7" />
           </div>
           <div>
             <div className="text-2xl font-black text-gray-900">{imports.filter(i => i.status === 'EN_MER').length}</div>
             <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">En Pleine Mer</div>
           </div>
        </Card>
        <Card className="p-8 rounded-[2.5rem] bg-white border-gray-100 flex items-center gap-5">
           <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center text-center">
             <Anchor className="w-7 h-7" />
           </div>
           <div>
             <div className="text-2xl font-black text-gray-900">{imports.filter(i => i.status === 'AU_PORT').length}</div>
             <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Arrivés au Port</div>
           </div>
        </Card>
        <Card className="p-8 rounded-[2.5rem] bg-white border-gray-100 flex items-center gap-5">
           <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
             <TrendingUp className="w-7 h-7" />
           </div>
           <div>
             <div className="text-2xl font-black text-gray-900">{imports.filter(i => i.status === 'DÉDOUANÉ').length}</div>
             <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dédouanés</div>
           </div>
        </Card>
        <Card className="p-8 rounded-[2.5rem] bg-white border-gray-100 flex items-center gap-5">
           <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
             <Package className="w-7 h-7" />
           </div>
           <div>
             <div className="text-2xl font-black text-gray-900">{imports.filter(i => i.status === 'EN_STOCK').length}</div>
             <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mis en Stock</div>
           </div>
        </Card>
      </div>

      {/* Main List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-6">
          <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Flux Actifs</h2>
          <div className="relative w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Rechercher tracking ou fournisseur..." 
              className="pl-11 rounded-2xl border-gray-100 bg-white font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          {imports.map((purchase) => {
            const StatusIcon = statusIcons[purchase.status];
            return (
              <Card key={purchase.id} className="p-8 rounded-[3rem] border-gray-50 bg-white hover:shadow-2xl hover:shadow-gray-100 transition-all group overflow-hidden relative">
                <div className="flex flex-col lg:flex-row items-center gap-10">
                  
                  {/* Info Achat */}
                  <div className="w-full lg:w-1/4 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center">
                         <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-black text-gray-900 uppercase truncate max-w-[150px]">{purchase.description}</div>
                        <div className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Fournisseur: {purchase.suppliers?.name}</div>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Tracking ID</p>
                       <p className="text-xs font-black text-indigo-600">{purchase.tracking_number || "NON ASSIGNÉ"}</p>
                    </div>
                  </div>

                  {/* Pipeline Visual */}
                  <div className="flex-1 w-full">
                     <div className="relative flex justify-between">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 rounded-full overflow-hidden">
                           <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: '40%' }}></div>
                        </div>
                        {Object.keys(statusIcons).map((s, idx) => {
                          const Icon = statusIcons[s];
                          const isActive = s === purchase.status;
                          return (
                            <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
                               <div className={cn(
                                 "w-10 h-10 rounded-full flex items-center justify-center border-4 border-white transition-all shadow-lg",
                                 isActive ? "bg-indigo-600 text-white scale-125 ring-4 ring-indigo-50" : "bg-white text-gray-300"
                               )}>
                                 <Icon className="w-5 h-5" />
                               </div>
                               {!isActive && <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{s}</span>}
                               {isActive && <span className="text-[10px] font-black text-indigo-600 uppercase tracking-tight">{s}</span>}
                            </div>
                          );
                        })}
                     </div>
                  </div>

                  {/* Financials & ETA */}
                  <div className="w-full lg:w-1/4 border-l border-gray-100 pl-10 flex flex-col justify-center gap-6">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <Calendar className="w-4 h-4 text-gray-400" />
                           <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">ETA:</span>
                        </div>
                        <span className="text-xs font-black text-gray-900">
                          {purchase.eta ? format(new Date(purchase.eta), "dd MMM yyyy", { locale: fr }) : "TBC"}
                        </span>
                     </div>
                     <div className="flex items-center justify-between px-6 py-4 bg-indigo-50 rounded-[1.5rem] border border-indigo-100">
                        <DollarSign className="w-5 h-5 text-indigo-600" />
                        <div className="text-right">
                           <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none">Cote Totale</p>
                           <p className="text-lg font-black text-indigo-600 leading-none mt-1">
                             {purchase.total_landed_cost.toLocaleString()} F
                           </p>
                        </div>
                     </div>
                  </div>

                </div>
              </Card>
            );
          })}

          {imports.length === 0 && (
            <div className="py-24 text-center space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200">
                <Ship className="w-10 h-10" />
              </div>
              <p className="font-bold text-gray-400 uppercase tracking-widest text-sm">Aucune importation en cours</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
