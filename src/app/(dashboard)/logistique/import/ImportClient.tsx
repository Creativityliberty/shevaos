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
  Truck,
  Loader2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { createImport } from "@/features/logistics/actions/import-actions";
import { toast } from "sonner";

interface Props {
  initialImports: any[];
  suppliers: any[];
  transitAgents: any[];
}

export function ImportClient({ initialImports, suppliers, transitAgents }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [imports, setImports] = useState(initialImports);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    supplier_id: "",
    transite_agent_id: "",
    description: "",
    tracking_number: "",
    item_cost: "",
    freight_cost: "",
    customs_cost: "",
    purchase_date: new Date().toISOString().split('T')[0],
    eta: ""
  });

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

  const filteredImports = imports.filter(i => 
    i.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.tracking_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.suppliers?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await createImport({
        ...formData,
        item_cost: parseInt(formData.item_cost),
        freight_cost: parseInt(formData.freight_cost) || 0,
        customs_cost: parseInt(formData.customs_cost) || 0
      });
      // Refresh logic or local update
      window.location.reload();
      toast.success("Importation enregistrée");
    } catch (err: any) {
      toast.error(err.message || "Erreur de création");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-24">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-100/50">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-[2rem] bg-indigo-600 text-white flex items-center justify-center shadow-2xl shadow-indigo-200">
            <Globe className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase tracking-widest">Supply <span className="text-indigo-600">Chain</span></h1>
            <p className="text-gray-500 font-bold mt-1 uppercase text-xs tracking-[0.2em]">Suivi Global des Importations & Transit</p>
          </div>
        </div>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="h-16 px-8 rounded-[2rem] bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 font-black gap-3 text-lg transition-all active:scale-95">
                  <Plus className="w-6 h-6" /> NOUVELER ACHAT
                </Button>
              </DialogTrigger>
          <DialogContent className="rounded-[2.5rem] p-10 max-w-2xl border-none">
            <DialogHeader>
               <DialogTitle className="text-2xl font-black uppercase">Enregistrer un <span className="text-indigo-600">Achat Import</span></DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pt-6">
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2">Fournisseur</label>
                    <Select value={formData.supplier_id} onValueChange={(val: string | null) => setFormData({...formData, supplier_id: val ?? ""})}>
                       <SelectTrigger className="h-14 rounded-2xl bg-gray-50/50 border-gray-100 font-bold">
                          <SelectValue placeholder="Choisir..." />
                       </SelectTrigger>
                       <SelectContent className="rounded-2xl">
                          {suppliers.map(s => <SelectItem key={s.id} value={s.id} className="font-bold">{s.name}</SelectItem>)}
                       </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2">Agent de Transit</label>
                    <Select value={formData.transite_agent_id} onValueChange={(val: string | null) => setFormData({...formData, transite_agent_id: val ?? ""})}>
                       <SelectTrigger className="h-14 rounded-2xl bg-gray-50/50 border-gray-100 font-bold">
                          <SelectValue placeholder="Choisir..." />
                       </SelectTrigger>
                       <SelectContent className="rounded-2xl">
                          {transitAgents.map(a => <SelectItem key={a.id} value={a.id} className="font-bold">{a.name}</SelectItem>)}
                       </SelectContent>
                    </Select>
                  </div>
               </div>

               <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2">Description Marchandise</label>
                  <Input 
                    placeholder="Ex: 500 paires de chaussures Homme..." 
                    className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                  />
               </div>

               <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2">Coût Achat</label>
                    <Input 
                      type="number"
                      placeholder="0" 
                      className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-black text-indigo-600"
                      value={formData.item_cost}
                      onChange={(e) => setFormData({...formData, item_cost: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2">Fret Estimé</label>
                    <Input 
                      type="number"
                      placeholder="0" 
                      className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold"
                      value={formData.freight_cost}
                      onChange={(e) => setFormData({...formData, freight_cost: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2">Douane Estimée</label>
                    <Input 
                      type="number"
                      placeholder="0" 
                      className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold"
                      value={formData.customs_cost}
                      onChange={(e) => setFormData({...formData, customs_cost: e.target.value})}
                    />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2">Tracking Number</label>
                    <Input 
                      placeholder="DHS1234567..." 
                      className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold"
                      value={formData.tracking_number}
                      onChange={(e) => setFormData({...formData, tracking_number: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2">ETA Estimé</label>
                    <Input 
                      type="date" 
                      className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold"
                      value={formData.eta}
                      onChange={(e) => setFormData({...formData, eta: e.target.value})}
                    />
                  </div>
               </div>

               <Button type="submit" disabled={isLoading} className="w-full h-16 rounded-2xl bg-indigo-600 font-black text-lg shadow-xl shadow-indigo-100">
                  {isLoading ? <Loader2 className="animate-spin" /> : "VALIDER LA COMMANDE IMPORT"}
               </Button>
            </form>
          </DialogContent>
        </Dialog>
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
        <Card className="p-8 rounded-[2.5rem] bg-white border-gray-100 flex items-center gap-5 border-l-4 border-l-purple-500">
           <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
             <TrendingUp className="w-7 h-7" />
           </div>
           <div>
             <div className="text-2xl font-black text-gray-900">{imports.filter(i => i.status === 'DÉDOUANÉ').length}</div>
             <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dédouanés</div>
           </div>
        </Card>
        <Card className="p-8 rounded-[2.5rem] bg-white border-gray-100 flex items-center gap-5 border-l-4 border-l-emerald-500">
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
          <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Flux Actifs (Journal Supply Chain)</h2>
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Rechercher tracking ou fournisseur..." 
              className="pl-11 h-12 rounded-[1.2rem] border-gray-100 bg-white font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-6">
          {filteredImports.map((purchase) => {
            const StatusIcon = statusIcons[purchase.status] || Clock;
            return (
              <Card key={purchase.id} className="p-8 rounded-[3.5rem] border-gray-50 bg-white hover:shadow-2xl hover:shadow-gray-100 transition-all group overflow-hidden relative">
                <div className="flex flex-col lg:flex-row items-center gap-10">
                  
                  {/* Info Achat */}
                  <div className="w-full lg:w-1/4 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center shrink-0">
                         <Package className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-base font-black text-gray-900 uppercase truncate pr-2">{purchase.description}</div>
                        <div className="text-[10px] font-bold text-indigo-500 tracking-[0.2em] uppercase mt-0.5">{purchase.suppliers?.name}</div>
                      </div>
                    </div>
                    <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 group-hover:bg-white group-hover:border-indigo-100 transition-all">
                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 pl-1">TRACKING#</p>
                       <p className="text-sm font-black text-indigo-900 font-mono">{purchase.tracking_number || "---"}</p>
                    </div>
                  </div>

                  {/* Pipeline Visual */}
                  <div className="flex-1 w-full">
                     <div className="relative flex justify-between px-4">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 rounded-full overflow-hidden">
                           <div className={cn(
                             "h-full bg-indigo-500 transition-all duration-1000",
                             purchase.status === 'COMMANDÉ' ? 'w-[10%]' :
                             purchase.status === 'EN_MER' ? 'w-[30%]' :
                             purchase.status === 'AU_PORT' ? 'w-[50%]' :
                             purchase.status === 'DÉDOUANÉ' ? 'w-[70%]' :
                             purchase.status === 'RECUPÉRÉ' ? 'w-[90%]' : 'w-full'
                           )}></div>
                        </div>
                        {Object.keys(statusIcons).map((s, idx) => {
                          const Icon = statusIcons[s];
                          const isActive = s === purchase.status;
                          return (
                            <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
                               <div className={cn(
                                 "w-12 h-12 rounded-full flex items-center justify-center border-4 border-white transition-all shadow-lg",
                                 isActive ? "bg-indigo-600 text-white scale-125 ring-8 ring-indigo-50" : "bg-white text-gray-300"
                               )}>
                                 <Icon className="w-6 h-6" />
                               </div>
                               <span className={cn(
                                 "text-[8px] font-black uppercase tracking-tighter whitespace-nowrap transition-all",
                                 isActive ? "text-indigo-600 opacity-100" : "text-gray-400 opacity-40 group-hover:opacity-100"
                               )}>{s.replace('_', ' ')}</span>
                            </div>
                          );
                        })}
                     </div>
                  </div>

                  {/* Financials & ETA */}
                  <div className="w-full lg:w-1/4 border-l border-gray-100 pl-10 flex flex-col justify-center gap-4">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <Calendar className="w-4 h-4 text-gray-400" />
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">ETA PRÉVU</span>
                        </div>
                        <span className="text-xs font-black text-gray-900 flex items-center gap-2">
                          {purchase.eta ? format(new Date(purchase.eta), "dd MMM yyyy", { locale: fr }) : "TBC"}
                          <Badge className="bg-orange-50 text-orange-600 border-none font-black text-[8px] rounded-lg">CALCULÉ</Badge>
                        </span>
                     </div>
                     <div className="p-6 bg-indigo-50/50 rounded-[2rem] border border-indigo-100 transition-all group-hover:bg-indigo-600 group-hover:border-indigo-600">
                        <div className="flex items-center justify-between">
                           <DollarSign className="w-6 h-6 text-indigo-600 group-hover:text-white" />
                           <div className="text-right">
                              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none group-hover:text-indigo-200">Total Landed Cost</p>
                              <p className="text-2xl font-black text-indigo-600 leading-none mt-2 group-hover:text-white transition-colors">
                                {(purchase.total_landed_cost || 0).toLocaleString()} <span className="text-sm font-bold opacity-70">F</span>
                              </p>
                           </div>
                        </div>
                     </div>
                  </div>

                </div>
              </Card>
            );
          })}

          {filteredImports.length === 0 && (
            <div className="py-32 text-center space-y-6 bg-gray-50/50 rounded-[4rem] border border-dashed border-gray-200">
              <div className="w-24 h-24 bg-white shadow-xl rounded-[2rem] flex items-center justify-center mx-auto text-gray-200">
                <Ship className="w-12 h-12" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 uppercase">Aucun arrivage en cours</h3>
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-2">Référencez vos nouveaux achats via le bouton ci-dessus</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
