"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, AlertTriangle, BatteryMedium, BatteryWarning } from "lucide-react";

export function StockClient({ products }: { products: any[] }) {
  if (!products || products.length === 0) {
     return (
        <Card className="p-16 border-dashed border-2 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-[3xl]">
          <Package className="w-12 h-12 opacity-20 mb-4" />
          <p className="font-bold text-xl">Aucun produit</p>
          <p className="font-medium text-center text-sm max-w-sm mt-2">Commencez par ajouter des produits à votre catalogue central.</p>
        </Card>
     );
  }

  return (
    <Card className="rounded-[2.5rem] border-gray-100 shadow-sm overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="hover:bg-transparent border-gray-100">
              <TableHead className="w-[80px] py-4 pl-8"></TableHead>
              <TableHead className="font-bold text-gray-400 py-4 uppercase text-xs tracking-widest">Produit</TableHead>
              <TableHead className="font-bold text-gray-400 py-4 uppercase text-xs tracking-widest text-center">Disponible</TableHead>
              <TableHead className="font-bold text-gray-400 py-4 uppercase text-xs tracking-widest text-center">Réservé</TableHead>
              <TableHead className="font-bold text-gray-400 py-4 uppercase text-xs tracking-widest text-right pr-8">Valeur unitaire</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p: any) => {
              const isCrit = p.available_stock <= p.min_stock_level && p.available_stock > 0;
              const isZero = p.available_stock <= 0;
              
              // Simplification: le trigger p.available_stock est la source of truth.
              // stock_levels array sert à extraire reserved si besoin.
              let totalReserved = 0;
              if (p.stock_levels && p.stock_levels.length > 0) {
                 totalReserved = p.stock_levels.reduce((acc: number, curr: any) => acc + (curr.reserved_stock || 0), 0);
              }

              return (
                <TableRow key={p.id} className="hover:bg-orange-50/10 border-gray-50 transition-colors">
                  <TableCell className="py-5 pl-8">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isZero ? 'bg-red-50 text-red-500' : isCrit ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'}`}>
                       {isZero ? <BatteryWarning className="w-5 h-5" /> : isCrit ? <AlertTriangle className="w-5 h-5" /> : <BatteryMedium className="w-5 h-5" />}
                    </div>
                  </TableCell>
                  
                  <TableCell className="py-5">
                    <div className="font-bold text-gray-900 text-lg">{p.name}</div>
                    <div className="text-xs text-gray-400 font-bold uppercase mt-1">SKU: {p.sku || 'N/A'}</div>
                  </TableCell>
                  
                  <TableCell className="py-5 text-center">
                    <div className={`text-2xl font-black ${isZero ? 'text-red-500' : isCrit ? 'text-amber-500' : 'text-gray-900'}`}>{p.available_stock}</div>
                    {isCrit && <div className="text-[10px] text-amber-600 font-black uppercase tracking-widest">Sous seuil de {p.min_stock_level}</div>}
                    {isZero && <div className="text-[10px] text-red-600 font-black uppercase tracking-widest">Rupture</div>}
                  </TableCell>

                  <TableCell className="py-5 text-center">
                    <div className="text-sm font-bold text-gray-500 uppercase flex items-center justify-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-orange-300"></span> {totalReserved} réservés
                    </div>
                  </TableCell>
                  
                  <TableCell className="py-5 pr-8 text-right font-black text-gray-600">
                    {Number(p.price).toLocaleString()} F
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
