"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getMarketingAccounts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("marketing_accounts")
    .select("*, account_manager:user_profiles(full_name)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function upsertMarketingAccount(data: any) {
  const supabase = await createClient();
  
  // Get tenant_id from user profile
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (!profile) throw new Error("Profil introuvable");

  const accountData = {
    ...data,
    tenant_id: profile.tenant_id,
  };

  const { error } = await supabase
    .from("marketing_accounts")
    .upsert(accountData);

  if (error) throw error;
  revalidatePath("/marketing/accounts");
}

export async function deleteMarketingAccount(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("marketing_accounts")
    .delete()
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/marketing/accounts");
}
