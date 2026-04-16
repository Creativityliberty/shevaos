import { createClient } from "@/lib/supabase/server";
import { StockReceiveClient } from "./StockReceiveClient";

export default async function StockReceivePage() {
  const supabase = await createClient();
  
  const [
    { data: products },
    { data: hubs }
  ] = await Promise.all([
    supabase.from("products").select("id, name, sku, available_stock").eq("is_active", true).order("name"),
    supabase.from("hubs").select("*").order("name")
  ]);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <StockReceiveClient products={products || []} hubs={hubs || []} />
    </div>
  );
}
