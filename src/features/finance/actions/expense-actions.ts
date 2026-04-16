"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ExpenseCategory = 
  | 'marketing_ads'
  | 'carburant'
  | 'loyer_bureau'
  | 'rh_salaire'
  | 'stock_achat'
  | 'logistique_transitaire'
  | 'frais_bancaires'
  | 'divers';

export async function getExpenses() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("expenses")
    .select(`
      *,
      operator:user_profiles(full_name)
    `)
    .order("expense_date", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function createExpense(formData: {
  amount: number;
  category: ExpenseCategory;
  description: string;
  expense_date: string;
  proof_url?: string;
}) {
  const supabase = await createClient();
  
  // Récupérer le profil pour le tenant_id et operator_id
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (!profile) throw new Error("Profil introuvable");

  const { error } = await supabase
    .from("expenses")
    .insert([{
      ...formData,
      tenant_id: profile.tenant_id,
      operator_id: user.id
    }]);

  if (error) throw new Error(error.message);

  revalidatePath("/finance/expenses");
  revalidatePath("/dashboard");
}

export async function getFinancialPerformance() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_financial_performance")
    .select("*")
    .order("day", { ascending: false })
    .limit(30);

  if (error) throw new Error(error.message);
  return data;
}
