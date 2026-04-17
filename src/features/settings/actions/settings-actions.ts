"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getTenantStatus() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("tenant_id")
    .eq("id", user?.id)
    .single();
  
  if (!profile?.tenant_id) return null;

  const { data, error } = await supabase
    .from("tenants")
    .select("*")
    .eq("id", profile.tenant_id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching tenant (ID:", profile.tenant_id, "):", error.message || error);
    return null;
  }

  if (!data) {
    console.warn("No tenant found for ID:", profile.tenant_id, ". Check RLS or migration 19.");
  }

  return data;
}

export async function updateTenantSettings(name: string, settings: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("tenant_id")
    .eq("id", user?.id)
    .single();

  if (!profile?.tenant_id) throw new Error("Accès refusé");

  const { error } = await supabase
    .from("tenants")
    .update({ name, settings })
    .eq("id", profile.tenant_id);

  if (error) throw error;
  revalidatePath("/settings");
}
