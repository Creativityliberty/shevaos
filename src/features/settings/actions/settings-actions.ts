"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getTenantStatus() {
  const supabase = await createClient();
  const { data: profile } = await supabase.from("user_profiles").select("tenant_id").single();
  
  if (!profile?.tenant_id) return null;

  const { data, error } = await supabase
    .from("tenants")
    .select("*")
    .eq("id", profile.tenant_id)
    .single();

  if (error) {
    console.error("Error fetching tenant:", error);
    return null;
  }
  return data;
}

export async function updateTenantSettings(name: string, settings: any) {
  const supabase = await createClient();
  const { data: profile } = await supabase.from("user_profiles").select("tenant_id").single();

  if (!profile?.tenant_id) throw new Error("Accès refusé");

  const { error } = await supabase
    .from("tenants")
    .update({ name, settings })
    .eq("id", profile.tenant_id);

  if (error) throw error;
  revalidatePath("/settings");
}
