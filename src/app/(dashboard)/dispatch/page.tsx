import { createClient } from "@/lib/supabase/server";
import { DispatchClient } from "./DispatchClient";

export default async function DispatchPage() {
  const supabase = await createClient();

  // On récupère en parallèle :
  // 1. Les commandes en attente d'assignation
  // 2. Les chauffeurs actifs
  // 3. (Optionnel) Les livraisons déjà assignées pour la journée afin de voir la charge
  const [
    { data: pendingOrders },
    { data: activeDrivers },
    { data: currentDeliveries }
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("*, customers(full_name, phone, address), zones(name, delivery_fee)")
      .eq("status", "CONFIRMÉE")
      .order("created_at", { ascending: false }),
    supabase
      .from("user_profiles")
      .select("id, full_name, role, is_active")
      .eq("role", "driver")
      .eq("is_active", true),
    supabase
      .from("deliveries")
      .select("driver_id, status, order_id")
      .in("status", ["ASSIGNÉE", "EN_LIVRAISON"])
  ]);

  // Agréger la charge de travail par livreur
  const driverWorkloads = (activeDrivers || []).map(driver => {
    const assignedCount = (currentDeliveries || []).filter(d => d.driver_id === driver.id).length;
    return { ...driver, activeDeliveries: assignedCount };
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">
          Centre de <span className="text-primary">Dispatch</span>
        </h1>
        <p className="text-gray-500 font-medium mt-1">
          {pendingOrders?.length || 0} commandes en attente d'assignation aujourd'hui.
        </p>
      </div>

      <DispatchClient 
        pendingOrders={pendingOrders || []} 
        drivers={driverWorkloads} 
      />
    </div>
  );
}
