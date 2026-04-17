"use client";

import { useState } from "react";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  Search, 
  Filter,
  Package,
  User,
  Clock,
  ExternalLink
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Props {
  initialMovements: any[];
}

const TYPE_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  'ENTREE_FOURNISSEUR': { label: 'Entrée Stock', icon: ArrowDownLeft, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  'SORTIE_LIVRAISON': { label: 'Sortie Livraison', icon: ArrowUpRight, color: 'text-blue-600', bg: 'bg-blue-50' },
  'AJUSTEMENT': { label: 'Ajustement', icon: History, color: 'text-orange-600', bg: 'bg-orange-50' },
  'TRANSFERT_SORTIE': { label: 'Transfert Out', icon: ArrowUpRight, color: 'text-purple-600', bg: 'bg-purple-50' },
  'TRANSFERT_ENTREE': { label: 'Transfert In', icon: ArrowDownLeft, color: 'text-purple-600', bg: 'bg-purple-50' },
  'RETOUR': { label: 'Retour Client', icon: ArrowDownLeft, color: 'text-indigo-600', bg: 'bg-indigo-50' },
};

export function MovementClient({ initialMovements }: Props) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMovements = initialMovements.filter(m => 
    m.products?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.products?.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">
            Suivi des <span className="text-primary">Mouvements</span>
          </h1>
          <p className="text-gray-500 font-medium">Historique complet des entrées et sorties de stock.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Rechercher un produit, SKU, note..." 
            className="pl-12 h-12 rounded-2xl border-gray-100 bg-gray-50/50 shadow-inner focus:bg-white transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="p-6 rounded-[2rem] border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-primary flex items-center justify-center">
               <Package className="w-6 h-6" />
            </div>
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total Mouvements</p>
               <p className="text-xl font-black text-gray-900">{initialMovements.length}</p>
            </div>
         </Card>
         <Card className="p-6 rounded-[2rem] border-gray-100 flex items-center gap-4 text-emerald-600 bg-emerald-50/20">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
               <ArrowDownLeft className="w-6 h-6" />
            </div>
            <div>
               <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none mb-1">Entrées (24h)</p>
               <p className="text-xl font-black">{initialMovements.filter(m => m.type.includes('ENTREE') || m.type === 'RETOUR').length}</p>
            </div>
         </Card>
         <Card className="p-6 rounded-[2rem] border-gray-100 flex items-center gap-4 text-blue-600 bg-blue-50/20">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
               <ArrowUpRight className="w-6 h-6" />
            </div>
            <div>
               <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">Sorties (24h)</p>
               <p className="text-xl font-black">{initialMovements.filter(m => m.type.includes('SORTIE')).length}</p>
            </div>
         </Card>
      </div>

      {/* Movements Table/List */}
      <div className="space-y-4 pb-20">
        {filteredMovements.map((movement) => {
          const config = TYPE_CONFIG[movement.type] || { label: movement.type, icon: History, color: 'text-gray-600', bg: 'bg-gray-100' };
          const Icon = config.icon;

          return (
            <Card key={movement.id} className="p-6 rounded-[2rem] border-gray-50 bg-white hover:border-gray-100 hover:shadow-lg hover:shadow-gray-100/50 transition-all group">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-5">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm", config.bg, config.color)}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                       <h3 className="font-black text-gray-900 uppercase text-base">{movement.products?.name}</h3>
                       <Badge variant="outline" className="text-[9px] uppercase tracking-widest rounded-lg border-gray-100 font-bold bg-gray-50">
                          {movement.products?.sku}
                       </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-tighter">
                        <User className="w-3 h-3" /> {movement.user_profiles?.full_name || 'Système'}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-tighter">
                        <Clock className="w-3 h-3" /> {format(new Date(movement.created_at), "dd MMM yyyy 'à' HH:mm", { locale: fr })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end border-t md:border-0 pt-4 md:pt-0">
                  <div className="text-left md:text-right hidden sm:block">
                     <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none mb-1">Commentaire</p>
                     <p className="text-xs font-bold text-gray-500 italic max-w-[200px] truncate">
                        {movement.notes || "Aucune note additionnelle"}
                     </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                       <p className={cn("text-2xl font-black tabular-nums", config.color)}>
                         {movement.type.includes('SORTIE') ? '-' : '+'}{movement.quantity}
                       </p>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{config.label}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        {filteredMovements.length === 0 && (
          <div className="py-24 text-center space-y-4 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100">
             <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <Search className="w-8 h-8 text-gray-200" />
             </div>
             <div>
                <p className="text-xl font-black text-gray-900">Aucun mouvement trouvé</p>
                <p className="text-gray-400 font-medium tracking-tight">Essayez d'ajuster vos critères de recherche.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
