"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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

export async function createStockAdjustment(params: {
  product_id: string;
  hub_id: string;
  type: string;
  quantity: number;
  notes: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("create_stock_adjustment", {
    p_product_id: params.product_id,
    p_hub_id: params.hub_id,
    p_type: params.type,
    p_quantity: params.quantity,
    p_notes: params.notes
  });

  if (error) throw error;
  revalidatePath("/stock/inventory");
  revalidatePath("/stock/movements");
}
