"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Building2, 
  Plus, 
  Search, 
  Globe, 
  Banknote,
  Truck,
  Loader2,
  AlertCircle,
  Mail,
  Phone
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function FournisseursClient({ initialSuppliers }: { initialSuppliers: any[] }) {
  const supabase = createClient();
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Pour la création de Fournisseur
  const [isNewSupOpen, setIsNewSupOpen] = useState(false);
  const [newSupData, setNewSupData] = useState({ name: "", email: "", phone: "", country: "Chine" });

  // Pour la création de CMD
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [cmdAmount, setCmdAmount] = useState("");
  const [cmdCurrency, setCmdCurrency] = useState("CNY");

  const filteredSuppliers = suppliers.filter((s: any) => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.country?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateSupplier = async () => {
    if (!newSupData.name) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("suppliers")
        .insert(newSupData)
        .select()
        .single();

      if (error) throw error;
      setSuppliers([data, ...suppliers]);
      setIsNewSupOpen(false);
      setNewSupData({ name: "", email: "", phone: "", country: "Chine" });
      toast.success("Nouveau fournisseur référencé !");
    } catch (error: any) {
      toast.error("Erreur : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCMD = async () => {
    if (!selectedSupplier || !cmdAmount) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("supplier_orders")
        .insert({
          supplier_id: selectedSupplier.id,
          total_amount_currency: Number(cmdAmount),
          currency: cmdCurrency,
          order_reference: `CMD-${Date.now().toString().slice(-6)}`,
          status: 'EN_TRANSIT'
        });

      if (error) throw error;
      toast.success(`CMD de ${cmdAmount} ${cmdCurrency} créée pour ${selectedSupplier.name}`);
      setSelectedSupplier(null);
      setCmdAmount("");
    } catch (error: any) {
      toast.error("Erreur : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-24">
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-100/50">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-[2.5rem] bg-gray-900 text-white flex items-center justify-center shadow-2xl shadow-gray-200">
            <Building2 className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase tracking-widest">Sourcing <span className="text-primary">& Flux</span></h1>
            <p className="text-gray-500 font-bold mt-1 uppercase text-xs tracking-[0.2em]">Gestion Fournisseurs & Balance Achats (P2-3)</p>
          </div>
        </div>

        <Dialog open={isNewSupOpen} onOpenChange={setIsNewSupOpen}>
           <DialogTrigger 
             render={
               <Button className="h-16 px-8 rounded-3xl bg-gray-900 hover:bg-black font-black uppercase text-xs tracking-widest gap-2">
                 <Plus className="w-5 h-5 text-indigo-400" /> NOUVEAU PARTENAIRE
               </Button>
             }
           />
           <DialogContent className="rounded-[2.5rem] border-none p-10 max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black uppercase text-left italic">Référencer un <span className="text-primary">Partenaire</span></DialogTitle>
              </DialogHeader>
              <div className="space-y-6 pt-6 text-left">
                 <div className="grid grid-cols-1 gap-4 font-bold">
                    <div className="space-y-2">
                       <label className="text-[10px] uppercase text-gray-400 font-black tracking-widest">Nom de l'Entité</label>
                       <Input className="h-14 rounded-2xl bg-gray-50 border-none" placeholder="Ex: Guangzhou Log..." value={newSupData.name} onChange={e => setNewSupData({...newSupData, name: e.target.value})}/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] uppercase text-gray-400 font-black tracking-widest">Pays</label>
                          <Input className="h-14 rounded-2xl bg-gray-50 border-none" placeholder="Chine" value={newSupData.country} onChange={e => setNewSupData({...newSupData, country: e.target.value})}/>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] uppercase text-gray-400 font-black tracking-widest">Téléphone</label>
                          <Input className="h-14 rounded-2xl bg-gray-50 border-none" placeholder="+86..." value={newSupData.phone} onChange={e => setNewSupData({...newSupData, phone: e.target.value})}/>
                       </div>
                    </div>
                 </div>
                 <Button onClick={handleCreateSupplier} disabled={loading} className="w-full h-16 rounded-2xl bg-primary text-black font-black text-lg shadow-xl shadow-orange-100">
                   {loading ? <Loader2 className="animate-spin" /> : "ENREGISTRER LE PARTENAIRE"}
                 </Button>
              </div>
           </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm">
         <Search className="w-6 h-6 text-gray-400 ml-4" />
         <Input 
           placeholder="Rechercher par nom, pays ou catégorie..." 
           className="h-12 border-none bg-transparent font-bold text-lg focus-visible:ring-0"
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
         />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredSuppliers.map((supplier: any) => (
          <Card key={supplier.id} className="rounded-[3rem] border-none shadow-xl shadow-gray-100/30 overflow-hidden bg-white flex flex-col group hover:translate-y-[-8px] transition-all duration-500">
            <div className="p-10 space-y-6 flex-1">
               <div className="flex justify-between items-start">
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <Badge className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase border-none ${Number(supplier.balance || 0) > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {Number(supplier.balance || 0) > 0 ? 'DETTE ACTIVE' : 'SOLDE À JOUR'}
                  </Badge>
               </div>

               <div>
                 <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight truncate">{supplier.name}</h3>
                 <p className="text-xs font-bold text-gray-400 flex items-center gap-2 uppercase tracking-widest mt-1">
                   <Globe className="w-3.5 h-3.5" /> {supplier.country || 'International'}
                 </p>
               </div>

               <div className="grid grid-cols-2 gap-4 py-6 border-y border-gray-50">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Balance Due</p>
                    <p className={`text-lg font-black ${Number(supplier.balance || 0) > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {Number(supplier.balance || 0).toLocaleString()} F
                    </p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">WhatsApp</p>
                    <p className="text-xs font-black text-gray-900 truncate">{supplier.phone || '-'}</p>
                  </div>
               </div>
            </div>

            <div className="p-8 bg-gray-50/50 flex gap-3">
               <Dialog>
                 <DialogTrigger 
                    render={
                      <Button 
                        onClick={() => setSelectedSupplier(supplier)}
                        className="flex-1 h-14 rounded-2xl bg-gray-900 hover:bg-black font-black text-xs uppercase tracking-widest gap-2 shadow-lg"
                      >
                        <Plus className="w-4 h-4" /> CMD
                      </Button>
                    }
                 />
                 <DialogContent className="rounded-[2.5rem] border-none p-10 max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-black uppercase text-left">Nouvelle <span className="text-primary">Commande (CMD)</span></DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 pt-6 text-left font-bold">
                       <div className="space-y-2">
                         <label className="text-[10px] uppercase text-gray-400 font-black tracking-widest">Montant de la commande</label>
                         <div className="flex gap-3">
                           <Input 
                             type="number" 
                             className="h-16 rounded-2xl bg-gray-50 border-none font-black text-xl px-6" 
                             placeholder="0.00"
                             value={cmdAmount}
                             onChange={(e) => setCmdAmount(e.target.value)}
                           />
                           <select 
                            className="w-32 h-16 rounded-2xl bg-gray-50 border-none font-black text-lg px-4 focus:ring-2 focus:ring-primary"
                            value={cmdCurrency}
                            onChange={(e) => setCmdCurrency(e.target.value)}
                           >
                             <option>CNY</option>
                             <option>USD</option>
                             <option>EUR</option>
                           </select>
                         </div>
                       </div>
                       
                       <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-start gap-4">
                          <AlertCircle className="w-6 h-6 text-indigo-500 shrink-0 mt-1" />
                          <p className="text-xs text-indigo-800 leading-relaxed font-medium">
                            Cette commande sera enregistrée au cours du jour et impactera la balance de <span className="font-black underline">{selectedSupplier?.name}</span>.
                          </p>
                       </div>

                       <Button 
                        onClick={handleCreateCMD}
                        disabled={loading}
                        className="w-full h-16 rounded-[1.8rem] bg-gray-900 hover:bg-black text-white font-black text-lg gap-3 shadow-2xl group"
                       >
                         {loading ? <Loader2 className="animate-spin" /> : <Truck className="w-6 h-6 text-indigo-400 group-hover:translate-x-1 transition-transform" />}
                         LANCER L'ARRIVAGE
                       </Button>
                    </div>
                 </DialogContent>
               </Dialog>

               <Button variant="outline" className="h-14 w-14 rounded-2xl border-gray-200 hover:bg-white hover:border-indigo-600 transition-all">
                  <Banknote className="w-6 h-6 text-gray-400" />
               </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
