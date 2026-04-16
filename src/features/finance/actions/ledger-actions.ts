"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function getPendingDepositsForFinance() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("deposits")
    .select(`
      *,
      driver:user_profiles!deposits_driver_id_fkey (full_name),
      validator:user_profiles!deposits_hub_validated_by_fkey (full_name)
    `)
    .eq("status", "VALIDÉ_HUB")
    .order("hub_validated_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getLedgerEntries() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ledger_entries")
    .select(`
      *,
      user_profiles (full_name)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function verifyAndLedgerDeposit(depositId: string, verifiedAmount: number, notes?: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.rpc("verify_and_ledger_deposit", {
      p_deposit_id: depositId,
      p_verified_amount: verifiedAmount,
      p_notes: notes || null
    });

    if (error) throw new Error(error.message);

    revalidatePath("/finance/deposits");
    revalidatePath("/finance/ledger");
    
    return { success: true, data };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
