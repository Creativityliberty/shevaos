"use client";

import { useState } from "react";
import { Phone, MapPin, CheckCircle2, XCircle, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { confirmDelivery, reportDeliveryFailure } from "@/features/deliveries/actions/delivery-actions";
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
  const [loadingAction, setLoadingAction] = useState<{id: string, action: 'confirm'|'fail'} | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [failureReason, setFailureReason] = useState("");
  const [failureDialogOpen, setFailureDialogOpen] = useState(false);
  const [failingDeliveryId, setFailingDeliveryId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
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
    try {
      const res = await reportDeliveryFailure(failingDeliveryId, failureReason);
      if (res.success) {
        toast.info("Échec signalé", { description: "La commande revient au dispatch." });
        setFailureDialogOpen(false);
        setFailureReason("");
        setFailingDeliveryId(null);
      } else {
        toast.error("Erreur", { description: res.error || res.message });
      }
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* SECTION ACTIVES */}
      <div className="space-y-4 relative z-10">
        {activeDeliveries.length === 0 ? (
          <Card className="p-10 text-center rounded-[2rem] border-dashed text-gray-400">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-bold">Tournée terminée !</p>
            <p className="text-sm">Vous n'avez plus de colis.</p>
          </Card>
        ) : (
          activeDeliveries.map(delivery => {
            const isExpanded = expandedId === delivery.id;
            const order = delivery.orders;
            const customer = order?.customers;

            return (
              <Card key={delivery.id} className="rounded-3xl border-gray-100 shadow-sm overflow-hidden transition-all">
                {/* Header cliquable */}
                <div 
                  className="p-5 cursor-pointer bg-white flex justify-between items-center"
                  onClick={() => toggleExpand(delivery.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-primary font-black shadow-inner">
                      #{order?.order_number.slice(-4)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{customer?.full_name}</h3>
                      <p className="text-sm text-gray-500 font-medium">{order?.zones?.name}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-black text-gray-900">{order?.cod_amount.toLocaleString()} F</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-300" /> : <ChevronDown className="w-4 h-4 text-gray-300" />}
                  </div>
                </div>

                {/* Détails déroulés */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-gray-50 bg-gray-50/30">
                    <div className="space-y-4 py-4">
                      {/* Ligne Adresse */}
                      <div className="flex gap-3 text-sm text-gray-600">
                        <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
                        <span className="font-medium bg-white p-2 w-full rounded-xl border border-gray-100">
                          {customer?.address || "Aucune adresse précise"}
                        </span>
                      </div>
                      
                      {/* Bouton Téléphone */}
                      {customer?.phone && (
                        <a href={`tel:${customer.phone}`} className="flex items-center justify-center gap-2 w-full bg-gray-900 text-white p-3 rounded-xl font-bold hover:bg-black transition-colors">
                          <Phone className="w-4 h-4" /> Appeler le {customer.phone}
                        </a>
                      )}
                    </div>

                    {/* Actions de validation */}
                    <div className="mt-4">
                      {confirmingId === delivery.id ? (
                        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex flex-col gap-3 animate-in zoom-in-95 duration-200">
                          <p className="text-sm font-bold text-emerald-800 text-center uppercase tracking-tight">Confirmez l'encaissement de {order?.cod_amount.toLocaleString()} F ?</p>
                          <div className="grid grid-cols-2 gap-3">
                            <Button 
                              variant="outline" 
                              className="rounded-xl border-emerald-200 text-emerald-600 bg-white h-14" 
                              onClick={() => setConfirmingId(null)}
                            >
                               Annuler
                            </Button>
                            <Button 
                              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black h-14"
                              onClick={() => handleConfirm(delivery.id, order?.cod_amount || 0)}
                              disabled={!!loadingAction}
                            >
                              OUI, VALIDER
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                           <Button 
                             variant="destructive"
                             className="h-16 rounded-2xl font-bold bg-white text-red-500 border-2 border-red-50 hover:bg-red-50 transition-all text-base"
                             onClick={(e) => {
                               e.stopPropagation();
                               setFailingDeliveryId(delivery.id);
                               setFailureDialogOpen(true);
                             }}
                             disabled={!!loadingAction}
                           >
                             Échec
                           </Button>
                           <Button 
                             className="h-16 rounded-2xl font-black shadow-xl shadow-emerald-100 bg-emerald-600 hover:bg-emerald-700 text-white text-base transform active:scale-95 transition-all"
                             onClick={(e) => {
                                e.stopPropagation();
                                setConfirmingId(delivery.id);
                             }}
                             disabled={!!loadingAction}
                           >
                             LIVRÉ & PAYÉ
                           </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* SECTION HISTORIQUE JOUR */}
      {completedDeliveries.length > 0 && (
        <div className="pt-8 space-y-4">
          <h3 className="text-sm font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
            Historique du Jour
          </h3>
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
                {d.status === 'LIVRÉE' && (
                  <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-none font-bold">
                     +{d.orders?.cod_amount.toLocaleString()} F
                  </Badge>
                )}
                {d.status !== 'LIVRÉE' && (
                   <Badge variant="outline" className="text-red-500 bg-red-50 border-none font-bold text-[10px]">
                     {d.status}
                   </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* DIALOG ECHEC */}
      <Dialog open={failureDialogOpen} onOpenChange={setFailureDialogOpen}>
          <DialogContent className="rounded-[2rem] border-none sm:max-w-[400px]">
              <DialogHeader>
                  <DialogTitle className="text-xl font-black flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-xl text-red-600">
                          <XCircle className="w-6 h-6" />
                      </div>
                      Signaler un Échec
                  </DialogTitle>
              </DialogHeader>
              <div className="py-4 space-y-4">
                  <p className="text-sm font-medium text-gray-500 italic">Pourquoi cette livraison a-t-elle échoué ? (Inexistant, client absent, refusé...)</p>
                  <Textarea 
                    placeholder="Ex: Client ne décroche pas après 3 appels..."
                    className="min-h-[100px] rounded-2xl border-gray-100 bg-gray-50 p-4 font-medium focus:ring-red-500"
                    value={failureReason}
                    onChange={(e) => setFailureReason(e.target.value)}
                  />
              </div>
              <DialogFooter className="grid grid-cols-2 gap-3">
                  <Button variant="ghost" onClick={() => setFailureDialogOpen(false)} className="rounded-xl h-12 font-bold">Annuler</Button>
                  <Button 
                    className="rounded-xl h-12 bg-red-500 hover:bg-red-600 text-white font-black"
                    onClick={handleFail}
                    disabled={!failureReason.trim() || !!loadingAction}
                  >
                    {loadingAction?.action === 'fail' ? <Loader2 className="animate-spin" /> : "SIGNALEZ ÉCHEC"}
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}
