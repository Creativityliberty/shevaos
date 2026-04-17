"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createCustomer(data: any) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: userProfile } = await supabase
    .from("user_profiles")
    .select("tenant_id")
    .eq("id", user?.id)
    .single();

  if (!userProfile?.tenant_id) {
    throw new Error("Tenant introuvable pour cet utilisateur.");
  }

  const { data: customer, error } = await supabase
    .from("customers")
    .insert([{ ...data, tenant_id: userProfile.tenant_id }])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/customers");
  return customer;
}
