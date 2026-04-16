"use client";

import { useState } from "react";
import { Package, Truck, Loader2, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { assignDelivery } from "@/features/deliveries/actions/delivery-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function DispatchClient({ pendingOrders, drivers }: { pendingOrders: any[], drivers: any[] }) {
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState<string | null>(null);
  const router = useRouter();

  const handleAssign = async (orderId: string) => {
    if (!selectedDriverId) {
      toast.error("Veuillez sélectionner un livreur", { description: "Un chauffeur doit être sélectionné pour l'assignation."});
      return;
    }
    
    setIsAssigning(orderId);
    try {
      const result = await assignDelivery(orderId, selectedDriverId);
      if (result.success) {
        toast.success("Succès", { description: "Commande assignée : le chauffeur est notifié." });
      } else {
        toast.error("Erreur", { description: result.error || result.message });
      }
    } catch (e: any) {
      toast.error("Erreur d'assignation", { description: e.message });
    } finally {
      setIsAssigning(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Colonne des livreurs disponibles */}
      <div className="lg:col-span-1 space-y-4">
        <div className="text-sm font-black uppercase text-gray-400 tracking-widest flex items-center gap-2 mb-4">
          <Truck className="w-4 h-4" /> Flotte Active
        </div>
        
        {drivers.length === 0 ? (
          <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl font-bold text-center text-sm">
            Aucun livreur actif
          </div>
        ) : (
          <div className="space-y-3">
            {drivers.map(driver => (
              <div 
                key={driver.id} 
                onClick={() => setSelectedDriverId(driver.id)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedDriverId === driver.id 
                  ? "border-primary bg-orange-50/50 shadow-md transform scale-[1.02]" 
                  : "border-gray-100 bg-white hover:border-orange-200"
                }`}
              >
                <div className="font-bold text-gray-900">{driver.full_name || 'Livreur Anonyme'}</div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500 font-medium">Charge en cours</span>
                  <Badge variant={driver.activeDeliveries > 5 ? "destructive" : "secondary"} className="rounded-lg">
                    {driver.activeDeliveries} colis
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Colonne des commandes */}
      <div className="lg:col-span-3 space-y-4">
        <div className="text-sm font-black uppercase text-gray-400 tracking-widest flex items-center gap-2 mb-4">
          <Package className="w-4 h-4" /> Commandes à dispatcher ({pendingOrders.length})
        </div>

        {pendingOrders.length === 0 ? (
          <Card className="p-12 rounded-[2rem] border-dashed text-center text-gray-400">
            <Package className="w-12 h-12 opacity-20 mx-auto mb-4" />
            <p className="font-bold text-lg">Aucune commande en attente.</p>
            <p className="text-sm">Toutes les commandes ont été dispatchées.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingOrders.map(order => (
              <Card key={order.id} className="p-5 rounded-3xl border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-black text-lg">{order.order_number}</div>
                    <Badge variant="outline" className="mt-1 font-bold rounded-lg border-gray-200 bg-gray-50">
                      {order.zones?.name || "Sans zone"}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-gray-900">{order.cod_amount.toLocaleString()} <span className="text-xs text-gray-400 uppercase">FCFA</span></div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm font-medium text-gray-600">
                  <span className="font-bold text-gray-900 block">{order.customers?.full_name}</span>
                  <span className="text-gray-500">{order.customers?.phone}</span>
                  <div className="text-xs mt-1 truncate">{order.customers?.address}</div>
                </div>

                <Button 
                  onClick={() => handleAssign(order.id)}
                  disabled={isAssigning === order.id || !selectedDriverId}
                  className="w-full rounded-xl font-bold h-11"
                >
                  {isAssigning === order.id ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                  ) : (
                    <>Assigner <ArrowRight className="w-4 h-4 ml-2 opacity-50" /></>
                  )}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
