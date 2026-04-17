"use client";

import { useState, useEffect } from "react";
import { 
  History, 
  RotateCcw, 
  PhoneCall, 
  XCircle, 
  AlertTriangle,
  Search,
  Calendar,
  Loader2,
  Clock,
  Trash2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { logCallAttempt, scheduleRecall, confirmFromSav } from "@/features/orders/actions/crm-actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function SavPostTerrainPage() {
  const supabase = createClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSavQueue();
  }, []);

  const fetchSavQueue = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*, customers(*), zones(name)")
      .in("status", ["ECHEC_LIVRAISON", "REPROGRAMMÉE", "BROUILLON"])
      .order("updated_at", { ascending: false });

    if (error) toast.error("Erreur de chargement");
    else setOrders(data || []);
    setLoading(false);
  };

  const handleCall = async (orderId: string) => {
    setProcessingId(orderId);
    const res = await logCallAttempt(orderId, "Tentative SAV");
    if (res.success) {
      toast.success(res.message);
      fetchSavQueue();
    } else toast.error(res.message);
    setProcessingId(null);
  };

  const handleRecall = async (orderId: string, type: 'morning' | 'noon' | 'evening') => {
    const now = new Date();
    let recallDate = new Date();
    
    if (type === 'morning') recallDate.setHours(9, 0, 0, 0);
    else if (type === 'noon') recallDate.setHours(13, 0, 0, 0);
    else recallDate.setHours(17, 0, 0, 0);

    // Si l'heure est passée, on met à demain
    if (recallDate < now) recallDate.setDate(recallDate.getDate() + 1);

    const res = await scheduleRecall(orderId, recallDate);
    if (res.success) {
      toast.success(`Rappel programmé pour ${type === 'morning' ? 'demain matin' : type === 'noon' ? 'ce midi' : 'ce soir'}`);
      fetchSavQueue();
    } else toast.error(res.message);
  };

  const handleConfirm = async (orderId: string) => {
    setProcessingId(orderId);
    const res = await confirmFromSav(orderId);
    if (res.success) {
      toast.success(res.message);
      fetchSavQueue();
    } else toast.error(res.message);
    setProcessingId(null);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-24">
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-100/50">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-[2.5rem] bg-orange-600 text-white flex items-center justify-center shadow-2xl shadow-orange-200">
            <History className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Suivi <span className="text-orange-600">Post-Terrain</span></h1>
            <p className="text-gray-500 font-bold mt-1 uppercase text-xs tracking-[0.2em]">Pilotage CRM & Relances (Process 1-6)</p>
          </div>
        </div>

        <div className="flex gap-4">
           <div className="px-6 py-4 bg-orange-50 rounded-2xl border border-orange-100 text-center">
              <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest leading-none mb-1">Dossiers Actifs</p>
              <p className="text-2xl font-black text-orange-600 leading-none">{orders.length}</p>
           </div>
        </div>
      </div>

      <Card className="rounded-[3.5rem] border border-gray-100 overflow-hidden bg-white shadow-2xl shadow-gray-100/50">
        <div className="p-10 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-50/20">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">File d'attente SAV</h2>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Traitez les rappels avant le prochain départ dispatch</p>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input 
              placeholder="Rechercher..." 
              className="h-14 pl-16 rounded-2xl border-none bg-white font-bold shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-orange-600" /></div>
        ) : (
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white">
                  <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">Client</th>
                  <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">Statut / Motif</th>
                  <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">Tentatives</th>
                  <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">CRM Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="group hover:bg-gray-50/50 transition-all border-b border-gray-50">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center font-black text-orange-600 text-lg">
                          {order.customers?.full_name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 uppercase text-lg">{order.customers?.full_name}</p>
                          <p className="text-xs text-gray-400 font-bold uppercase">{order.customers?.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                       <Badge className="bg-orange-50 text-orange-600 border-none font-black text-[10px] px-3 py-1 uppercase">{order.status}</Badge>
                       {order.next_recall_at && (
                         <div className="flex items-center gap-1 mt-2 text-indigo-500 font-bold text-[10px]">
                           <Clock className="w-3 h-3" /> Rappel : {new Date(order.next_recall_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                         </div>
                       )}
                    </td>
                    <td className="px-10 py-8 text-center">
                       <div className="font-black text-xl text-gray-900">{order.attempt_count || 0} <span className="text-gray-300 text-xs">/ 3</span></div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleCall(order.id)} 
                          className="h-12 w-12 rounded-xl bg-blue-600 hover:bg-blue-700 p-0"
                          disabled={processingId === order.id}
                        >
                          <PhoneCall className="w-5 h-5 text-white" />
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-12 px-4 rounded-xl border-gray-200 font-bold gap-2">
                              <Calendar className="w-4 h-4" /> RAPPEL
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl border-none shadow-2xl p-2">
                            <DropdownMenuItem onClick={() => handleRecall(order.id, 'morning')} className="rounded-lg h-10 font-bold">Matin (09h)</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRecall(order.id, 'noon')} className="rounded-lg h-10 font-bold">Midi (13h)</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRecall(order.id, 'evening')} className="rounded-lg h-10 font-bold">Soir (17h)</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <Button 
                          onClick={() => handleConfirm(order.id)}
                          className="h-12 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-black"
                          disabled={processingId === order.id}
                        >
                          CONFIRMER
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
