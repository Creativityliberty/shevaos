"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getTodaysClosing() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from("daily_closings")
    .select("*")
    .eq("closing_date", today)
    .maybeSingle();

  if (error) throw new Error(error.message);
  
  // Si pas de clôture aujourd'hui, on récupère le montant théorique
  if (!data) {
    const { data: profile } = await supabase.from("user_profiles").select("tenant_id").eq("id", user.id).single();
    const { data: theoretical } = await supabase.rpc("get_theoretical_cash", { p_tenant_id: profile?.tenant_id });
    
    return {
      closing_date: today,
      theoretical_amount: theoretical || 0,
      actual_amount: 0,
      status: 'SESSION_OUVERTE',
      is_new: true
    };
  }

  return { ...data, is_new: false };
}

export async function submitClosing(formData: {
  actual_amount: number;
  notes?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { data: profile } = await supabase.from("user_profiles").select("tenant_id").eq("id", user.id).single();
  if (!profile) throw new Error("Profil introuvable");

  const today = new Date().toISOString().split('T')[0];
  
  // Récupérer le montant théorique à l'instant T
  const { data: theoretical } = await supabase.rpc("get_theoretical_cash", { p_tenant_id: profile.tenant_id });

  const { error } = await supabase
    .from("daily_closings")
    .upsert([{
      tenant_id: profile.tenant_id,
      closing_date: today,
      theoretical_amount: theoretical || 0,
      actual_amount: formData.actual_amount,
      notes: formData.notes,
      operator_id: user.id,
      status: formData.actual_amount === theoretical ? 'VALIIDÉ' : 'ÉCART_SIGNALÉ'
    }], { onConflict: 'tenant_id, closing_date' });

  if (error) throw new Error(error.message);

  revalidatePath("/finance/closing");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getClosingHistory() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("daily_closings")
    .select(`
      *,
      operator:user_profiles(full_name)
    `)
    .order("closing_date", { ascending: false })
    .limit(30);

  if (error) throw new Error(error.message);
  return data;
}
