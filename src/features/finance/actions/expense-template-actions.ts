"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getExpenseTemplates() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("expense_templates")
    .select("*")
    .order("name");

  if (error) throw new Error(error.message);
  return data || [];
}

export async function createExpenseTemplate(data: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { data: profile } = await supabase.from("user_profiles").select("tenant_id").eq("id", user.id).single();
  
  const { error } = await supabase
    .from("expense_templates")
    .insert([{ ...data, tenant_id: profile?.tenant_id }]);

  if (error) throw new Error(error.message);
  revalidatePath("/finance/expenses");
  return { success: true };
}

export async function runTemplateGeneration() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { data: profile } = await supabase.from("user_profiles").select("tenant_id").eq("id", user.id).single();
  
  const { data: generatedCount, error } = await supabase.rpc("generate_expenses_from_templates", {
    p_tenant_id: profile?.tenant_id,
    p_operator_id: user.id
  });

  if (error) throw new Error(error.message);
  
  revalidatePath("/finance/expenses");
  revalidatePath("/dashboard");
  return { count: generatedCount };
}

export async function deleteExpenseTemplate(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("expense_templates")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/finance/expenses");
  return { success: true };
}
