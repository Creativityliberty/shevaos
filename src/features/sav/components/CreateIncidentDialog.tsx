"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { AlertTriangle, Loader2 } from "lucide-react";
import { IncidentType, createIncident } from "@/features/sav/actions/incident-actions";
import { toast } from "sonner";

interface Props {
  orderId: string;
  orderNumber: string;
}

export function CreateIncidentDialog({ orderId, orderNumber }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    incident_type: "" as IncidentType,
    description: "",
    priority: "MOYENNE"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.incident_type || !formData.description) return;

    setIsLoading(true);
    try {
      await createIncident({
        order_id: orderId,
        incident_type: formData.incident_type,
        description: formData.description,
        priority: formData.priority
      });
      toast.success("Incident déclaré", { description: "Le SAV a été notifié." });
      setIsOpen(false);
      setFormData({ incident_type: "" as IncidentType, description: "", priority: "MOYENNE" });
    } catch (error: any) {
      toast.error("Erreur", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={
        <Button variant="outline" className="rounded-xl border-red-100 text-red-600 hover:bg-red-50 font-bold gap-2">
          <AlertTriangle className="w-4 h-4" />
          Déclarer un Incident
        </Button>
      } />
      <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black flex items-center gap-3">
             <div className="p-2 bg-red-100 rounded-xl text-red-600">
               <AlertTriangle className="w-6 h-6" />
             </div>
             Déclarer un Incident SAV
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center">
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Commande concernée</span>
            <span className="font-black text-gray-900">#{orderNumber}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-gray-400 tracking-tighter">Type de Problème</label>
              <Select 
                onValueChange={(val: IncidentType) => setFormData({...formData, incident_type: val})}
                required
              >
                <SelectTrigger className="h-12 rounded-xl border-gray-100 bg-gray-50/50 font-bold">
                  <SelectValue placeholder="Choisir..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gray-100">
                  <SelectItem value="RETARD">Retard Livraison</SelectItem>
                  <SelectItem value="PRODUIT_FRAGILISE">Produit Cassé</SelectItem>
                  <SelectItem value="ERREUR_PRIX">Erreur Prix/COD</SelectItem>
                  <SelectItem value="ADRESSE_FAUSSE">Adresse Inexacte</SelectItem>
                  <SelectItem value="ECHANGE_DEMANDE">Demande Échange</SelectItem>
                  <SelectItem value="AUTRE">Autre...</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-gray-400 tracking-tighter">Priorité</label>
              <Select 
                defaultValue="MOYENNE"
                onValueChange={(val) => setFormData({...formData, priority: val})}
              >
                <SelectTrigger className="h-12 rounded-xl border-gray-100 bg-gray-50/50 font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gray-100">
                  <SelectItem value="BASSE">Basse</SelectItem>
                  <SelectItem value="MOYENNE">Moyenne</SelectItem>
                  <SelectItem value="HAUTE">Haute (Urgent)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-gray-400 tracking-tighter">Description détaillée</label>
            <textarea
              className="w-full h-32 rounded-xl border-gray-100 bg-gray-50/50 p-4 text-sm font-medium focus:ring-red-500 focus:border-red-500 transition-all outline-none"
              placeholder="Expliquez précisément la situation..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-14 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black text-lg transition-all shadow-xl shadow-red-100"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : "SIGNALER L'INCIDENT"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
