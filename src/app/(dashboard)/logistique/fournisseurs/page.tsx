import { getSuppliersWithBalance } from "@/features/logistics/actions/supplier-automation-actions";
import { FournisseursClient } from "./FournisseursClient";

export default async function FournisseursPage() {
  const suppliers = await getSuppliersWithBalance();

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <FournisseursClient initialSuppliers={suppliers} />
    </div>
  );
}
