"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Search, Filter, Download, ChevronLeft, ChevronRight, X, Calendar } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  BROUILLON: "bg-gray-100 text-gray-600 border-gray-200",
  CONFIRMÉE: "bg-blue-50 text-blue-600 border-blue-100",
  ASSIGNÉE: "bg-purple-50 text-purple-600 border-purple-100",
  EN_LIVRAISON: "bg-orange-50 text-orange-600 border-orange-100",
  LIVRÉE: "bg-emerald-50 text-emerald-600 border-emerald-100",
  ECHEC_LIVRAISON: "bg-red-50 text-red-600 border-red-100",
  REPROGRAMMÉE: "bg-amber-50 text-amber-600 border-amber-100",
  ANNULÉE: "bg-red-100 text-red-700 border-red-200",
  ENCAISSÉE: "bg-green-50 text-green-600 border-green-100",
  DÉPOSÉE: "bg-teal-50 text-teal-600 border-teal-100",
  VÉRIFIÉE: "bg-primary/10 text-primary border-primary/20",
};

const ITEMS_PER_PAGE = 20;

interface Order {
  id: string;
  order_number: string;
  status: string;
  cod_amount: number;
  created_at: string;
  delivery_window: string | null;
  last_callback_at: string | null;
  customers: { 
    id: string;
    full_name: string; 
    phone: string;
  } | null;
  zones: { name: string } | null;
  customer_scoring?: {
    trust_score: string;
  };
}

interface Filters {
  search: string;
  status: string[];
  minAmount: number | null;
  maxAmount: number | null;
  startDate: string | null;
  endDate: string | null;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: [],
    minAmount: null,
    maxAmount: null,
    startDate: null,
    endDate: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          customers (*),
          zones (name)
        `)
        .order("created_at", { ascending: false });

      // Fetch scoring separately since the view might not have an FK defined
      const { data: scores } = await supabase.from("v_customer_scoring").select("*");
      
      const ordersWithScoring = data?.map(order => ({
        ...order,
        customer_scoring: scores?.find(s => s.customer_id === order.customer_id)
      })) || [];

      if (error) throw error;
      setOrders(ordersWithScoring);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
      toast.error("Erreur", { description: "Impossible de charger les commandes" });
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Filtre de recherche
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch =
          order.order_number.toLowerCase().includes(searchTerm) ||
          order.customers?.full_name.toLowerCase().includes(searchTerm) ||
          order.customers?.phone.includes(searchTerm) ||
          order.zones?.name.toLowerCase().includes(searchTerm);
        if (!matchesSearch) return false;
      }

      // Filtre par statut
      if (filters.status.length > 0 && !filters.status.includes(order.status)) {
        return false;
      }

      // Filtre par montant
      if (filters.minAmount !== null && order.cod_amount < filters.minAmount) {
        return false;
      }
      if (filters.maxAmount !== null && order.cod_amount > filters.maxAmount) {
        return false;
      }

      // Filtre par date
      if (filters.startDate) {
        const orderDate = new Date(order.created_at);
        const startDate = new Date(filters.startDate);
        if (orderDate < startDate) return false;
      }
      if (filters.endDate) {
        const orderDate = new Date(order.created_at);
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59);
        if (orderDate > endDate) return false;
      }

      return true;
    });
  }, [orders, filters]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const exportToCSV = () => {
    const headers = ["N° Commande", "Client", "Téléphone", "Zone", "Montant COD", "Statut", "Date"];
    const csvData = filteredOrders.map(order => [
      order.order_number,
      order.customers?.full_name || "",
      order.customers?.phone || "",
      order.zones?.name || "",
      order.cod_amount.toString(),
      order.status,
      new Date(order.created_at).toLocaleDateString()
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `commandes_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Export réussi", { description: "Les données ont été exportées en CSV" });
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: [],
      minAmount: null,
      maxAmount: null,
      startDate: null,
      endDate: null,
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = Object.values(filters).some(value =>
    Array.isArray(value) ? value.length > 0 : value !== null && value !== ""
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">
            Gestion des <span className="text-primary">Commandes</span>
          </h1>
          <p className="text-gray-500 font-medium">
            {filteredOrders.length} commande{filteredOrders.length !== 1 ? 's' : ''} trouvée{filteredOrders.length !== 1 ? 's' : ''}
            {hasActiveFilters && " (filtrées)"}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="rounded-2xl border-gray-200 font-bold gap-2"
            onClick={exportToCSV}
            disabled={filteredOrders.length === 0}
          >
            <Download className="w-4 h-4" />
            Exporter CSV
          </Button>
          <Link href="/orders/new">
            <Button className="rounded-2xl font-bold shadow-lg shadow-orange-100 gap-2 h-11 px-6">
              <Plus className="w-5 h-5" />
              Nouvelle Commande
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher par n° de commande, client, téléphone, zone..."
              className="pl-10 rounded-2xl border-gray-200 h-11 focus:ring-primary focus:border-primary"
              value={filters.search}
              onChange={(e) => {
                setFilters(prev => ({ ...prev, search: e.target.value }));
                setCurrentPage(1);
              }}
            />
            {filters.search && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, search: "" }))}
                className="absolute right-3 top-3 p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger 
              render={
                <Button variant="outline" className="rounded-2xl border-gray-200 font-bold gap-2 h-11 px-4">
                  <Filter className="w-4 h-4" />
                  Filtres Avancés
                  {hasActiveFilters && (
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                  )}
                </Button>
              }
            />
            <PopoverContent className="w-80 p-6 rounded-2xl" align="end">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">Filtres avancés</h3>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-primary hover:text-primary/80 font-medium"
                    >
                      Tout effacer
                    </button>
                  )}
                </div>

                {/* Filtre par statut */}
                <div className="space-y-3">
                  <Label className="font-bold text-sm">Statut</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(STATUS_COLORS).map(status => (
                      <div key={status} className="flex items-center space-x-2">
                        <Checkbox
                          id={`status-${status}`}
                          checked={filters.status.includes(status)}
                          onCheckedChange={(checked) => {
                            setFilters(prev => ({
                              ...prev,
                              status: checked
                                ? [...prev.status, status]
                                : prev.status.filter(s => s !== status)
                            }));
                            setCurrentPage(1);
                          }}
                        />
                        <Label htmlFor={`status-${status}`} className="text-sm cursor-pointer">
                          {status}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Filtre par montant */}
                <div className="space-y-3">
                  <Label className="font-bold text-sm">Montant COD (FCFA)</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">Min</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={filters.minAmount ?? ""}
                        onChange={(e) => {
                          const value = e.target.value ? Number(e.target.value) : null;
                          setFilters(prev => ({ ...prev, minAmount: value }));
                          setCurrentPage(1);
                        }}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">Max</Label>
                      <Input
                        type="number"
                        placeholder="∞"
                        value={filters.maxAmount ?? ""}
                        onChange={(e) => {
                          const value = e.target.value ? Number(e.target.value) : null;
                          setFilters(prev => ({ ...prev, maxAmount: value }));
                          setCurrentPage(1);
                        }}
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Filtre par date */}
                <div className="space-y-3">
                  <Label className="font-bold text-sm">Période</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">Début</Label>
                      <Input
                        type="date"
                        value={filters.startDate ?? ""}
                        onChange={(e) => {
                          setFilters(prev => ({ ...prev, startDate: e.target.value || null }));
                          setCurrentPage(1);
                        }}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">Fin</Label>
                      <Input
                        type="date"
                        value={filters.endDate ?? ""}
                        onChange={(e) => {
                          setFilters(prev => ({ ...prev, endDate: e.target.value || null }));
                          setCurrentPage(1);
                        }}
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Filtres actifs */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <Badge variant="secondary" className="gap-1">
                Recherche: "{filters.search}"
                <button onClick={() => setFilters(prev => ({ ...prev, search: "" }))}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {filters.status.map(status => (
              <Badge key={status} variant="secondary" className="gap-1">
                {status}
                <button onClick={() => setFilters(prev => ({
                  ...prev,
                  status: prev.status.filter(s => s !== status)
                }))}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            {(filters.minAmount !== null || filters.maxAmount !== null) && (
              <Badge variant="secondary" className="gap-1">
                Montant: {filters.minAmount ?? "0"} - {filters.maxAmount ?? "∞"} FCFA
                <button onClick={() => setFilters(prev => ({ ...prev, minAmount: null, maxAmount: null }))}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {(filters.startDate || filters.endDate) && (
              <Badge variant="secondary" className="gap-1">
                Période: {filters.startDate || "∞"} - {filters.endDate || "∞"}
                <button onClick={() => setFilters(prev => ({ ...prev, startDate: null, endDate: null }))}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Orders Table */}
      <Card className="rounded-[2.5rem] border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="hover:bg-transparent border-gray-100">
                <TableHead className="w-[150px] font-bold text-gray-400 py-4 pl-8 uppercase text-xs tracking-widest">
                  N° Commande
                </TableHead>
                <TableHead className="font-bold text-gray-400 py-4 uppercase text-xs tracking-widest">
                  Client
                </TableHead>
                <TableHead className="font-bold text-gray-400 py-4 uppercase text-xs tracking-widest">
                  Zone
                </TableHead>
                <TableHead className="font-bold text-gray-400 py-4 uppercase text-xs tracking-widest text-right">
                  Montant COD
                </TableHead>
                <TableHead className="font-bold text-gray-400 py-4 uppercase text-xs tracking-widest text-center">
                  Statut
                </TableHead>
                <TableHead className="font-bold text-gray-400 py-4 pr-8 uppercase text-xs tracking-widest text-right">
                  Date
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {error ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-red-500 font-medium">
                    Erreur lors du chargement des commandes.
                  </TableCell>
                </TableRow>
              ) : paginatedOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-24">
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-4 bg-orange-50 rounded-full text-primary mb-2">
                        <Filter className="w-8 h-8" />
                      </div>
                      <p className="font-black text-gray-900 text-xl tracking-tight">
                        {hasActiveFilters ? "Aucune commande ne correspond aux filtres" : "Aucune commande"}
                      </p>
                      <p className="text-gray-400 font-medium">
                        {hasActiveFilters
                          ? "Modifiez vos critères de recherche"
                          : "Commencez par créer votre première commande"
                        }
                      </p>
                      {hasActiveFilters && (
                        <Button variant="outline" onClick={clearFilters} className="mt-2">
                          Effacer tous les filtres
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-orange-50/10 border-gray-50 transition-colors group">
                    <TableCell className="font-black text-gray-900 py-4 pl-8">
                      <Link href={`/orders/${order.id}`} className="hover:text-primary transition-colors">
                        {order.order_number}
                      </Link>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-800">{order.customers?.full_name}</span>
                          {order.customer_scoring && (
                            <Badge 
                              className={cn(
                                "text-[9px] font-black px-1.5 py-0 rounded-md border-none",
                                order.customer_scoring.trust_score === 'VIP' ? "bg-amber-100 text-amber-600" :
                                order.customer_scoring.trust_score === 'BLACKLISTÉ' ? "bg-red-100 text-red-600" :
                                order.customer_scoring.trust_score === 'NOUVEAU' ? "bg-blue-100 text-blue-600" :
                                "bg-emerald-100 text-emerald-600"
                              )}
                            >
                              {order.customer_scoring.trust_score}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 font-medium">{order.customers?.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="rounded-lg font-bold border-gray-200 bg-gray-50/50 text-gray-500 w-fit">
                          {order.zones?.name}
                        </Badge>
                        {order.delivery_window && (
                          <span className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {order.delivery_window}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-right font-black text-gray-900">
                      {order.cod_amount.toLocaleString()} <span className="text-[10px] text-gray-400">FCFA</span>
                    </TableCell>
                    <TableCell className="py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Badge className={`rounded-xl px-3 py-1 border font-bold ${STATUS_COLORS[order.status] || "bg-gray-100"}`}>
                          {order.status}
                        </Badge>
                        {order.last_callback_at && (
                          <span className="text-[9px] text-emerald-600 font-bold">Relancé le {new Date(order.last_callback_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 pr-8 text-right text-gray-400 font-medium text-sm">
                      {new Date(order.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-8 py-4 border-t border-gray-100">
            <div className="text-sm text-gray-500">
              Page {currentPage} sur {totalPages} •
              {filteredOrders.length} commande{filteredOrders.length !== 1 ? 's' : ''} au total
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="h-9 px-3 gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Précédent
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  if (page > totalPages) return null;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="h-9 w-9 p-0"
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="h-9 px-3 gap-1"
              >
                Suivant
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
