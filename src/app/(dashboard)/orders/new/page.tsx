import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { CreateOrderForm } from "@/features/orders/components/CreateOrderForm";

export default async function NewOrderPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // On récupère les données de base pour le formulaire
  const [
    { data: customers },
    { data: products },
    { data: zones }
  ] = await Promise.all([
    supabase.from("customers").select("id, full_name, phone, address, zone_id").eq("status", "ACTIVE").order("full_name"),
    supabase.from("products").select("id, sku, name, unit_price").eq("is_active", true).order("name"),
    supabase.from("zones").select("id, name, delivery_fee").order("name")
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/orders">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-white shadow-sm border border-gray-100 h-12 w-12">
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Nouvelle Commande</h1>
          <p className="text-gray-500 font-medium">Capturez une nouvelle vente en quelques clics.</p>
        </div>
      </div>

      <CreateOrderForm 
        customers={customers || []} 
        products={products || []} 
        zones={zones || []} 
      />
    </div>
  );
}
