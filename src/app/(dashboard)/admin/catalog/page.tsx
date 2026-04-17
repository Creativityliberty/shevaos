import { getCatalog } from "@/features/stock/actions/product-actions";
import { CatalogClient } from "./CatalogClient";

export default async function CatalogPage() {
  const products = await getCatalog();

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <CatalogClient initialProducts={products} />
    </div>
  );
}
