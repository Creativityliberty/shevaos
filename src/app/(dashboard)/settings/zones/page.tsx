"use client";

import { useState } from "react";
import { 
  MapPin, 
  Map, 
  Plus, 
  Search, 
  Settings2,
  Building2,
  DollarSign,
  ChevronRight,
  MoreVertical,
  Globe
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function ZonesSettingsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const zones = [
    { id: 1, sector: "Abidjan Sud", fees: 0, hub: "Global", type: "COMMUNE" },
    { id: 2, sector: "Yopougon", fees: 1000, hub: "Hub Ouest", type: "COMMUNE" },
    { id: 3, sector: "Cocody", fees: 1000, hub: "Hub Est", type: "COMMUNE" },
    { id: 4, sector: "Bingerville", fees: 1500, hub: "Hub Est", type: "PÉRIPHÉRIE" },
    { id: 5, sector: "Bouaké", fees: 3000, hub: "Hub Nord", type: "INTÉRIEUR" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-24">
      {/* Header Config */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-100/50">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-[2.5rem] bg-gray-900 text-white flex items-center justify-center shadow-2xl shadow-gray-200">
            <Settings2 className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase tracking-widest">Config. <span className="text-primary">Système</span></h1>
            <p className="text-gray-500 font-bold mt-1 uppercase text-xs tracking-[0.2em]">Infrastructure E-commerce et Trésorerie</p>
          </div>
        </div>

        <div className="flex gap-4">
           <Button variant="outline" className="h-16 px-8 rounded-[2rem] border-gray-200 font-black gap-3 text-lg">
             ENTREPRISE
           </Button>
           <Button className="h-16 px-8 rounded-[2rem] bg-gray-900 hover:bg-black shadow-xl shadow-gray-200 font-black gap-3 text-lg">
             ZONES & TARIFS
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Sidebar Settings Items */}
        <div className="space-y-4">
           {[
             { label: 'ENTREPRISE', active: false },
             { label: 'ZONES & TARIFS', active: true },
             { label: 'FACTURATION', active: false },
             { label: 'NOTIFICATIONS', active: false },
             { label: 'SÉCURITÉ', active: false },
           ].map((item, i) => (
             <button 
              key={i}
              className={cn(
                "w-full text-left p-6 rounded-3xl font-black text-xs tracking-widest transition-all uppercase",
                item.active ? "bg-white border border-gray-100 shadow-lg text-primary translate-x-2" : "text-gray-400 hover:text-gray-600 hover:translate-x-1"
              )}
             >
               {item.label}
             </button>
           ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-10">
           <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Grille Tarifaire & Zones</h2>
                <p className="text-gray-500 font-bold text-sm uppercase tracking-widest mt-1">Configurez vos frais de livraison par localité.</p>
              </div>
              <Button className="h-14 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 font-black gap-2">
                <Plus className="w-5 h-5" /> AJOUTER UNE ZONE
              </Button>
           </div>

           <Card className="rounded-[3rem] border border-gray-100 overflow-hidden bg-white shadow-xl shadow-gray-100/50">
              <div className="p-8 border-b border-gray-50 bg-gray-50/20 flex items-center justify-between">
                 <div className="relative w-full max-w-md">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input 
                      placeholder="Rechercher une localité..." 
                      className="pl-14 h-14 rounded-2xl border-none bg-white font-bold shadow-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>
              </div>

              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="bg-white border-b border-gray-50">
                          <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Secteur</th>
                          <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Frais de Livraison</th>
                          <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Hub Rattaché</th>
                          <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                       </tr>
                    </thead>
                    <tbody>
                       {zones.filter(z => z.sector.toLowerCase().includes(searchTerm.toLowerCase())).map((zone) => (
                          <tr key={zone.id} className="hover:bg-gray-50/30 transition-colors border-b border-gray-50">
                             <td className="px-10 py-8">
                                <div className="flex items-center gap-4">
                                   <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400">
                                      <MapPin className="w-6 h-6" />
                                   </div>
                                   <div>
                                      <p className="font-black text-gray-900 uppercase">{zone.sector}</p>
                                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{zone.type}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-10 py-8">
                                <div className="inline-flex items-center px-6 py-3 rounded-2xl bg-emerald-50 text-emerald-600 font-black text-lg">
                                   {zone.fees.toLocaleString()} F
                                </div>
                             </td>
                             <td className="px-10 py-8">
                                <div className="flex items-center gap-2">
                                   <Building2 className="w-4 h-4 text-gray-400" />
                                   <span className="font-bold text-gray-700 uppercase text-xs tracking-widest">{zone.hub}</span>
                                </div>
                             </td>
                             <td className="px-10 py-8">
                                <div className="flex gap-2">
                                   <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white hover:shadow-md">
                                      <Settings2 className="w-5 h-5 text-gray-400" />
                                   </Button>
                                   <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white hover:shadow-md">
                                      <MoreVertical className="w-5 h-5 text-gray-400" />
                                   </Button>
                                </div>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
