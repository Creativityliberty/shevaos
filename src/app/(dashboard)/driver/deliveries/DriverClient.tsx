"use client";

import { useState, useEffect } from "react";
import { Phone, MapPin, CheckCircle2, XCircle, ChevronDown, ChevronUp, Loader2, Play, Navigation, Timer } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { confirmDelivery, reportDeliveryFailure, startDelivery, markArrived } from "@/features/deliveries/actions/delivery-actions";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export function DriverClient({ activeDeliveries, completedDeliveries }: { activeDeliveries: any[], completedDeliveries: any[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<{id: string, action: string} | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [failureReason, setFailureReason] = useState("");
  const [failureDialogOpen, setFailureDialogOpen] = useState(false);
  const [failingDeliveryId, setFailingDeliveryId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleStart = async (deliveryId: string) => {
    setLoadingAction({ id: deliveryId, action: 'start' });
    const res = await startDelivery(deliveryId);
    if (res.success) toast.success(res.message);
    else toast.error(res.message);
    setLoadingAction(null);
  };

  const handleArrival = async (deliveryId: string) => {
    setLoadingAction({ id: deliveryId, action: 'arrive' });
    // Simulation capture GPS simplifié
    const mockGps = "5.3484, -4.0305"; 
    const res = await markArrived(deliveryId, mockGps);
    if (res.success) toast.success(res.message);
    else toast.error(res.message);
    setLoadingAction(null);
  };

  const handleConfirm = async (deliveryId: string, codAmount: number) => {
    setLoadingAction({ id: deliveryId, action: 'confirm' });
    try {
      const res = await confirmDelivery(deliveryId, codAmount);
      if (res.success) {
        toast.success("Livraison Confirmée", { description: "Le cash est comptabilisé." });
        setConfirmingId(null);
      } else {
        toast.error("Erreur", { description: res.error || res.message });
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const handleFail = async () => {
    if (!failingDeliveryId || !failureReason.trim()) return;
    setLoadingAction({ id: failingDeliveryId, action: 'fail' });
    const res = await reportDeliveryFailure(failingDeliveryId, failureReason);
    if (res.success) {
      toast.info("Échec signalé");
      setFailureDialogOpen(false);
      setFailureReason("");
    } else toast.error(res.message);
    setLoadingAction(null);
  };

  return (
    <div className="space-y-8">
      {/* SECTION ACTIVES */}
      <div className="space-y-4 relative z-10">
        {activeDeliveries.length === 0 ? (
          <Card className="p-10 text-center rounded-[2rem] border-dashed text-gray-400">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-bold">Tournée terminée !</p>
          </Card>
        ) : (
          activeDeliveries.map(delivery => {
            const isExpanded = expandedId === delivery.id;
            const order = delivery.orders;
            const customer = order?.customers;
            const isProcessing = loadingAction?.id === delivery.id;

            return (
              <Card key={delivery.id} className={`rounded-3xl border-gray-100 shadow-sm overflow-hidden transition-all ${delivery.status === 'ASSIGNÉE' ? 'opacity-60 bg-gray-50' : 'bg-white'}`}>
                <div className="p-5 cursor-pointer flex justify-between items-center" onClick={() => toggleExpand(delivery.id)}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-inner ${delivery.status === 'ASSIGNÉE' ? 'bg-gray-200 text-gray-400' : 'bg-orange-50 text-primary'}`}>
                      #{order?.order_number.slice(-4)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{customer?.full_name}</h3>
                      <div className="flex items-center gap-2">
                         <p className="text-sm text-gray-500 font-medium">{order?.zones?.name}</p>
                         <Badge variant="outline" className="text-[10px] h-4 uppercase">{delivery.status.replace(/_/g, ' ')}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-black text-gray-900">{order?.cod_amount.toLocaleString()} F</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-300" /> : <ChevronDown className="w-4 h-4 text-gray-300" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-gray-50 bg-gray-50/50">
                    <div className="space-y-4 py-4">
                      <div className="flex gap-3 text-sm text-gray-600">
                        <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
                        <span className="font-medium bg-white p-2 w-full rounded-xl border border-gray-100">{customer?.address || "Aucune adresse"}</span>
                      </div>
                      
                      {delivery.status !== 'ASSIGNÉE' && customer?.phone && (
                        <a href={`tel:${customer.phone}`} className="flex items-center justify-center gap-2 w-full bg-gray-900 text-white p-3 rounded-xl font-bold">
                          <Phone className="w-4 h-4" /> Appeler
                        </a>
                      )}
                    </div>

                    <div className="mt-4">
                      {/* MACHINE À ÉTATS UI */}
                      {delivery.status === 'ASSIGNÉE' && (
                        <div className="p-4 bg-gray-100 rounded-2xl text-center">
                          <p className="text-xs font-bold text-gray-500 uppercase flex items-center justify-center gap-2">
                            <Loader2 className="w-3 h-3 animate-spin"/> En attente de chargement Hub
                          </p>
                        </div>
                      )}

                      {delivery.status === 'CHARGÉE_PAR_HUB' && (
                        <Button className="w-full h-16 rounded-2xl bg-primary font-black text-lg gap-2" onClick={() => handleStart(delivery.id)} disabled={isProcessing}>
                          {isProcessing ? <Loader2 className="animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                          DÉMARRER LA COURSE
                        </Button>
                      )}

                      {delivery.status === 'EN_LIVRAISON' && !delivery.arrived_at && (
                        <Button className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 font-black text-lg gap-2 text-white" onClick={() => handleArrival(delivery.id)} disabled={isProcessing}>
                          {isProcessing ? <Loader2 className="animate-spin" /> : <Navigation className="w-5 h-5" />}
                          MARQUER MON ARRIVÉE
                        </Button>
                      )}

                      {delivery.status === 'EN_LIVRAISON' && delivery.arrived_at && (
                        confirmingId === delivery.id ? (
                          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex flex-col gap-3">
                            <p className="text-sm font-bold text-emerald-800 text-center uppercase tracking-tight">Confirmez encaissement de {order?.cod_amount.toLocaleString()} F ?</p>
                            <div className="grid grid-cols-2 gap-3">
                              <Button variant="outline" className="rounded-xl h-14" onClick={() => setConfirmingId(null)}>Annuler</Button>
                              <Button className="rounded-xl bg-emerald-600 text-white font-black h-14" onClick={() => handleConfirm(delivery.id, order?.cod_amount || 0)} disabled={isProcessing}>OUI, VALIDER</Button>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-3">
                             <Button variant="destructive" className="h-16 rounded-2xl font-bold bg-white text-red-500 border-2 border-red-50" onClick={() => { setFailingDeliveryId(delivery.id); setFailureDialogOpen(true); }} disabled={isProcessing}>Échec</Button>
                             <Button className="h-16 rounded-2xl font-black bg-emerald-600 text-white" onClick={() => setConfirmingId(delivery.id)} disabled={isProcessing}>LIVRÉ & PAYÉ</Button>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* HISTORIQUE */}
      {completedDeliveries.length > 0 && (
        <div className="pt-8 space-y-4">
          <h3 className="text-sm font-black uppercase text-gray-400 tracking-widest">Historique du Jour</h3>
          <div className="space-y-2">
            {completedDeliveries.map(d => (
              <div key={d.id} className="flex justify-between items-center p-3 bg-white border border-gray-50 rounded-2xl opacity-70">
                <div className="flex items-center gap-3">
                  {d.status === 'LIVRÉE' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-red-400" />}
                  <div>
                    <div className="font-bold text-gray-700 text-sm">{d.orders?.customers?.full_name}</div>
                    <div className="text-xs text-gray-400">#{d.orders?.order_number}</div>
                  </div>
                </div>
                <Badge variant="outline" className={d.status === 'LIVRÉE' ? "text-emerald-600 bg-emerald-50 border-none" : "text-red-500 bg-red-50 border-none"}>
                  {d.status === 'LIVRÉE' ? `+${d.orders?.cod_amount.toLocaleString()} F` : d.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <Dialog open={failureDialogOpen} onOpenChange={setFailureDialogOpen}>
          <DialogContent className="rounded-[2rem] border-none sm:max-w-[400px]">
              <DialogHeader><DialogTitle className="text-xl font-black">Signaler un Échec</DialogTitle></DialogHeader>
              <div className="py-4 space-y-4">
                  <Textarea placeholder="Motif de l'échec..." className="min-h-[100px] rounded-2xl bg-gray-50 p-4" value={failureReason} onChange={(e) => setFailureReason(e.target.value)}/>
              </div>
              <DialogFooter className="grid grid-cols-2 gap-3">
                  <Button variant="ghost" onClick={() => setFailureDialogOpen(false)} className="h-12">Annuler</Button>
                  <Button className="h-12 bg-red-500 text-white font-black" onClick={handleFail} disabled={!failureReason.trim() || isProcessing}>
                    {loadingAction?.action === 'fail' ? <Loader2 className="animate-spin" /> : "SIGNALEZ ÉCHEC"}
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}
