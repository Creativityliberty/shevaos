"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getSuppliers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching suppliers:", error);
    return [];
  }
  return data;
}

export async function createSupplier(params: {
  name: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  country?: string;
  category?: string;
}) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("user_profiles").select("tenant_id").eq("id", user?.id).single();

  if (!profile?.tenant_id) throw new Error("Accès refusé");

  const { data, error } = await supabase
    .from("suppliers")
    .insert({
      ...params,
      tenant_id: profile.tenant_id
    })
    .select()
    .single();

  if (error) throw error;
  
  revalidatePath("/logistique/fournisseurs");
  return data;
}

export async function updateSupplier(id: string, params: any) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("suppliers")
    .update(params)
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/logistique/fournisseurs");
}
