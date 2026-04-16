"use client";

import { useState } from "react";
import { 
  Headset, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  Plus,
  ArrowRight,
  User,
  MessageSquare,
  Package,
  ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  IncidentType, 
  IncidentStatus, 
  updateIncidentStatus 
} from "@/features/sav/actions/incident-actions";

interface SavClientProps {
  initialIncidents: any[];
}

const TYPE_CONFIG: Record<IncidentType, { label: string, color: string, icon: any }> = {
  RETARD: { label: "Retard Livraison", color: "bg-orange-50 text-orange-600 border-orange-100", icon: Clock },
  PRODUIT_FRAGILISE: { label: "Produit Cassé", color: "bg-red-50 text-red-600 border-red-100", icon: Package },
  ERREUR_PRIX: { label: "Erreur Prix/COD", color: "bg-purple-50 text-purple-600 border-purple-100", icon: AlertTriangle },
  ADRESSE_FAUSSE: { label: "Adresse Inexacte", color: "bg-blue-50 text-blue-600 border-blue-100", icon: ShieldAlert },
  ECHANGE_DEMANDE: { label: "Demande Échange", color: "bg-emerald-50 text-emerald-600 border-emerald-100", icon: CheckCircle2 },
  AUTRE: { label: "Autre Incident", color: "bg-gray-50 text-gray-600 border-gray-100", icon: MessageSquare },
};

const STATUS_CONFIG: Record<IncidentStatus, { label: string, color: string }> = {
  OUVERT: { label: "Nouveau", color: "bg-red-500 text-white" },
  EN_COURS: { label: "En cours", color: "bg-orange-400 text-white" },
  RESOLU: { label: "Résolu", color: "bg-emerald-500 text-white" },
  ANNULE: { label: "Annulé", color: "bg-gray-400 text-white" },
};

export function SavClient({ initialIncidents }: SavClientProps) {
  const [incidents, setIncidents] = useState(initialIncidents);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const filteredIncidents = incidents.filter(inc => {
    const matchesSearch = 
      inc.orders?.order_number?.toLowerCase().includes(search.toLowerCase()) ||
      inc.orders?.customer?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      inc.description?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = filterStatus === "ALL" || inc.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = async (id: string, newStatus: IncidentStatus) => {
    try {
      await updateIncidentStatus(id, newStatus);
      setIncidents(prev => prev.map(inc => 
        inc.id === id ? { ...inc, status: newStatus } : inc
      ));
      toast.success("Statut mis à jour");
    } catch (err) {
      toast.error("Erreur", { description: "Impossible de mettre à jour le statut" });
    }
  };

  const openIncidents = incidents.filter(i => i.status === 'OUVERT').length;
  const criticalIncidents = incidents.filter(i => i.priority === 'HAUTE' && i.status !== 'RESOLU').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Hero Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-[1.5rem] bg-orange-50 text-orange-500 flex items-center justify-center shadow-inner">
            <Headset className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Monitoring <span className="text-orange-500">SAV</span></h1>
            <p className="text-gray-500 font-medium tracking-tight">Résolution des incidents et satisfaction client.</p>
          </div>
        </div>

        <div className="flex gap-4">
          <Card className="px-6 py-3 rounded-2xl border-red-50 bg-red-50/30 flex flex-col items-end">
            <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Urgent / Ouvert</span>
            <span className="text-2xl font-black text-red-600">{criticalIncidents}</span>
          </Card>
          <Card className="px-6 py-3 rounded-2xl border-orange-50 bg-orange-50/30 flex flex-col items-end">
            <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Total en attente</span>
            <span className="text-2xl font-black text-orange-600">{openIncidents}</span>
          </Card>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
          <Input 
            placeholder="Rechercher par N° commande, client ou problème..."
            className="h-14 pl-12 rounded-2xl border-gray-100 bg-white shadow-sm focus:ring-orange-500 focus:border-orange-500 font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
          {["ALL", "OUVERT", "EN_COURS", "RESOLU"].map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? "default" : "ghost"}
              className={cn(
                "rounded-xl font-bold px-6 h-12 transition-all",
                filterStatus === status ? "bg-orange-500 text-white shadow-lg shadow-orange-100 scale-105" : "text-gray-500 hover:text-orange-500 hover:bg-orange-50"
              )}
              onClick={() => setFilterStatus(status)}
            >
              {status === "ALL" ? "Tous" : STATUS_CONFIG[status as IncidentStatus]?.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Incidents List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredIncidents.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-4 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
            <CheckCircle2 className="w-16 h-16 opacity-10" />
            <p className="font-bold uppercase tracking-widest text-sm italic">Aucun incident à signaler</p>
          </div>
        ) : (
          filteredIncidents.map((incident) => {
            const typeInfo = TYPE_CONFIG[incident.incident_type as IncidentType] || TYPE_CONFIG.AUTRE;
            const TypeIcon = typeInfo.icon;
            const statusInfo = STATUS_CONFIG[incident.status as IncidentStatus];

            return (
              <Card key={incident.id} className="group relative overflow-hidden rounded-[2.5rem] border-gray-100 bg-white p-8 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all duration-300">
                {/* Priority Indicator */}
                <div className={cn(
                  "absolute left-0 top-0 bottom-0 w-2",
                  incident.priority === 'HAUTE' ? 'bg-red-500' : incident.priority === 'MOYENNE' ? 'bg-orange-400' : 'bg-blue-400'
                )} />

                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Left: Type & Command Info */}
                  <div className="lg:w-1/3 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-3 rounded-2xl border", typeInfo.color)}>
                        <TypeIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <Badge className={cn("mb-1 rounded-lg font-black text-[10px] border-none", typeInfo.color)}>
                          {typeInfo.label}
                        </Badge>
                        <h3 className="text-xl font-black text-gray-900 tracking-tight">
                          #{incident.orders?.order_number}
                        </h3>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-2xl space-y-2">
                       <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-bold text-gray-900">{incident.orders?.customer?.full_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MessageSquare className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-500">{incident.orders?.customer?.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Description & Timeline */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Description du problème</p>
                        <p className="text-gray-700 font-medium leading-relaxed">
                          {incident.description || "Aucune description fournie."}
                        </p>
                      </div>
                      <Badge className={cn("rounded-xl px-4 py-1.5 font-black uppercase text-[10px]", statusInfo.color)}>
                        {statusInfo.label}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-6 pt-4 text-xs font-bold text-gray-400">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        Déclaré le {format(new Date(incident.created_at), "dd MMMM à HH:mm", { locale: fr })}
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3" />
                        Suivi par le Service Client
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="lg:w-48 flex flex-col gap-2 justify-center border-t lg:border-t-0 lg:border-l border-gray-100 lg:pl-8 pt-4 lg:pt-0">
                    {incident.status !== 'RESOLU' && (
                      <>
                        <Button 
                          className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black h-11 transition-all shadow-md shadow-emerald-100"
                          onClick={() => handleStatusUpdate(incident.id, 'RESOLU')}
                        >
                          Marquer Résolu
                        </Button>
                        {incident.status === 'OUVERT' && (
                          <Button 
                            variant="outline"
                            className="w-full rounded-xl border-orange-200 text-orange-600 hover:bg-orange-50 font-bold h-11 transition-all"
                            onClick={() => handleStatusUpdate(incident.id, 'EN_COURS')}
                          >
                            Prendre en charge
                          </Button>
                        )}
                      </>
                    )}
                    <Button variant="ghost" className="w-full rounded-xl font-bold text-gray-400 hover:text-gray-900 h-11 gap-2">
                      Voir commande <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  );
}
