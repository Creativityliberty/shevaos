"use client";

import { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  MapPin, 
  Phone, 
  Clock, 
  Calendar, 
  User, 
  MessageSquare, 
  History,
  CheckCircle2,
  AlertCircle,
  Truck,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Navigation,
  ExternalLink,
  AlertTriangle
} from "lucide-react";
import { CreateIncidentDialog } from "@/features/sav/components/CreateIncidentDialog";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface OrderDetail {
  id: string;
  order_number: string;
  status: string;
  cod_amount: number;
  delivery_fee: number;
  total_amount: number;
  delivery_address: string;
  delivery_lat?: number;
  delivery_lng?: number;
  secondary_phone?: string;
  delivery_window?: string;
  notes?: string;
  created_at: string;
  confirmed_at?: string;
  delivered_at?: string;
  last_callback_at?: string;
  callback_notes?: string;
  customer_id: string;
  customers: {
    full_name: string;
    phone: string;
  };
  zones: {
    name: string;
  };
  order_items: {
    id: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    products: {
      name: string;
      sku: string;
    };
  }[];
}

const STATUS_CONFIG: Record<string, { color: string, icon: any }> = {
  BROUILLON: { color: "bg-gray-100 text-gray-600 border-gray-200", icon: Clock },
  CONFIRMÉE: { color: "bg-blue-50 text-blue-600 border-blue-100", icon: CheckCircle2 },
  ASSIGNÉE: { color: "bg-purple-50 text-purple-600 border-purple-100", icon: User },
  EN_LIVRAISON: { color: "bg-orange-50 text-orange-600 border-orange-100", icon: Truck },
  LIVRÉE: { color: "bg-emerald-50 text-emerald-600 border-emerald-100", icon: CheckCircle2 },
  ECHEC_LIVRAISON: { color: "bg-red-50 text-red-600 border-red-100", icon: AlertCircle },
  ANNULÉE: { color: "bg-red-100 text-red-700 border-red-200", icon: AlertCircle },
  VÉRIFIÉE: { color: "bg-primary/10 text-primary border-primary/20", icon: ShieldCheck },
};

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [callbackNote, setCallbackNote] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          customers (*),
          zones (name),
          order_items (
            *,
            products (name, sku)
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (err) {
      toast.error("Erreur", { description: "Impossible de charger la commande" });
      router.push("/orders");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      setIsUpdating(true);
      const supabase = createClient();
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;
      toast.success("Statut mis à jour");
      fetchOrderDetail();
    } catch (err) {
      toast.error("Erreur", { description: "Impossible de mettre à jour le statut" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddCallback = async () => {
    if (!callbackNote) return;
    try {
      setIsUpdating(true);
      const supabase = createClient();
      const { error } = await supabase
        .from("orders")
        .update({ 
          last_callback_at: new Date().toISOString(),
          callback_notes: callbackNote
        })
        .eq("id", id);

      if (error) throw error;
      toast.success("Note de relance ajoutée");
      setCallbackNote("");
      fetchOrderDetail();
    } catch (err) {
      toast.error("Erreur", { description: "Impossible d'ajouter la relance" });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return (
    <div className="space-y-6 p-8">
      <Skeleton className="h-12 w-1/3 rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    </div>
  );

  if (!order) return null;

  const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.BROUILLON;
  const StatusIcon = statusInfo.icon;

  const openInGoogleMaps = () => {
    if (order.delivery_lat && order.delivery_lng) {
      window.open(`https://www.google.com/maps?q=${order.delivery_lat},${order.delivery_lng}`, '_blank');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/orders">
          <Button variant="ghost" className="gap-2 text-gray-500 hover:text-primary transition-colors">
            <ChevronLeft className="w-5 h-5" />
            Retour aux commandes
          </Button>
        </Link>
        <div className="flex gap-3">
          <CreateIncidentDialog orderId={order.id} orderNumber={order.order_number} />
          <Button variant="outline" className="rounded-2xl border-gray-200 font-bold">
            Modifier
          </Button>
          <Button className="rounded-2xl shadow-lg shadow-orange-100 font-bold">
            Imprimer BL
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">#{order.order_number}</h1>
            <Badge className={cn("rounded-xl px-4 py-1.5 border font-black text-sm uppercase", statusInfo.color)}>
              <StatusIcon className="w-4 h-4 mr-2" />
              {order.status}
            </Badge>
          </div>
          <p className="text-gray-400 font-medium">Créée le {new Date(order.created_at).toLocaleString()}</p>
        </div>
        
        <div className="flex gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-400 font-black uppercase tracking-widest">Montant Total</p>
            <p className="text-3xl font-black text-primary">
              {order.cod_amount.toLocaleString()} <span className="text-sm">FCFA</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Colonne Gauche: Infos Client & Livraison */}
        <div className="md:col-span-2 space-y-8">
          <Card className="rounded-[2.5rem] border-gray-100 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-black text-gray-900">Informations Client</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-tighter">Nom Complet</p>
                    <p className="font-bold text-gray-900 text-lg">{order.customers.full_name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-tighter">Téléphone Principal</p>
                    <p className="font-bold text-gray-900 text-lg">{order.customers.phone}</p>
                  </div>
                </div>
                {order.secondary_phone && (
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-emerald-50 rounded-lg text-emerald-400">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-emerald-400 uppercase tracking-tighter">Téléphone Secondaire</p>
                      <p className="font-bold text-gray-900 text-lg">{order.secondary_phone}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-orange-50 rounded-lg text-orange-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-orange-400 uppercase tracking-tighter">Adresse de livraison</p>
                    <p className="font-bold text-gray-900">{order.delivery_address}</p>
                    <Badge variant="outline" className="mt-2 rounded-lg border-gray-100 bg-gray-50 text-gray-500">
                      Zone: {order.zones.name}
                    </Badge>
                  </div>
                </div>
                {order.delivery_lat && (
                   <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-xl gap-2 text-xs font-bold w-full"
                    onClick={openInGoogleMaps}
                   >
                     <Navigation className="w-3 h-3" />
                     Voir sur Maps
                     <ExternalLink className="w-3 h-3 ml-auto opacity-30" />
                   </Button>
                )}
                <div className="flex items-start gap-4 mt-2">
                  <div className="p-2 bg-purple-50 rounded-lg text-purple-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-purple-400 uppercase tracking-tighter">Fenêtre Horaire</p>
                    <p className="font-bold text-gray-900">{order.delivery_window || "Non spécifiée"}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-8 bg-gray-50" />

            {/* Articles Table */}
            <div className="space-y-4">
               <div className="flex items-center gap-2 text-primary font-black uppercase text-xs tracking-widest mb-4">
                <Package className="w-4 h-4" /> Articles Commandés
              </div>
              <div className="rounded-2xl border border-gray-50 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-4 text-left font-black text-gray-400 uppercase text-[10px]">Produit</th>
                      <th className="py-3 px-4 text-center font-black text-gray-400 uppercase text-[10px]">Qté</th>
                      <th className="py-3 px-4 text-right font-black text-gray-400 uppercase text-[10px]">Sous-total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {order.order_items?.map((item) => (
                      <tr key={item.id}>
                        <td className="py-3 px-4">
                          <div className="font-bold text-gray-900">{item.products.name}</div>
                          <div className="text-[10px] text-gray-400 uppercase font-bold">{item.products.sku}</div>
                        </td>
                        <td className="py-3 px-4 text-center font-black">x{item.quantity}</td>
                        <td className="py-3 px-4 text-right font-black">{item.subtotal.toLocaleString()} F</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <Separator className="my-8 bg-gray-50" />

            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="w-5 h-5 text-gray-400" />
                <h4 className="font-black text-gray-900">Notes de commande</h4>
              </div>
              <p className="p-4 bg-gray-50 rounded-2xl text-gray-600 border border-dashed border-gray-200 min-h-[80px] text-sm italic">
                {order.notes || "Aucune note particulière pour cette commande."}
              </p>
            </div>
          </Card>

          {/* Zone SAV / Relances */}
          <Card className="rounded-[2.5rem] border-emerald-100 p-8 shadow-sm bg-emerald-50/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Espace Relance SAV</h3>
              </div>
              {order.last_callback_at && (
                <Badge className="bg-emerald-100 text-emerald-600 border-none font-black text-[10px] uppercase">
                  Dernière relance: {new Date(order.last_callback_at).toLocaleDateString()}
                </Badge>
              )}
            </div>

            <div className="space-y-4">
              <textarea
                className="w-full rounded-2xl border-emerald-100 bg-white p-4 focus:ring-emerald-500 focus:border-emerald-500 text-sm min-h-[100px] shadow-sm"
                placeholder="Ex: Client injoignable après 3 tentatives..."
                value={callbackNote}
                onChange={(e) => setCallbackNote(e.target.value)}
              />
              <Button 
                onClick={handleAddCallback}
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold h-12 gap-2 shadow-lg shadow-emerald-100"
                disabled={!callbackNote || isUpdating}
              >
                Enregistrer la Relance
                {isUpdating && <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />}
              </Button>
            </div>

            {order.callback_notes && (
              <div className="mt-6 p-4 bg-white/50 rounded-2xl border border-emerald-100">
                <p className="text-[10px] font-black text-emerald-400 uppercase mb-2">Historique SAV</p>
                <p className="text-sm text-gray-700">"{order.callback_notes}"</p>
              </div>
            )}
          </Card>
        </div>

        {/* Colonne Droite: Actions & Résumé Financier */}
        <div className="space-y-8">
          <Card className="rounded-[2.5rem] border-gray-100 p-8 shadow-sm bg-gray-50/30">
            <h3 className="text-lg font-black text-gray-900 mb-6 uppercase tracking-wider">État & Actions</h3>
            <div className="grid grid-cols-1 gap-2">
              <p className="text-xs font-black text-gray-400 mb-2 uppercase">Modifier le statut</p>
              {Object.keys(STATUS_CONFIG).map((status) => (
                <Button
                  key={status}
                  variant={order.status === status ? "default" : "outline"}
                  className={cn(
                    "justify-start rounded-xl font-bold h-11 border-gray-200 text-xs",
                    order.status === status && "shadow-md scale-[1.02] bg-gray-900 text-white"
                  )}
                  onClick={() => handleUpdateStatus(status)}
                  disabled={isUpdating}
                >
                  <div className={cn(
                    "w-2 h-2 rounded-full mr-3",
                    order.status === status ? "bg-primary" : "bg-gray-300"
                  )} />
                  {status}
                </Button>
              ))}
            </div>
          </Card>

          <Card className="rounded-[2.5rem] border-orange-100 p-8 shadow-lg shadow-orange-50 bg-white">
            <h3 className="text-lg font-black text-orange-600 mb-6 uppercase tracking-wider">Facturation</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400 font-medium tracking-tight">Articles</span>
                <span className="font-black text-gray-900">{(order.cod_amount - order.delivery_fee).toLocaleString()} F</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400 font-medium tracking-tight">Frais Livraison</span>
                <span className="font-black text-emerald-600">+{order.delivery_fee.toLocaleString()} F</span>
              </div>
              <Separator className="bg-orange-50" />
              <div className="flex flex-col gap-1">
                <span className="text-gray-400 font-black uppercase text-[10px]">Net à percevoir (COD)</span>
                <span className="text-3xl font-black text-primary tracking-tighter">{order.cod_amount.toLocaleString()} <span className="text-xs">FCFA</span></span>
              </div>
              <div className="mt-6 pt-4 border-t border-orange-50 flex items-center gap-2 text-[10px] text-orange-400 font-black uppercase">
                <ShieldCheck className="w-3 h-3" />
                Validé par le système
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
