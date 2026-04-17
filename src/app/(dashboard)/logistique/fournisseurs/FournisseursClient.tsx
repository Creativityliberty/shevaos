"use client";

import { useState } from "react";
import { 
  Building2, 
  Plus, 
  Search, 
  Globe, 
  Mail, 
  Phone, 
  MoreVertical,
  Briefcase,
  MapPin,
  ExternalLink,
  Loader2,
  Wallet
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
import { cn } from "@/lib/utils";
import { createSupplier } from "@/features/logistics/actions/supplier-actions";
import { toast } from "sonner";

interface Props {
  initialSuppliers: any[];
}

export function FournisseursClient({ initialSuppliers }: Props) {
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    contact_name: "",
    phone: "",
    email: "",
    country: "Chine",
    category: "Général"
  });

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.country?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const newSup = await createSupplier(formData);
      setSuppliers([{ ...newSup, total_debt: 0 }, ...suppliers]);
      setIsAddOpen(false);
      setFormData({ name: "", contact_name: "", phone: "", email: "", country: "Chine", category: "Général" });
      toast.success("Fournisseur créé avec succès");
    } catch (err: any) {
      toast.error(err.message || "Erreur de création");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-100/50 transition-all">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-[2rem] bg-gray-900 text-white flex items-center justify-center shadow-2xl shadow-gray-200">
            <Building2 className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Base <span className="text-primary">Fournisseurs</span></h1>
            <p className="text-gray-500 font-bold mt-1 uppercase text-xs tracking-widest">Suivi des Dettes & Commandes Internationales</p>
          </div>
        </div>

        <div className="flex gap-4">
           <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="h-16 px-8 rounded-[2rem] bg-gray-900 hover:bg-black shadow-xl shadow-gray-200 font-black gap-3 text-lg">
                  <Plus className="w-6 h-6" /> NOUVEAU AGENT
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-[2.5rem] p-10 max-w-lg">
                 <DialogHeader>
                    <DialogTitle className="text-2xl font-black uppercase">Nouveau <span className="text-primary">Fournisseur</span></DialogTitle>
                 </DialogHeader>
                 <form onSubmit={handleSubmit} className="space-y-6 pt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 col-span-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2">Nom de l'Entité</label>
                        <Input 
                          placeholder="Ex: Guangzhou Logistics Ltd..." 
                          className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold px-6"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2">Nom du Contact</label>
                        <Input 
                          placeholder="Personnel..." 
                          className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold px-6"
                          value={formData.contact_name}
                          onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2">Pays</label>
                        <Input 
                          placeholder="Chine, Turquie..." 
                          className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold px-6"
                          value={formData.country}
                          onChange={(e) => setFormData({...formData, country: e.target.value})}
                        />
                      </div>
                    </div>
                    <Button type="submit" disabled={isLoading} className="w-full h-16 rounded-2xl bg-primary text-black font-black text-lg shadow-xl shadow-orange-100 transition-all active:scale-95">
                       {isLoading ? <Loader2 className="animate-spin" /> : "CRÉER LE DOSSIER"}
                    </Button>
                 </form>
              </DialogContent>
           </Dialog>
        </div>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-gray-100 flex items-center gap-4">
        <div className="relative flex-1">
           <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
           <Input 
              placeholder="Rechercher par nom ou pays..." 
              className="pl-14 h-14 rounded-2xl border-none bg-gray-50/50 font-bold text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      {/* Grid of Suppliers Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-24">
        {filteredSuppliers.map((supplier) => (
          <Card key={supplier.id} className="p-8 rounded-[3rem] border border-gray-100 bg-white transition-all group relative overflow-hidden h-full flex flex-col justify-between hover:shadow-2xl hover:shadow-gray-200">
            <div className="space-y-6">
               <div className="flex justify-between items-start">
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center shadow-sm group-hover:bg-primary group-hover:text-black transition-all duration-500">
                     <Building2 className="w-8 h-8" />
                  </div>
                  <Badge className={cn(
                    "rounded-xl font-black text-xs px-4 py-2 border-none shadow-sm",
                    Number(supplier.total_debt) > 0 ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
                  )}>
                    {Number(supplier.total_debt) > 0 ? `DETTE: ${Number(supplier.total_debt).toLocaleString()} F` : "SOLDE OK"}
                  </Badge>
               </div>

               <div>
                  <h3 className="text-2xl font-black text-gray-900 truncate uppercase mt-2 tracking-tight">{supplier.name}</h3>
                  <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest flex items-center gap-2">
                     <Globe className="w-3.5 h-3.5" /> {supplier.country || 'International'}
                  </p>
               </div>

               <div className="grid grid-cols-2 gap-3 pt-6 border-t border-gray-50">
                  <div className="p-4 bg-gray-50/50 rounded-2xl">
                     <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Contact</p>
                     <p className="text-xs font-bold text-gray-900 truncate">{supplier.contact_name || '-'}</p>
                  </div>
                  <div className="p-4 bg-gray-50/50 rounded-2xl">
                     <p className="text-[10px] font-black uppercase text-gray-400 mb-1">WhatsApp</p>
                     <p className="text-xs font-bold text-gray-900 truncate">{supplier.phone || '-'}</p>
                  </div>
               </div>
            </div>

            <div className="mt-10 flex gap-4">
               <Button variant="outline" className="flex-1 h-14 rounded-2xl border-gray-100 font-black uppercase text-xs tracking-widest hover:bg-gray-50 group-hover:border-primary transition-all">
                  DOSSIER
               </Button>
               <Button className="flex-1 h-14 rounded-2xl bg-gray-900 hover:bg-black text-white font-black uppercase text-xs tracking-widest transition-all shadow-lg active:scale-95 flex gap-2">
                  <Plus className="w-4 h-4" /> CMD
               </Button>
            </div>
          </Card>
        ))}

        {filteredSuppliers.length === 0 && (
          <div className="md:col-span-2 lg:col-span-3 py-32 text-center bg-gray-50/50 rounded-[4rem] border-2 border-dashed border-gray-200">
             <Building2 className="w-20 h-20 text-gray-200 mx-auto mb-6" />
             <h3 className="text-2xl font-black text-gray-400 uppercase tracking-tight">Aucun partenaire référencé</h3>
             <p className="text-gray-400 font-bold mt-2 uppercase text-[10px] tracking-widest">Commencez par ajouter un fournisseur ou un agent transitaire.</p>
          </div>
        )}
      </div>
    </div>
  );
}
