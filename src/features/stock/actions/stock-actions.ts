"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function getProductsWithStock() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      stock_levels (total_stock, reserved_stock)
    `)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);

  return data;
}
