"use server";

import { createClient } from "@/lib/supabase/server";

export async function suggestZoneAction(address: string) {
  if (!address || address.length < 3) return null;

  const supabase = await createClient();
  
  // On récupère le tenant_id de l'utilisateur
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  // On appelle la fonction RPC suggest_order_zone
  const { data, error } = await supabase.rpc("suggest_order_zone", {
    delivery_address: address,
    p_tenant_id: profile.tenant_id
  });

  if (error) {
    console.error("Error suggesting zone:", error);
    return null;
  }

  return data; // Retourne l'UUID de la zone ou null
}
