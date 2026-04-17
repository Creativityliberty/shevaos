"use client";

import { useState } from "react";
import { 
  AlertOctagon, 
  ShieldAlert, 
  CheckCircle2, 
  Gavel, 
  Ban,
  Search,
  Filter,
  DollarSign,
  Package,
  FileSearch,
  ArrowRight
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function TreasuryDisputesPage() {
  const [activeTab, setActiveTab] = useState<'OUVERT' | 'RESOLU'>('OUVERT');

  const disputes = [
    {
      id: "LIT-001",
      mission: "MISS-4592",
      driver: "Jean Lamine",
      type: "ÉCART_ARGENT",
      gap: "-2,500 F",
      severity: "CRITIQUE",
      date: "17 Avril 2026",
      status: "LITIGE_OUVERT"
    },
    {
      id: "LIT-002",
      mission: "MISS-4601",
      driver: "Sery Marc",
      type: "ÉCART_STOCK",
      gap: "2 articles",
      severity: "MOYEN",
      date: "16 Avril 2026",
      status: "LITIGE_OUVERT"
    },
    {
      id: "LIT-003",
      mission: "MISS-4588",
      driver: "Koffi Paul",
      type: "ÉCART_MIXTE",
      gap: "-1,000 F / 1 art",
      severity: "HAUT",
      date: "15 Avril 2026",
      status: "LITIGE_OUVERT"
    }
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-24">
      {/* Header Finance Litiges */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gray-900 p-10 rounded-[3rem] text-white shadow-2xl shadow-indigo-100">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-[2.5rem] bg-red-600 text-white flex items-center justify-center shadow-xl shadow-red-900/40">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight uppercase">Litiges <span className="text-red-600">Financiers</span></h1>
            <p className="text-gray-400 font-bold mt-1 uppercase text-xs tracking-[0.2em]">Traitement des Écarts & Audit Mission (P2-5)</p>
          </div>
        </div>

        <div className="flex p-2 bg-white/5 rounded-[2.2rem] border border-white/10 backdrop-blur-xl">
          <button 
            onClick={() => setActiveTab('OUVERT')}
            className={cn(
              "px-8 py-4 rounded-[1.6rem] font-black text-sm transition-all uppercase tracking-widest",
              activeTab === 'OUVERT' ? "bg-red-600 text-white shadow-lg" : "text-gray-400 hover:text-gray-200"
            )}
          >
            Ouverts ({disputes.length})
          </button>
          <button 
            onClick={() => setActiveTab('RESOLU')}
            className={cn(
              "px-8 py-4 rounded-[1.6rem] font-black text-sm transition-all uppercase tracking-widest",
              activeTab === 'RESOLU' ? "bg-emerald-600 text-white shadow-lg" : "text-gray-400 hover:text-gray-200"
            )}
          >
            Résolus (142)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {disputes.map((dispute) => (
          <Card key={dispute.id} className="p-10 rounded-[3.5rem] bg-white border border-gray-100 shadow-xl shadow-gray-100/50 hover:shadow-2xl transition-all">
            <div className="flex flex-col lg:flex-row gap-10 items-start lg:items-center justify-between">
               <div className="flex items-start gap-8 flex-1">
                 <div className={cn(
                   "w-20 h-20 rounded-[2rem] flex items-center justify-center shrink-0",
                   dispute.type === 'ÉCART_ARGENT' ? "bg-red-50 text-red-600" :
                   dispute.type === 'ÉCART_STOCK' ? "bg-orange-50 text-orange-600" :
                   "bg-amber-50 text-amber-600"
                 )}>
                   {dispute.type === 'ÉCART_ARGENT' ? <DollarSign className="w-10 h-10" /> : <Package className="w-10 h-10" />}
                 </div>

                 <div className="space-y-3">
                    <div className="flex items-center gap-3">
                       <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{dispute.id} • {dispute.date}</span>
                       <Badge className={cn(
                         "border-none font-black text-[10px] px-3 py-1 uppercase tracking-widest",
                         dispute.severity === 'CRITIQUE' ? "bg-red-600 text-white" : "bg-orange-500 text-white"
                       )}>
                         {dispute.severity}
                       </Badge>
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 uppercase">
                      Mission <span className="text-indigo-600">{dispute.mission}</span> — {dispute.driver}
                    </h2>
                    <div className="flex items-center gap-4 text-sm font-bold text-gray-500">
                       <p className="flex items-center gap-2 uppercase tracking-tight">
                         <span className="text-gray-900 font-black">TYPE:</span> {dispute.type.replace('_', ' ')}
                       </p>
                       <p className="flex items-center gap-2 uppercase tracking-tight">
                         <span className="text-gray-900 font-black">ÉCART:</span> <span className="text-red-600">{dispute.gap}</span>
                       </p>
                    </div>
                 </div>
               </div>

               <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                  <Button 
                    className="h-16 px-8 rounded-3xl bg-gray-900 hover:bg-black font-black uppercase text-xs tracking-widest gap-3"
                    onClick={() => toast.info("Dossier d'audit ouvert")}
                  >
                    <FileSearch className="w-5 h-5 text-primary" /> EXAMINER
                  </Button>
                  <Button 
                    className="h-16 px-8 rounded-3xl bg-red-50 hover:bg-red-100 text-red-600 font-black uppercase text-xs tracking-widest gap-3"
                  >
                    <Ban className="w-5 h-5" /> SUSPENDRE LIVREUR
                  </Button>
                  <Button 
                    className="h-16 px-8 rounded-3xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-100"
                  >
                    <CheckCircle2 className="w-5 h-5" /> RÉSOUDRE
                  </Button>
               </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
