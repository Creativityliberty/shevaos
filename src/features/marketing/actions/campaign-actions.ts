"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getMarketingCampaigns(status?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("marketing_campaigns")
    .select("*, marketing_account:marketing_accounts(name)");

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function upsertMarketingCampaign(data: any) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (!profile) throw new Error("Profil introuvable");

  const campaignData = {
    ...data,
    tenant_id: profile.tenant_id,
  };

  const { error } = await supabase
    .from("marketing_campaigns")
    .upsert(campaignData);

  if (error) throw error;
  revalidatePath("/marketing/campaigns");
  revalidatePath("/marketing/spend");
}

export async function deleteMarketingCampaign(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("marketing_campaigns")
    .delete()
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/marketing/campaigns");
}
