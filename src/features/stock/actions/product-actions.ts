"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getCatalog() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching catalog:", error.message);
    return [];
  }
  return data;
}

export async function upsertProduct(product: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("tenant_id")
    .eq("id", user?.id)
    .single();

  if (!profile?.tenant_id) throw new Error("Accès refusé");

  const productData = {
    ...product,
    tenant_id: profile.tenant_id
  };

  const { error } = await supabase
    .from("products")
    .upsert(productData);

  if (error) throw error;
  revalidatePath("/admin/catalog");
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/admin/catalog");
}
