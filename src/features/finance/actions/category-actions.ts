"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getExpenseCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("expense_categories")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
  return data;
}

export async function createExpenseCategory(name: string, color: string = "bg-gray-100 text-gray-700") {
  const supabase = await createClient();
  const { data: profile } = await supabase.from("user_profiles").select("tenant_id").single();

  const { data, error } = await supabase
    .from("expense_categories")
    .insert({
      tenant_id: profile?.tenant_id,
      name,
      color
    })
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/finance/expenses");
  return data;
}
