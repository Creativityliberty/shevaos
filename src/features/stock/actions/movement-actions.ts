"use server";

import { createClient } from "@/lib/supabase/server";

export async function getStockMovements() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stock_movements")
    .select(`
      *,
      products (name, sku),
      user_profiles (full_name)
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Error fetching movements:", error);
    return [];
  }
  return data;
}
