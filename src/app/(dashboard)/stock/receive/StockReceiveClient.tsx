"use client";

import { useState } from "react";
import { 
  Package, 
  Truck, 
  Plus, 
  Trash2, 
  Loader2, 
  CheckCircle2, 
  ChevronLeft,
  Warehouse,
  AlertCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { receiveProducts } from "@/features/inventory/actions/stock-actions";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  products: any[];
  hubs: any[];
}

export function StockReceiveClient({ products, hubs }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedHub, setSelectedHub] = useState("");
  const [items, setItems] = useState([{ product_id: "", quantity: 1, notes: "" }]);

  const addItem = () => {
    setItems([...items, { product_id: "", quantity: 1, notes: "" }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleReceive = async () => {
    if (!selectedHub) {
      toast.error("Veuillez choisir un Hub (entrepôt) de destination.");
      return;
    }

    const validItems = items.filter(i => i.product_id && i.quantity > 0);
    if (validItems.length === 0) {
      toast.error("Veuillez ajouter au moins un produit valide.");
      return;
    }

    setIsLoading(true);
    try {
      await receiveProducts({
        hub_id: selectedHub,
        items: validItems
      });
      toast.success("Réception validée", { description: "Le stock a été mis à jour avec succès." });
      router.push("/inventory/products");
    } catch (error: any) {
      toast.error("Erreur", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/stock/products">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white shadow-sm border border-gray-100 h-12 w-12">
              <ChevronLeft className="w-6 h-6" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Réception <span className="text-primary">Stock</span></h1>
            <p className="text-gray-500 font-medium">Entrée massive de marchandise fournisseur.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Hub Selection */}
          <Card className="p-6 rounded-[2rem] border-orange-50 bg-white shadow-sm flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
              <Warehouse className="w-8 h-8" />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Destination</label>
              <Select value={selectedHub} onValueChange={(val: string) => setSelectedHub(val ?? "")}>
                <SelectTrigger className="h-12 rounded-xl border-gray-100 bg-gray-50/50 font-bold focus:ring-primary transition-all">
                  <SelectValue placeholder="Choisir l'entrepôt / Hub" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                  {hubs.map((hub) => (
                    <SelectItem key={hub.id} value={hub.id} className="font-bold py-3">{hub.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Items List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-4">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Articles reçus ({items.length})</h3>
              <Button onClick={addItem} variant="outline" size="sm" className="rounded-xl border-primary text-primary hover:bg-orange-50 font-bold gap-2">
                <Plus className="w-4 h-4" /> Ajouter
              </Button>
            </div>

            <AnimatePresence mode="popLayout">
              {items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="group"
                >
                  <Card className="p-5 rounded-[2rem] border-gray-100 bg-white shadow-sm group-hover:shadow-md transition-all relative overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      {/* Product Select */}
                      <div className="md:col-span-7 space-y-1">
                        <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest pl-1">Produit</label>
                        <Select 
                          value={item.product_id} 
                          onValueChange={(val: string) => updateItem(index, "product_id", val)}
                        >
                          <SelectTrigger className="h-11 rounded-xl border-transparent bg-gray-50 focus:bg-white transition-colors font-bold">
                            <SelectValue placeholder="Rechercher un produit..." />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-gray-100 max-h-64">
                            {products.map((p) => (
                              <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Quantity */}
                      <div className="md:col-span-3 space-y-1">
                        <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest pl-1">Quantité</label>
                        <Input 
                          type="number" 
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value))}
                          className="h-11 rounded-xl border-transparent bg-gray-50 focus:bg-white text-center font-black text-lg"
                        />
                      </div>

                      {/* Remove Button */}
                      <div className="md:col-span-2 flex items-end justify-end pb-1 pr-1">
                        <Button 
                          onClick={() => removeItem(index)} 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50"
                          disabled={items.length === 1}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {items.length === 0 && (
              <div className="py-12 border-2 border-dashed border-gray-100 rounded-[2.5rem] flex flex-col items-center justify-center text-gray-300 gap-3">
                <Package className="w-12 h-12 opacity-20" />
                <p className="font-bold uppercase tracking-widest text-xs">Veuillez ajouter des articles</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Column */}
        <div className="space-y-6">
          <Card className="p-8 rounded-[2.5rem] bg-gray-900 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Truck className="w-24 h-24 text-white rotate-12" />
            </div>
            
            <div className="relative z-10 space-y-6">
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Récapitulatif</h3>
                <p className="text-gray-400 text-sm font-medium">Validation de l'entrée en stock physique.</p>
              </div>

              <div className="py-6 border-y border-white/10 space-y-3">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-gray-400">Hub Destination</span>
                  <span className="text-white">{hubs.find(h => h.id === selectedHub)?.name || "-"}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-gray-400">Total Articles</span>
                  <span className="text-white">{items.reduce((acc, curr) => acc + (curr.quantity || 0), 0)} unités</span>
                </div>
              </div>

              <Button 
                onClick={handleReceive}
                disabled={isLoading || !selectedHub}
                className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-black font-black text-xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.03] active:scale-95"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : "VALIDER L'ENTRÉE"}
              </Button>

              <div className="flex items-center gap-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Action irréversible (Ledger tracé)
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-[2.5rem] bg-blue-50/50 border border-blue-100 space-y-3">
            <div className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest">
              <AlertCircle className="w-4 h-4" /> Note Importante
            </div>
            <p className="text-xs text-blue-700/70 font-medium leading-relaxed">
              Cette action génère un mouvement de type <span className="font-bold">ENTRÉE FOURNISSEUR</span>. Vérifiez bien les quantités physiques avant de valider.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
