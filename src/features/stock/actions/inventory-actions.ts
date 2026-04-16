"use server";

import { createClient } from "@/lib/supabase/server";

export async function getInventory() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stock_levels")
    .select(`
      *,
      products (id, name, sku, alert_threshold, average_purchase_cost, image_url),
      hubs (name)
    `)
    .order("total_stock", { ascending: true });

  if (error) {
    console.error("Error fetching inventory:", error);
    return [];
  }
  return data;
}

export async function getStockAlerts() {
  const supabase = await createClient();
  // On récupère les stocks dont available_stock <= alert_threshold (via jointure car alert_threshold est dans products)
  const { data, error } = await supabase
    .from("stock_levels")
    .select(`
      *,
      products!inner (name, sku, alert_threshold)
    `)
    .filter("available_stock", "lte", "products.alert_threshold"); // Note: Filtre complexe, on va le faire en TS si besoin ou via une vue

  if (error) {
    // Fallback safe: on verra dans le client
    return [];
  }
  return data;
}
