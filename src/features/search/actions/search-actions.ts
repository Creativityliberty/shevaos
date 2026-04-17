"use server";

import { createClient } from "@/lib/supabase/server";

export async function globalSearch(query: string) {
  if (!query || query.length < 2) return { orders: [], products: [], customers: [] };

  const supabase = await createClient();
  const q = `%${query}%`;

  // Search Orders
  const { data: orders } = await supabase
    .from("orders")
    .select("id, tracking_number, customer_name, status")
    .or(`tracking_number.ilike.${q},customer_name.ilike.${q}`)
    .limit(5);

  // Search Products
  const { data: products } = await supabase
    .from("products")
    .select("id, name, sku, unit_price")
    .or(`name.ilike.${q},sku.ilike.${q}`)
    .limit(5);

  // Search Customers (if a table exists, otherwise skip)
  // Assuming customers are in orders or a separate table
  
  return {
    orders: orders || [],
    products: products || [],
    customers: [] // Add customer search if needed
  };
}
