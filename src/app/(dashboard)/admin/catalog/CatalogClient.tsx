"use client";

import { useState } from "react";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Package, 
  Tag, 
  DollarSign, 
  BarChart3,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  X
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { upsertProduct, deleteProduct } from "@/features/stock/actions/product-actions";

interface Props {
  initialProducts: any[];
}

export function CatalogClient({ initialProducts }: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      id: editingProduct?.id,
      name: formData.get("name"),
      sku: formData.get("sku"),
      unit_price: parseFloat(formData.get("unit_price") as string),
      buying_price: parseFloat(formData.get("buying_price") as string),
      min_stock_level: parseInt(formData.get("min_stock_level") as string),
      description: formData.get("description"),
      image_url: formData.get("image_url"),
      is_active: true
    };

    setIsSyncing(true);
    try {
      await upsertProduct(data);
      toast.success("Produit enregistré");
      setIsDialogOpen(false);
      setEditingProduct(null);
      // Refresh list (simplified)
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Erreur de sauvegarde");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return;
    try {
      await deleteProduct(id);
      toast.success("Produit supprimé");
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
           <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Catalogue <span className="text-primary">Produits</span></h1>
           <p className="text-gray-500 font-bold mt-1 uppercase text-xs tracking-widest">Gestion centrale des prix, coûts et seuils de stock</p>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
           <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                 placeholder="Rechercher un produit..." 
                 className="pl-12 h-14 rounded-2xl border-gray-100 bg-white shadow-sm font-bold"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           
           <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                  <Button onClick={() => setEditingProduct(null)} className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-black font-black gap-2 shadow-lg shadow-orange-100 transition-all active:scale-95">
                    <Plus className="w-5 h-5" /> NOUVEAU PRODUIT
                  </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] p-10">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-black uppercase tracking-tight">
                    {editingProduct ? "Modifier" : "Ajouter"} un <span className="text-primary">Produit</span>
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSave} className="space-y-6 pt-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2 col-span-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Nom du produit</label>
                      <Input name="name" defaultValue={editingProduct?.name} required className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">SKU / Code</label>
                      <Input name="sku" defaultValue={editingProduct?.sku} required className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Seuil Alerte Stock</label>
                      <Input name="min_stock_level" type="number" defaultValue={editingProduct?.min_stock_level || 5} required className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Prix de Vente (F)</label>
                      <Input name="unit_price" type="number" defaultValue={editingProduct?.unit_price} required className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold text-emerald-600" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Coût d'Achat (F)</label>
                       <Input name="buying_price" type="number" defaultValue={editingProduct?.buying_price} required className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold text-red-500" />
                    </div>
                    <div className="space-y-2 col-span-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">URL de l'image</label>
                       <Input name="image_url" defaultValue={editingProduct?.image_url} placeholder="https://..." className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Description</label>
                    <textarea name="description" defaultValue={editingProduct?.description} className="w-full min-h-[100px] p-4 rounded-2xl border-gray-100 bg-gray-50/50 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <DialogFooter className="pt-6">
                    <Button type="submit" disabled={isSyncing} className="w-full h-14 rounded-2xl bg-gray-900 text-white font-black uppercase tracking-widest hover:bg-black gap-2 transition-all">
                      {isSyncing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                      ENREGISTRER LE PRODUIT
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
           </Dialog>
        </div>
      </div>

      <Card className="rounded-[3rem] border-gray-100 shadow-sm overflow-hidden bg-white">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="hover:bg-transparent border-gray-100">
              <TableHead className="py-6 pl-10 font-black text-gray-400 uppercase text-[10px] tracking-widest">Produit</TableHead>
              <TableHead className="py-6 font-black text-gray-400 uppercase text-[10px] tracking-widest text-center">SKU</TableHead>
              <TableHead className="py-6 font-black text-gray-400 uppercase text-[10px] tracking-widest text-right">Prix Vente</TableHead>
              <TableHead className="py-6 font-black text-gray-400 uppercase text-[10px] tracking-widest text-right">Coût Achat</TableHead>
              <TableHead className="py-6 font-black text-gray-400 uppercase text-[10px] tracking-widest text-center">Seuil</TableHead>
              <TableHead className="py-6 pr-10 font-black text-gray-400 uppercase text-[10px] tracking-widest text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id} className="hover:bg-gray-50/30 border-gray-50 transition-colors">
                <TableCell className="py-8 pl-10">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 overflow-hidden border border-gray-100">
                         {p.image_url ? (
                           <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                         ) : (
                           <Package className="w-6 h-6" />
                         )}
                      </div>
                      <div>
                         <div className="font-black text-gray-900 uppercase tracking-tight">{p.name}</div>
                         <div className="text-[10px] font-bold text-gray-400 truncate max-w-[200px]">{p.description || "Aucune description"}</div>
                      </div>
                   </div>
                </TableCell>
                <TableCell className="text-center font-mono text-sm text-gray-500 font-bold">{p.sku}</TableCell>
                <TableCell className="text-right font-black text-emerald-600">
                   {Number(p.unit_price).toLocaleString()} F
                </TableCell>
                <TableCell className="text-right font-black text-red-400">
                   {Number(p.buying_price).toLocaleString()} F
                </TableCell>
                <TableCell className="text-center">
                   <Badge variant="outline" className="rounded-full border-gray-200 font-black text-[10px]">
                      {p.min_stock_level}
                   </Badge>
                </TableCell>
                <TableCell className="pr-10 text-right">
                   <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="w-10 h-10 rounded-xl hover:bg-blue-50 hover:text-blue-500"
                        onClick={() => {
                          setEditingProduct(p);
                          setIsDialogOpen(true);
                        }}
                      >
                         <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="w-10 h-10 rounded-xl hover:bg-red-50 hover:text-red-500"
                        onClick={() => handleDelete(p.id)}
                      >
                         <Trash2 className="w-4 h-4" />
                      </Button>
                   </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
