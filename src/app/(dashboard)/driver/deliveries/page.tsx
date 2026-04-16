import { getDriverDeliveries } from "@/features/deliveries/actions/delivery-actions";
import { DriverClient } from "./DriverClient";

export default async function DriverDeliveriesPage() {
  const deliveries = await getDriverDeliveries();

  // Filtrer pour ne garder que les actives (Assignée ou En livraison) 
  // + l'historique du jour (les terminées)
  const today = new Date().toISOString().split('T')[0];
  
  const activeDeliveries = deliveries?.filter(d => 
    ["ASSIGNÉE", "EN_LIVRAISON"].includes(d.status)
  ) || [];

  const completedToday = deliveries?.filter(d => 
    !["ASSIGNÉE", "EN_LIVRAISON", "ANNULÉE"].includes(d.status) && 
    d.created_at.startsWith(today)
  ) || [];

  return (
    <div className="max-w-md mx-auto space-y-6 pb-20">
      <div className="bg-primary/10 -mx-8 -mt-8 p-8 pb-12 mb-[-2rem] rounded-b-[3rem]">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          Ma Tournée
        </h1>
        <p className="text-gray-600 font-medium">
          {activeDeliveries.length} livraison(s) restante(s)
        </p>
      </div>

      <DriverClient 
        activeDeliveries={activeDeliveries} 
        completedDeliveries={completedToday}
      />
    </div>
  );
}
