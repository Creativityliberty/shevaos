"use client";

import { useState } from "react";
import { 
  Boxes, 
  Warehouse, 
  ShieldAlert, 
  RefreshCw, 
  BarChart3, 
  Search, 
  Plus, 
  ArrowDownToLine, 
  ArrowUpFromLine,
  History,
  TrendingDown,
  AlertTriangle,
  PackageSearch
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Props {
  initialInventory: any[];
}

export function InventoryClient({ initialInventory }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [inventory, setInventory] = useState(initialInventory);

  const filteredInventory = inventory.filter(item => 
    item.products?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.products?.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalValue: inventory.reduce((acc, curr) => acc + (curr.total_stock * (curr.products?.average_purchase_cost || 0)), 0),
    ruptureCount: inventory.filter(i => i.available_stock === 0).length,
    criticalCount: inventory.filter(i => i.available_stock > 0 && i.available_stock <= (i.products?.alert_threshold || 5)).length,
    totalItems: inventory.reduce((acc, curr) => acc + curr.total_stock, 0)
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-24">
      {/* Logistics Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-100/50">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-[2rem] bg-indigo-900 text-white flex items-center justify-center shadow-2xl shadow-indigo-200">
            <Warehouse className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Inventaire <span className="text-indigo-600">Hub Central</span></h1>
            <p className="text-gray-500 font-bold mt-1 uppercase text-xs tracking-widest">Contrôle des Stocks Physiques & Approvisionnement</p>
          </div>
        </div>

        <div className="flex gap-4">
          <Button variant="outline" className="h-16 px-8 rounded-[2rem] border-gray-100 font-black gap-3 text-lg hover:bg-gray-50">
            <History className="w-6 h-6" /> HISTORIQUE
          </Button>
          <Button className="h-16 px-8 rounded-[2rem] bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-200 font-black gap-3 text-lg">
            <Plus className="w-6 h-6" /> AJUSTEMENT STOCK
          </Button>
        </div>
      </div>

      {/* Logistics KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-8 rounded-[2.5rem] bg-white border-gray-100 flex items-center gap-5">
           <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
             <Boxes className="w-7 h-7" />
           </div>
           <div>
             <div className="text-2xl font-black text-gray-900">{stats.totalItems.toLocaleString('fr-FR')}</div>
             <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Articles en Stock</div>
           </div>
        </Card>
        <Card className="p-8 rounded-[2.5rem] bg-white border-gray-100 flex items-center gap-5">
           <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
             <TrendingDown className="w-7 h-7" />
           </div>
           <div>
             <div className="text-2xl font-black text-red-600">{stats.ruptureCount}</div>
             <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rupture de Stock</div>
           </div>
        </Card>
        <Card className="p-8 rounded-[2.5rem] bg-white border-gray-100 flex items-center gap-5 border-l-4 border-l-orange-500">
           <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
             <AlertTriangle className="w-7 h-7" />
           </div>
           <div>
             <div className="text-2xl font-black text-orange-600">{stats.criticalCount}</div>
             <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sous Seuil Critique</div>
           </div>
        </Card>
        <Card className="p-8 rounded-[2.5rem] bg-gray-900 text-white flex items-center gap-5">
           <div className="w-14 h-14 rounded-2xl bg-gray-800 text-indigo-400 flex items-center justify-center">
             <BarChart3 className="w-7 h-7" />
           </div>
           <div>
             <div className="text-xl font-black">{stats.totalValue.toLocaleString('fr-FR')} F</div>
             <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Valeur Immobilisée</div>
           </div>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="flex justify-between items-center px-6">
        <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase flex items-center gap-3">
          Catalogue Physique <span className="text-[10px] font-bold bg-gray-100 px-3 py-1 rounded-full text-gray-400">{filteredInventory.length} RÉFÉRENCES</span>
        </h2>
        <div className="relative w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Nom du produit, SKU, Code barre..." 
            className="pl-11 h-14 rounded-2xl border-gray-100 bg-white shadow-sm focus:ring-indigo-500/20 font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredInventory.map((item) => {
          const isCritical = item.available_stock <= (item.products?.alert_threshold || 5);
          const isRupture = item.available_stock === 0;

          return (
            <Card key={item.id} className={cn(
              "p-8 rounded-[3rem] border-2 bg-white transition-all group overflow-hidden relative",
              isRupture ? "border-red-100 opacity-80" : isCritical ? "border-orange-100" : "border-transparent hover:border-indigo-100"
            )}>
              <div className="space-y-8 relative z-10">
                <div className="flex justify-between items-start">
                   <div className="w-16 h-16 rounded-2xl bg-gray-50 overflow-hidden flex items-center justify-center border border-gray-100 shadow-inner group-hover:scale-110 transition-transform">
                      {item.products?.image_url ? (
                        <img src={item.products.image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <PackageSearch className="w-7 h-7 text-gray-300" />
                      )}
                   </div>
                   <div className="text-right">
                      <Badge variant="outline" className={cn(
                        "rounded-full uppercase font-black text-[9px] px-3 py-1 tracking-widest",
                        isRupture ? "bg-red-50 text-red-600 border-red-100" :
                        isCritical ? "bg-orange-50 text-orange-600 border-orange-100" :
                        "bg-emerald-50 text-emerald-600 border-emerald-100"
                      )}>
                        {isRupture ? "RUPTURE" : isCritical ? "CRITIQUE" : "EN STOCK"}
                      </Badge>
                      <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-tighter">Hub: {item.hubs?.name}</p>
                   </div>
                </div>

                <div>
                   <h3 className="text-xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors truncate">{item.products?.name}</h3>
                   <p className="text-xs font-bold text-gray-400 mt-1 tracking-widest uppercase">SKU: {item.products?.sku}</p>
                </div>

                <div className="space-y-4">
                   <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Disponibilité</p>
                        <div className="text-3xl font-black text-gray-900">
                          {item.available_stock} <span className="text-sm">unités</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Réservé</p>
                        <p className="font-black text-orange-500">{item.reserved_stock} <span className="text-xs">U</span></p>
                      </div>
                   </div>

                   {/* Stock Health Bar */}
                   <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-1000",
                          isRupture ? "w-0" : isCritical ? "bg-orange-500 w-1/4" : "bg-emerald-500 w-3/4"
                        )}
                      />
                   </div>
                </div>

                <div className="flex gap-2 pt-2">
                   <Button variant="ghost" className="flex-1 rounded-2xl bg-gray-50 text-gray-500 font-bold text-xs uppercase hover:bg-indigo-50 hover:text-indigo-600 border border-transparent hover:border-indigo-100 transition-all">
                     <ArrowDownToLine className="w-4 h-4 mr-2" /> Entrée
                   </Button>
                   <Button variant="ghost" className="flex-1 rounded-2xl bg-gray-50 text-gray-500 font-bold text-xs uppercase hover:bg-orange-50 hover:text-orange-600 border border-transparent hover:border-orange-100 transition-all">
                     <ArrowUpFromLine className="w-4 h-4 mr-2" /> Sortie
                   </Button>
                </div>
              </div>

              {isRupture && (
                <div className="absolute inset-0 bg-white/40 flex items-center justify-center z-20 pointer-events-none">
                   <div className="bg-red-600 text-white px-6 py-2 rounded-full font-black text-xs uppercase rotate-12 shadow-xl">
                     Rupture Totale
                   </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
