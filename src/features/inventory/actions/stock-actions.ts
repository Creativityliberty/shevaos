"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type StockMovementType = 'ENTREE_FOURNISSEUR' | 'SORTIE_LIVRAISON' | 'AJUSTEMENT' | 'RETOUR';

export async function receiveProducts(formData: {
  hub_id: string;
  items: Array<{
    product_id: string;
    quantity: number;
    notes?: string;
  }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  // Get tenant_id
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (!profile?.tenant_id) throw new Error("Profil non trouvé");

  // Exécuter les mouvements en transaction via RPC
  const { error } = await supabase.rpc("bulk_receive_stock", {
    p_tenant_id: profile.tenant_id,
    p_hub_id: formData.hub_id,
    p_operator_id: user.id,
    p_items: formData.items
  });

  if (error) {
    console.error("Error receiving stock:", error);
    throw new Error(error.message);
  }

  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getHubs() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("hubs")
    .select("*")
    .order("name");
  
  if (error) return [];
  return data;
}
