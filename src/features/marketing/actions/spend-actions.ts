"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getDailySpendLogs(date: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("marketing_spend_logs")
    .select("*, campaign:marketing_campaigns(name, platform)")
    .eq("log_date", date);

  if (error) throw error;
  return data;
}

export async function upsertSpendLog(data: { campaign_id: string; log_date: string; spend_amount: number; reach?: number; clicks?: number }) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (!profile) throw new Error("Profil introuvable");

  const logData = {
    ...data,
    tenant_id: profile.tenant_id,
  };

  const { error } = await supabase
    .from("marketing_spend_logs")
    .upsert(logData, { 
      onConflict: 'campaign_id,log_date' 
    });

  if (error) throw error;
  revalidatePath("/marketing/spend");
  revalidatePath("/admin/vision"); // Impact dashboard ROI
}

export async function getCampaignsForSpendEntry() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("marketing_campaigns")
    .select("id, name, platform, marketing_account:marketing_accounts(name)")
    .eq("status", "RUNNING");

  if (error) throw error;
  return data;
}
