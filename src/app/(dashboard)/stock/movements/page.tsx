import { getStockMovements } from "@/features/stock/actions/movement-actions";
import { MovementClient } from "@/features/stock/components/MovementClient";

export const dynamic = "force-dynamic";

export default async function MovementsPage() {
  const movements = await getStockMovements();

  return (
    <div className="max-w-[1400px] mx-auto py-8 px-4 sm:px-6">
      <MovementClient initialMovements={movements} />
    </div>
  );
}
