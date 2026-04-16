import { getImports, getSuppliersAndTransites } from "@/features/logistics/actions/import-actions";
import { ImportClient } from "./ImportClient";

export const dynamic = "force-dynamic";

export default async function ImportPage() {
  const [imports, lookups] = await Promise.all([
    getImports(),
    getSuppliersAndTransites()
  ]);

  return (
    <div className="max-w-[1400px] mx-auto py-8 px-4 sm:px-6">
      <ImportClient 
        initialImports={imports} 
        suppliers={lookups.suppliers} 
        transitAgents={lookups.transitAgents} 
      />
    </div>
  );
}
