"use client";

import { useState, useEffect } from "react";
import { 
  MapPin, 
  Trash2, 
  Plus, 
  Search, 
  Loader2, 
  DollarSign, 
  Navigation,
  Globe
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getZones, createZone, updateZone, deleteZone } from "@/features/logistics/actions/zone-actions";
import { toast } from "sonner";

export function ZoneSettings() {
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    delivery_fee: ""
  });

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      const data = await getZones();
      setZones(data);
    } catch (err: any) {
      toast.error("Erreur de chargement des zones");
    } finally {
      setLoading(false);
    }
  };

  const currentZones = zones.filter(z => 
    z.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await createZone({
        name: formData.name,
        delivery_fee: parseFloat(formData.delivery_fee)
      });
      toast.success("Zone ajoutée");
      setFormData({ name: "", delivery_fee: "" });
      setIsAddOpen(false);
      fetchZones();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette zone ?")) return;
    try {
      await deleteZone(id);
      toast.success("Zone supprimée");
      fetchZones();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] border border-gray-100">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">Initialisation de la carte...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      {/* Action Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-primary flex items-center justify-center">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Grille Tarifaire <span className="text-primary">& Zones</span></h2>
            <p className="text-gray-400 font-medium text-xs">Configurez vos frais de livraison par localité.</p>
          </div>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger 
            render={
              <Button className="h-12 px-6 rounded-2xl bg-black text-white hover:bg-gray-800 font-black gap-2 shadow-xl shadow-gray-100 transition-all active:scale-95">
                <Plus className="w-5 h-5" /> AJOUTER UNE ZONE
              </Button>
            }
          />
          <DialogContent className="rounded-[2.5rem] p-10 max-w-md border-none">
            <DialogHeader>
               <DialogTitle className="text-2xl font-black uppercase">Configuration <span className="text-primary">Zone</span></DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pt-6">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2">Nom du Secteur / Ville</label>
                  <Input 
                    placeholder="Ex: Akwa, Douala..." 
                    className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2">Frais de Livraison (FCFA)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      type="number"
                      placeholder="2000" 
                      className="h-14 pl-11 rounded-2xl border-gray-100 bg-gray-50/50 font-black text-primary"
                      value={formData.delivery_fee}
                      onChange={(e) => setFormData({...formData, delivery_fee: e.target.value})}
                      required
                    />
                  </div>
               </div>
               <Button type="submit" disabled={isSaving} className="w-full h-16 rounded-2xl bg-primary text-black font-black text-lg shadow-xl shadow-orange-100">
                  {isSaving ? <Loader2 className="animate-spin" /> : "ENREGISTRER LA ZONE"}
               </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* List Card */}
      <Card className="rounded-[3rem] bg-white border-gray-100 shadow-sm overflow-hidden p-6">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Rechercher une localité..." 
            className="pl-11 h-12 rounded-2xl border-gray-100 bg-gray-50/50 font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-50">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="hover:bg-transparent border-gray-100">
                <TableHead className="font-black text-[10px] text-gray-400 uppercase tracking-widest py-5 pl-8">Secteur</TableHead>
                <TableHead className="font-black text-[10px] text-gray-400 uppercase tracking-widest py-5">Frais de Livraison</TableHead>
                <TableHead className="font-black text-[10px] text-gray-400 uppercase tracking-widest py-5">Hub Rattaché</TableHead>
                <TableHead className="font-black text-[10px] text-gray-400 uppercase tracking-widest py-5 text-right pr-8">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentZones.map((zone) => (
                <TableRow key={zone.id} className="hover:bg-orange-50/10 border-gray-50 transition-colors group">
                  <TableCell className="font-black text-gray-900 py-6 pl-8 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-black transition-all">
                      <Navigation className="w-4 h-4" />
                    </div>
                    {zone.name}
                  </TableCell>
                  <TableCell className="py-6">
                    <span className="font-black text-primary bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-100 text-sm">
                      {zone.delivery_fee.toLocaleString()} F
                    </span>
                  </TableCell>
                  <TableCell className="py-6">
                    <Badge variant="outline" className="rounded-lg font-bold border-gray-100 bg-gray-50 text-gray-500">
                      {zone.hubs?.name || "Global"}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-6 text-right pr-8">
                    <div className="flex items-center justify-end gap-2">
                       <Button variant="ghost" size="icon" onClick={() => handleDelete(zone.id)} className="w-10 h-10 rounded-xl text-gray-200 hover:text-red-500 hover:bg-red-50 transition-all">
                          <Trash2 className="w-4 h-4" />
                       </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {currentZones.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-60 text-center">
                    <div className="flex flex-col items-center gap-3">
                       <div className="w-16 h-16 bg-gray-50 rounded-[1.5rem] flex items-center justify-center text-gray-200">
                          <MapPin className="w-8 h-8" />
                       </div>
                       <p className="font-bold text-gray-300 uppercase text-[10px] tracking-widest">Aucune zone trouvée</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
      
      {/* Pro-Tip */}
      <div className="p-8 bg-gray-900 rounded-[2.5rem] relative overflow-hidden">
         <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12">
            <Navigation className="w-40 h-40 text-white" />
         </div>
         <div className="relative flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
               <DollarSign className="w-7 h-7 text-primary" />
            </div>
            <div>
               <h3 className="text-white font-black text-xl tracking-tight uppercase">Optimisation des Frais</h3>
               <p className="text-gray-400 text-sm font-medium mt-1">
                 Les frais définis ici sont automatiquement appliqués lors de la création d'une nouvelle commande dès que vous sélectionnez le secteur.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}
