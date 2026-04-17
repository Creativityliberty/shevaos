"use client";

import { useState } from "react";
import { 
  MessageSquare, 
  PhoneCall, 
  Clock, 
  AlertCircle, 
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  Calendar,
  User,
  Search
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { getWhatsAppLink, getTemplate } from "@/core/utils/messaging";

interface Props {
  initialFollowUps: any[];
}

export function FollowUpClient({ initialFollowUps }: Props) {
  const [followUps, setFollowUps] = useState(initialFollowUps);
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = followUps.filter((f: any) => 
    f.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.order_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getReasonBadge = (reason: string) => {
    switch(reason) {
      case 'RETARD_ASSIGNATION': return <Badge className="bg-amber-100 text-amber-600 border-none font-black text-[10px] uppercase">Retard Assignation</Badge>;
      case 'ECHEC_LIVRAISON': return <Badge className="bg-red-100 text-red-600 border-none font-black text-[10px] uppercase">Échec Livraison</Badge>;
      case 'REQUIS_POINT_DRIVER': return <Badge className="bg-blue-100 text-blue-600 border-none font-black text-[10px] uppercase">Stagnation Route</Badge>;
      default: return <Badge variant="outline">{reason}</Badge>;
    }
  };

  const handleWhatsApp = (item: any) => {
    let type: any = "CONFIRMATION";
    if (item.reason === "ECHEC_LIVRAISON") type = "DELIVERY_FAILED";
    if (item.reason === "REQUIS_POINT_DRIVER") type = "DELIVERY_ATTEMPT";

    const msg = getTemplate(type, { 
      name: item.customer_name, 
      order_number: item.order_number 
    });
    
    window.open(getWhatsAppLink(item.customer_phone, msg), "_blank");
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
           <Badge className="bg-red-500 text-white border-none px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest mb-4">
             Action Requise
           </Badge>
           <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Radar de <span className="text-red-500">Relances</span></h1>
           <p className="text-gray-500 font-bold mt-1 uppercase text-xs tracking-widest">Suivi proactif des anomalies et retards de livraison</p>
        </div>

        <div className="relative w-full md:w-80">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
           <Input 
              placeholder="Rechercher client ou CMD..." 
              className="pl-12 h-14 rounded-2xl border-gray-100 bg-white shadow-sm font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filtered.map((item) => (
          <Card key={item.id} className="p-8 rounded-[2.5rem] border border-gray-100 bg-white hover:shadow-xl hover:shadow-gray-100 transition-all group overflow-hidden relative">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative z-10">
               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center shadow-inner group-hover:bg-red-50 group-hover:text-red-500 transition-all">
                     <AlertCircle className="w-8 h-8" />
                  </div>
                  <div>
                     <div className="flex items-center gap-3 mb-1">
                        <span className="text-xl font-black text-gray-900 uppercase">{item.customer_name}</span>
                        {getReasonBadge(item.reason)}
                     </div>
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <span className="text-red-500 font-black">{item.order_number}</span> 
                        • Statut Actuel: {item.status}
                        • {formatDistanceToNow(new Date(item.last_update), { addSuffix: true, locale: fr })}
                     </p>
                  </div>
               </div>

               <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                  <Button 
                    variant="outline" 
                    className="flex-1 lg:flex-none h-14 rounded-2xl border-gray-100 font-black gap-2 uppercase text-xs tracking-widest hover:bg-gray-50"
                  >
                    <PhoneCall className="w-4 h-4" /> Appeler
                  </Button>
                  <Button 
                    onClick={() => handleWhatsApp(item)}
                    className="flex-1 lg:flex-none h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black gap-2 uppercase text-xs tracking-widest shadow-lg shadow-emerald-100 transition-all active:scale-95"
                  >
                    <MessageSquare className="w-4 h-4" /> WhatsApp
                  </Button>
                  <Button 
                    className="flex-1 lg:flex-none h-14 rounded-2xl bg-gray-900 hover:bg-black text-white font-black gap-2 uppercase text-xs tracking-widest shadow-lg active:scale-95"
                  >
                    Marquer Traité <CheckCircle2 className="w-4 h-4" />
                  </Button>
               </div>
            </div>

            {/* Background Decoration */}
            <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
               <MessageSquare className="w-48 h-48 rotate-12" />
            </div>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="py-32 text-center bg-gray-50/50 rounded-[4rem] border-2 border-dashed border-gray-200">
             <CheckCircle2 className="w-20 h-20 text-emerald-200 mx-auto mb-6" />
             <h3 className="text-2xl font-black text-gray-400 uppercase tracking-tight">Aucun retard détecté</h3>
             <p className="text-gray-400 font-bold mt-2 uppercase text-[10px] tracking-widest">Toutes les commandes sont dans les délais de traitement normaux.</p>
          </div>
        )}
      </div>
    </div>
  );
}
