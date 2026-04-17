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
  PackageSearch,
  Loader2,
  Info
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createStockAdjustment } from "@/features/stock/actions/movement-actions";

interface Props {
  initialInventory: any[];
}

export function InventoryClient({ initialInventory }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [inventory, setInventory] = useState(initialInventory);
  const [isLoading, setIsLoading] = useState(false);
  
  // Dialog States
  const [isAdjOpen, setIsAdjOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  const [adjData, setAdjData] = useState({
    type: "AJUSTEMENT",
    quantity: "",
    notes: ""
  });

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

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !adjData.quantity) return;

    setIsLoading(true);
    try {
      await createStockAdjustment({
        product_id: selectedItem.product_id,
        hub_id: selectedItem.hub_id,
        type: adjData.type,
        quantity: parseInt(adjData.quantity),
        notes: adjData.notes
      });
      
      toast.success("Stock ajusté avec succès");
      setIsAdjOpen(false);
      window.location.reload(); // Simple refresh for now
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'ajustement");
    } finally {
      setIsLoading(false);
    }
  };

  const openAdjustment = (item: any, type: string) => {
    setSelectedItem(item);
    setAdjData({ ...adjData, type });
    setIsAdjOpen(true);
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
          <Button 
            className="h-16 px-8 rounded-[2rem] bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-200 font-black gap-3 text-lg"
            onClick={() => {
               if (filteredInventory.length > 0) {
                 setSelectedItem(filteredInventory[0]);
                 setIsAdjOpen(true);
               } else {
                 toast.error("Aucun produit à ajuster");
               }
            }}
          >
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
                      <button 
                        onClick={() => { setSelectedItem(item); setIsDetailOpen(true); }}
                        className="flex items-center gap-1 text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-2 hover:underline ml-auto"
                      >
                         <Info className="w-3 h-3" /> Détails
                      </button>
                   </div>
                </div>

                <div>
                   <h3 className="text-xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors truncate uppercase">{item.products?.name}</h3>
                   <p className="text-xs font-bold text-gray-400 mt-1 tracking-widest uppercase italic font-mono">SKU: {item.products?.sku}</p>
                </div>

                <div className="space-y-4">
                   <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Disponibilité</p>
                        <div className="text-3xl font-black text-gray-900 tabular-nums">
                          {item.available_stock} <span className="text-sm">unités</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hub: {item.hubs?.name}</p>
                        <p className="font-black text-orange-500">{item.reserved_stock} <span className="text-xs font-bold">Réservé</span></p>
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
                   <Button 
                    variant="ghost" 
                    className="flex-1 rounded-2xl bg-gray-50 text-gray-500 font-black text-[10px] uppercase hover:bg-emerald-50 hover:text-emerald-600 border border-transparent hover:border-emerald-100 transition-all py-6"
                    onClick={() => openAdjustment(item, 'ENTREE_FOURNISSEUR')}
                   >
                     <ArrowDownToLine className="w-4 h-4 mr-2" /> Entrée
                   </Button>
                   <Button 
                    variant="ghost" 
                    className="flex-1 rounded-2xl bg-gray-50 text-gray-500 font-black text-[10px] uppercase hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-100 transition-all py-6"
                    onClick={() => openAdjustment(item, 'AJUSTEMENT')}
                   >
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

      {/* Adjustment Dialog */}
      <Dialog open={isAdjOpen} onOpenChange={setIsAdjOpen}>
         <DialogContent className="rounded-[2.5rem] p-10 max-w-lg border-none">
            <DialogHeader>
               <DialogTitle className="text-2xl font-black uppercase tracking-tight">
                  {adjData.type === 'ENTREE_FOURNISSEUR' ? 'Entrée de' : 'Ajustement'} <span className="text-indigo-600">Stock</span>
               </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdjust} className="space-y-6 pt-4">
               <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 pl-2">Produit sélectionné</p>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center">
                        <PackageSearch className="w-5 h-5 text-gray-300" />
                     </div>
                     <p className="font-black text-gray-900 uppercase text-sm">{selectedItem?.products?.name}</p>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Quantité</label>
                     <Input 
                        type="number" 
                        placeholder="0" 
                        className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-black text-xl"
                        value={adjData.quantity}
                        onChange={(e) => setAdjData({...adjData, quantity: e.target.value})}
                        required
                     />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Nature</label>
                     <Select 
                        value={adjData.type} 
                        onValueChange={(val: string | null) => setAdjData({...adjData, type: val ?? ""})}
                     >
                        <SelectTrigger className="h-14 rounded-2xl bg-gray-50/50 border-gray-100 font-bold">
                           <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                           <SelectItem value="ENTREE_FOURNISSEUR" className="font-bold">ENTRÉE (Achat)</SelectItem>
                           <SelectItem value="RETOUR" className="font-bold">RETOUR CLIENT</SelectItem>
                           <SelectItem value="AJUSTEMENT" className="font-bold">AJUSTEMENT (-/INVENTAIRE)</SelectItem>
                           <SelectItem value="TRANSFERT_ENTREE" className="font-bold">TRANSFERT REÇU</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
               </div>

               <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Notes / Justification</label>
                  <Textarea 
                     placeholder="Ex: Arrivage cargaison #32, Erreur inventaire..." 
                     className="rounded-2xl border-gray-100 bg-gray-50/50 min-h-[100px] font-medium"
                     value={adjData.notes}
                     onChange={(e) => setAdjData({...adjData, notes: e.target.value})}
                  />
               </div>

               <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg transition-all shadow-xl shadow-indigo-100"
               >
                  {isLoading ? <Loader2 className="animate-spin" /> : "CONFIRMER L'OPÉRATION"}
               </Button>
            </form>
         </DialogContent>
      </Dialog>

      {/* Product Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
         <DialogContent className="rounded-[3rem] p-0 overflow-hidden border-none max-w-2xl bg-white shadow-2xl">
            <div className="h-48 bg-gray-900 relative">
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
               <div className="absolute bottom-0 left-0 p-10 flex items-center gap-6">
                  <div className="w-24 h-24 rounded-3xl bg-white border-4 border-gray-900 flex items-center justify-center overflow-hidden shadow-2xl">
                    {selectedItem?.products?.image_url ? (
                        <img src={selectedItem.products.image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <PackageSearch className="w-10 h-10 text-gray-200" />
                      )}
                  </div>
                  <div className="pb-2">
                     <h2 className="text-3xl font-black text-white uppercase tracking-tight">{selectedItem?.products?.name}</h2>
                     <p className="text-indigo-400 font-bold uppercase text-xs tracking-widest italic">{selectedItem?.products?.sku}</p>
                  </div>
               </div>
            </div>
            
            <div className="p-10 space-y-8">
               <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Stock Total</p>
                     <p className="text-2xl font-black text-gray-900">{selectedItem?.total_stock}</p>
                  </div>
                  <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 text-orange-600">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">En livraison</p>
                     <p className="text-2xl font-black">{selectedItem?.reserved_stock}</p>
                  </div>
                  <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 text-emerald-600">
                     <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Disponible</p>
                     <p className="text-2xl font-black">{selectedItem?.available_stock}</p>
                  </div>
                  <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Seuil Alerte</p>
                     <p className="text-2xl font-black text-gray-400">{selectedItem?.products?.alert_threshold || 5}</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-gray-900 border-b border-gray-100 pb-2">Informations Financières</h4>
                  <div className="flex justify-between items-center h-16 bg-gray-50 rounded-2xl px-8 border border-gray-100 shrink-0">
                     <span className="text-sm font-bold text-gray-500">Coût d'achat moyen (PAMP)</span>
                     <span className="text-xl font-black text-gray-900">{(selectedItem?.products?.average_purchase_cost || 0).toLocaleString()} F</span>
                  </div>
               </div>

               <div className="flex gap-4 pt-4 shrink-0">
                  <Button variant="outline" className="flex-1 h-14 rounded-2xl border-gray-100 font-black">
                     FAIRE UN TRANSFERT
                  </Button>
                  <Button className="flex-1 h-14 rounded-2xl bg-indigo-600 text-white font-black" onClick={() => setIsAdjOpen(true)}>
                     AJUSTER LE STOCK
                  </Button>
               </div>
            </div>
         </DialogContent>
      </Dialog>
    </div>
  );
}
