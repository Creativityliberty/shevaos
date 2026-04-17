"use client";

import { useState, useEffect } from "react";
import { 
  Calculator, 
  ShieldCheck, 
  AlertTriangle, 
  History, 
  ArrowRight, 
  CheckCircle2,
  Lock,
  Wallet,
  Loader2,
  MessageSquare
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  getTodaysClosing, 
  submitClosing, 
  getClosingHistory 
} from "@/features/finance/actions/closing-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function ClosingClient() {
  const [currentClosing, setCurrentClosing] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actualAmount, setActualAmount] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [today, lastOnes] = await Promise.all([
        getTodaysClosing(),
        getClosingHistory()
      ]);
      setCurrentClosing(today);
      setHistory(lastOnes);
      if (!today.is_new) {
        setActualAmount(today.actual_amount.toString());
        setNotes(today.notes || "");
      }
    } catch (err: any) {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitClosing({
        actual_amount: parseFloat(actualAmount),
        notes
      });
      toast.success("Clôture enregistrée avec succès");
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="font-black text-gray-400 uppercase text-xs tracking-widest">Audit de la caisse en cours...</p>
      </div>
    );
  }

  const discrepancy = parseFloat(actualAmount || "0") - (currentClosing?.theoretical_amount || 0);
  const isCorrect = discrepancy === 0;

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-100/50">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-[2rem] bg-gray-900 text-white flex items-center justify-center shadow-2xl shadow-gray-200">
            <Lock className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase tracking-widest">Cash <span className="text-primary">Control</span></h1>
            <p className="text-gray-500 font-bold mt-1 uppercase text-xs tracking-[0.2em]">Clôture journalière et certification de caisse</p>
          </div>
        </div>
        <div className="px-8 py-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-end">
           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Session du Jour</span>
           <span className="text-lg font-black text-gray-900">{format(new Date(), "EEEE dd MMMM yyyy", { locale: fr })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Main Control Form */}
        <div className="lg:col-span-8 space-y-8">
           <Card className="p-10 rounded-[3.5rem] bg-white border-gray-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
              
              <div className="flex items-center justify-between mb-10 relative">
                 <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Vérification des <span className="text-primary">Recettes</span></h2>
                 <Badge className={cn(
                   "px-4 py-1.5 rounded-xl font-black text-[10px] uppercase border",
                   currentClosing.status === 'VALIIDÉ' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                   currentClosing.status === 'ÉCART_SIGNALÉ' ? "bg-red-50 text-red-600 border-red-100" :
                   "bg-orange-50 text-orange-600 border-orange-100"
                 )}>
                   {currentClosing.status.replace('_', ' ')}
                 </Badge>
              </div>

              <form onSubmit={handleSubmit} className="space-y-10 relative">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    
                    {/* Theoretical (System) */}
                    <div className="p-10 rounded-[2.5rem] bg-gray-50 border border-gray-100 space-y-6">
                       <div className="flex items-center gap-4 text-gray-400">
                          <Calculator className="w-5 h-5" />
                          <span className="text-xs font-black uppercase tracking-widest">MONTANT THÉORIQUE (SYSTÈME)</span>
                       </div>
                       <div className="space-y-1">
                          <div className="text-4xl font-black text-gray-900 leading-none">
                            {currentClosing.theoretical_amount.toLocaleString()} <span className="text-lg font-bold text-gray-400">F</span>
                          </div>
                          <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-wide">Calculé via Ledger & Flux Vérifiés</p>
                       </div>
                    </div>

                    {/* Actual (Manual Count) */}
                    <div className={cn(
                      "p-10 rounded-[2.5rem] border-4 transition-all space-y-6",
                      isCorrect && actualAmount ? "bg-emerald-50 border-emerald-500" : 
                      !isCorrect && actualAmount ? "bg-red-50 border-red-500" : "bg-white border-primary border-dashed"
                    )}>
                       <div className={cn(
                         "flex items-center gap-4",
                         isCorrect && actualAmount ? "text-emerald-600" : 
                         !isCorrect && actualAmount ? "text-red-600" : "text-primary"
                       )}>
                          <Wallet className="w-5 h-5" />
                          <span className="text-xs font-black uppercase tracking-widest">COMPTÉ PHYSIQUEMENT</span>
                       </div>
                       <div className="relative">
                          <Input 
                            type="number"
                            placeholder="Saisir montant..."
                            className="bg-transparent border-none p-0 text-4xl font-black h-auto focus-visible:ring-0 placeholder:text-gray-200"
                            value={actualAmount}
                            onChange={(e) => setActualAmount(e.target.value)}
                            required
                            disabled={currentClosing.status === 'VALIIDÉ'}
                          />
                       </div>
                    </div>

                 </div>

                 {/* Discrepancy indicator */}
                 {actualAmount && (
                    <div className={cn(
                      "p-8 rounded-[2rem] flex items-center justify-between border-2 transition-all",
                      isCorrect ? "bg-emerald-600 border-emerald-600 text-white" : "bg-red-600 border-red-600 text-white shadow-xl shadow-red-100"
                    )}>
                       <div className="flex items-center gap-5">
                          {isCorrect ? <CheckCircle2 className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8 animate-pulse" />}
                          <div>
                             <h4 className="font-black uppercase tracking-tight text-lg">
                               {isCorrect ? "CAISSE CERTIFIÉE : ÉCART ZÉRO" : `ÉCART DÉTECTÉ : ${discrepancy.toLocaleString()} F`}
                             </h4>
                             <p className="text-white/70 text-xs font-medium uppercase tracking-widest mt-0.5">
                               {isCorrect ? "Les chiffres correspondent parfaitement au flux système." : "Une justification est obligatoire pour valider cette session."}
                             </p>
                          </div>
                       </div>
                    </div>
                 )}

                 <div className="space-y-4">
                    <div className="flex items-center gap-3 text-gray-500 pl-2">
                       <MessageSquare className="w-4 h-4" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Notes & Observations</span>
                    </div>
                    <textarea 
                      placeholder="Commentaires sur la session de caisse..."
                      className="w-full min-h-[120px] rounded-[1.5rem] bg-gray-50 border-gray-100 p-6 font-bold text-gray-900 focus:bg-white transition-all focus:ring-primary focus:border-primary border-2"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      disabled={currentClosing.status === 'VALIIDÉ'}
                    />
                 </div>

                 <Button 
                   type="submit" 
                   disabled={isSubmitting || currentClosing.status === 'VALIIDÉ'} 
                   className="w-full h-20 rounded-[1.5rem] bg-gray-900 text-white font-black text-xl shadow-2xl shadow-gray-200 group transition-all active:scale-95"
                 >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : (
                      <span className="flex items-center gap-4">
                        {currentClosing.status === 'VALIIDÉ' ? "SESSION DÉJÀ CLOTURÉE" : "CERTIFIER ET CLOTURER LA CAISSE"}
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                      </span>
                    )}
                 </Button>
              </form>
           </Card>
        </div>

        {/* History / Sidebar */}
        <div className="lg:col-span-4 space-y-8">
           <div className="flex items-center justify-between px-4">
              <h3 className="font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                <History className="w-5 h-5 text-primary" /> Journal de Bord
              </h3>
              <Badge variant="outline" className="rounded-lg text-[9px] font-black uppercase text-gray-400">30 derniers jours</Badge>
           </div>
           
           <div className="space-y-4">
              {history.map((close) => (
                <Card key={close.id} className="p-6 rounded-[2rem] border-gray-100 bg-white hover:shadow-lg transition-all group border-l-4 border-l-gray-900">
                   <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                          {format(new Date(close.closing_date), "dd MMMM yyyy", { locale: fr })}
                        </p>
                        <p className="text-xl font-black text-gray-900">{close.actual_amount.toLocaleString()} F</p>
                      </div>
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        close.status === 'VALIIDÉ' ? "bg-emerald-50 text-emerald-500" : "bg-red-50 text-red-500"
                      )}>
                        {close.status === 'VALIIDÉ' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                      </div>
                   </div>
                   <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between text-[9px]">
                      <span className="font-black text-gray-400 uppercase">Par {close.operator?.full_name}</span>
                      <span className={cn(
                        "font-black uppercase",
                        close.discrepancy === 0 ? "text-emerald-600" : "text-red-600"
                      )}>
                        Écart: {close.discrepancy > 0 ? '+' : ''}{close.discrepancy} F
                      </span>
                   </div>
                </Card>
              ))}
              {history.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Aucun historique de clôture</p>
                </div>
              )}
           </div>
        </div>

      </div>
    </div>
  );
}
