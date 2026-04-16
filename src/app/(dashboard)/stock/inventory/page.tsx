import { getInventory } from "@/features/stock/actions/inventory-actions";
import { InventoryClient } from "@/app/(dashboard)/stock/inventory/InventoryClient";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const inventory = await getInventory();

  return (
    <div className="max-w-[1400px] mx-auto py-8 px-4 sm:px-6">
      <InventoryClient 
        initialInventory={inventory} 
      />
    </div>
  );
}
