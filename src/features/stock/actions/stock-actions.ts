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

  // Agrégation manuelle pour le client
  return (data || []).map(p => {
    const totalStock = p.stock_levels?.reduce((acc: number, curr: any) => acc + (curr.total_stock || 0), 0) || 0;
    const totalReserved = p.stock_levels?.reduce((acc: number, curr: any) => acc + (curr.reserved_stock || 0), 0) || 0;
    
    return {
      ...p,
      total_stock: totalStock,
      reserved_stock: totalReserved,
      available_stock: totalStock - totalReserved,
      price: p.unit_price // Mapping pour la compatibilité UI si nécessaire
    };
  });
}
