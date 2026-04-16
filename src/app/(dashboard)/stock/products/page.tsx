import { getProductsWithStock } from "@/features/stock/actions/stock-actions";
import { StockClient } from "./StockClient";

export default async function StockProductsPage() {
  const products = await getProductsWithStock();

  const criticalStock = products.filter((p: any) => p.available_stock <= p.min_stock_level && p.available_stock > 0).length;
  const zeroStock = products.filter((p: any) => p.available_stock <= 0).length;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">
            Centre <span className="text-primary">Logistique</span>
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            Gestion du parc de produits, alertes de réapprovisionnement et valorisation du stock.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 flex items-center justify-between">
            <div>
               <h3 className="uppercase font-bold text-amber-700 text-xs tracking-widest">Alerte Réassort</h3>
               <p className="text-3xl font-black text-amber-600 mt-1">{criticalStock}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-100/50 flex items-center justify-center font-black text-amber-700">⚠️</div>
         </div>
         <div className="bg-red-50 rounded-2xl p-6 border border-red-100 flex items-center justify-between">
            <div>
               <h3 className="uppercase font-bold text-red-700 text-xs tracking-widest">Rupture Critique</h3>
               <p className="text-3xl font-black text-red-600 mt-1">{zeroStock}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-100/50 flex items-center justify-center font-black text-red-700">🔥</div>
         </div>
      </div>

      <StockClient products={products} />
    </div>
  );
}
