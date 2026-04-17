"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Package, 
  ShoppingCart, 
  User, 
  FileText,
  Loader2,
  PackageSearch
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { globalSearch } from "@/features/search/actions/search-actions";
import { useDebounce } from "@/hooks/use-debounce";

export function SearchCommand() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<{ orders: any[], products: any[] }>({ orders: [], products: [] });
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();
  const debouncedQuery = useDebounce(query, 300);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  React.useEffect(() => {
    if (debouncedQuery.length > 1) {
      handleSearch(debouncedQuery);
    } else {
      setResults({ orders: [], products: [] });
    }
  }, [debouncedQuery]);

  const handleSearch = async (q: string) => {
    setIsLoading(true);
    try {
      const res = await globalSearch(q);
      setResults(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex relative group items-center"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
        <div className="h-10 w-64 rounded-xl border border-gray-100 bg-gray-50/50 pl-10 pr-4 text-sm text-gray-400 flex items-center justify-between group-hover:bg-white group-hover:border-primary/20 transition-all">
          <span>Rechercher...</span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Rechercher une commande, un produit..." 
          value={query}
          onValueChange={setQuery}
        />
        <CommandList className="max-h-[400px]">
          <CommandEmpty className="py-10 text-center">
            {isLoading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Recherche en cours...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-gray-400">
                <PackageSearch className="w-10 h-10 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-tight">Aucun résultat pour "{query}"</p>
              </div>
            )}
          </CommandEmpty>

          {results.orders.length > 0 && (
            <CommandGroup heading="Commandes">
              {results.orders.map((order) => (
                <CommandItem
                  key={order.id}
                  onSelect={() => runCommand(() => router.push(`/orders/${order.id}`))}
                  className="p-3 cursor-pointer"
                >
                  <ShoppingCart className="mr-2 h-4 w-4 text-primary" />
                  <div className="flex flex-col">
                    <span className="font-bold">{order.order_number}</span>
                    <span className="text-[10px] text-gray-400 uppercase">
                      {order.customer?.full_name || "Client Inconnu"} • {order.status}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandSeparator />

          {results.products.length > 0 && (
            <CommandGroup heading="Produits">
              {results.products.map((product) => (
                <CommandItem
                  key={product.id}
                  onSelect={() => runCommand(() => router.push(`/stock/products`))}
                  className="p-3 cursor-pointer"
                >
                  <Package className="mr-2 h-4 w-4 text-orange-500" />
                  <div className="flex flex-col">
                    <span className="font-bold">{product.name}</span>
                    <span className="text-[10px] text-gray-400 uppercase">{product.sku} • {product.unit_price} FCFA</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandGroup heading="Raccourcis">
            <CommandItem onSelect={() => runCommand(() => router.push("/finance/expenses"))}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Dépenses</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/admin/vision"))}>
              <User className="mr-2 h-4 w-4" />
              <span>Vision Stratégique</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
