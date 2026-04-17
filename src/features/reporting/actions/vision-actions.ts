"use server";

import { createClient } from "@/lib/supabase/server";

export async function getCeoVisionReport(days: number = 30) {
  const supabase = await createClient();
  
  const { data, error } = await supabase.rpc("get_ceo_performance_report", { p_days: days });

  if (error) {
    console.error("Error fetching vision report:", error);
    return null;
  }

  return data;
}

export async function getInventoryHealth() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("products")
    .select("name, available_stock, min_stock_level, buying_price")
    .order("available_stock", { ascending: true });

  if (error) throw error;
  return data;
}
