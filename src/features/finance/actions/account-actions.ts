"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getFinanceAccounts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("finance_accounts")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) {
    console.error("Error fetching accounts:", error);
    return [];
  }
  return data;
}

export async function getInternalTransfers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("internal_transfers")
    .select(`
      *,
      from_account:finance_accounts!from_account_id(name),
      to_account:finance_accounts!to_account_id(name)
    `)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error fetching transfers:", error);
    return [];
  }
  return data;
}

export async function createInternalTransfer(params: {
  from_account_id: string;
  to_account_id: string;
  amount: number;
  description: string;
}) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("user_profiles").select("tenant_id").eq("id", user?.id).single();

  const { data, error } = await supabase
    .from("internal_transfers")
    .insert({
      ...params,
      tenant_id: profile?.tenant_id,
      status: 'COMPLETED' // On passe direct en COMPLETED pour l'instant
    })
    .select()
    .single();

  if (error) throw error;
  
  revalidatePath("/finance/accounts");
  return data;
}

export async function createFinanceAccount(params: {
  name: string;
  type: 'OM' | 'WAVE' | 'CASH' | 'BANC';
  account_number: string;
  balance: number;
}) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("user_profiles").select("tenant_id").eq("id", user?.id).single();

  const { data, error } = await supabase
    .from("finance_accounts")
    .insert({
      ...params,
      tenant_id: profile?.tenant_id
    })
    .select()
    .single();

  if (error) throw error;
  
  revalidatePath("/finance/accounts");
  return data;
}
