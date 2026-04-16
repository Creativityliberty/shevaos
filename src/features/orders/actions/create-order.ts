"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createOrder(formData: {
  customer_id: string;
  zone_id: string;
  delivery_address: string;
  cod_amount: number;
  delivery_fee: number;
  secondary_phone?: string;
  delivery_window?: string;
  items: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
  }>;
}) {
  const supabase = await createClient();

  // 1. Récupération de l'utilisateur et de son tenant_id
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié" };

  // On récupère le profil pour avoir le tenant_id
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (!profile?.tenant_id) return { error: "Profil non trouvé" };

  // 2. Appel de la RPC atomique
  try {
    const { data: orderId, error } = await supabase.rpc("create_order_with_stock_check", {
      p_tenant_id: profile.tenant_id,
      p_customer_id: formData.customer_id,
      p_zone_id: formData.zone_id,
      p_sav_agent_id: user.id,
      p_delivery_address: formData.delivery_address,
      p_cod_amount: formData.cod_amount,
      p_delivery_fee: formData.delivery_fee,
      p_secondary_phone: formData.secondary_phone,
      p_delivery_window: formData.delivery_window,
      p_items: formData.items,
    });

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/orders");
    return { success: true, orderId };
  } catch (err: any) {
    return { error: err.message || "Une erreur est survenue lors de la création de la commande." };
  }
}
