"use client";

import { useState } from "react";
import { 
  Users, 
  UserPlus, 
  Search, 
  Wallet, 
  FileText, 
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Briefcase
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function HRPage() {
  const [activeTab, setActiveTab] = useState<'EQUIPE' | 'PAIE'>('EQUIPE');

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-100/50">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-[2.5rem] bg-indigo-600 text-white flex items-center justify-center shadow-2xl shadow-indigo-200">
            <Users className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Capital <span className="text-indigo-600">Humain</span></h1>
            <p className="text-gray-500 font-bold mt-1 uppercase text-xs tracking-[0.2em]">Gestion de l'Équipe & Paie Automatisée</p>
          </div>
        </div>

        <div className="flex p-2 bg-gray-50 rounded-[2rem] border border-gray-100">
          <button 
            onClick={() => setActiveTab('EQUIPE')}
            className={cn(
              "px-8 py-4 rounded-[1.5rem] font-black text-sm transition-all uppercase tracking-widest",
              activeTab === 'EQUIPE' ? "bg-white text-indigo-600 shadow-lg" : "text-gray-400 hover:text-gray-600"
            )}
          >
            L'Équipe
          </button>
          <button 
            onClick={() => setActiveTab('PAIE')}
            className={cn(
              "px-8 py-4 rounded-[1.5rem] font-black text-sm transition-all uppercase tracking-widest",
              activeTab === 'PAIE' ? "bg-white text-indigo-600 shadow-lg" : "text-gray-400 hover:text-gray-600"
            )}
          >
            Paie & Contrats
          </button>
        </div>

        <Button className="h-16 px-8 rounded-[2rem] bg-gray-900 hover:bg-black shadow-xl shadow-gray-200 font-black gap-3 text-lg transition-all active:scale-95">
          <UserPlus className="w-6 h-6" /> NOUVEAU CONTRAT
        </Button>
      </div>

      {activeTab === 'EQUIPE' ? <TeamView /> : <PayrollView />}
    </div>
  );
}

function TeamView() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'EFFECTIF TOTAL', value: '24', icon: Users, color: 'blue' },
          { label: 'SALAIRES DU MOIS', value: '4.2M F', icon: Wallet, color: 'emerald' },
          { label: 'CONTRATS ACTIFS', value: '22', icon: FileText, color: 'indigo' },
        ].map((stat, i) => (
          <Card key={i} className="p-8 rounded-[3rem] border border-gray-100 bg-white transition-all hover:shadow-2xl">
            <div className="flex items-center gap-6">
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center",
                stat.color === 'blue' ? "bg-blue-50 text-blue-600" :
                stat.color === 'emerald' ? "bg-emerald-50 text-emerald-600" :
                "bg-indigo-50 text-indigo-600"
              )}>
                <stat.icon className="w-8 h-8" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-3xl font-black text-gray-900">{stat.value}</h3>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="rounded-[3rem] border border-gray-100 overflow-hidden bg-white shadow-xl shadow-gray-100/50">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Membres du personnel</h2>
          <div className="relative w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Rechercher un membre..." className="h-12 pl-12 rounded-2xl border-none bg-white font-bold" />
          </div>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-50">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Membre</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Rôle & Département</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Statut</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Date d'entrée</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3].map((_, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center font-black text-indigo-600">SM</div>
                      <div>
                        <p className="font-black text-gray-900 uppercase">Sery Marc</p>
                        <p className="text-xs text-gray-400 font-bold">marc.sery@sheva.ci</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-black text-gray-900 flex items-center gap-2">
                       <Briefcase className="w-3.5 h-3.5 text-indigo-400" /> LIVREUR SENIOR
                    </p>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-tight">Operations / Hub 01</p>
                  </td>
                  <td className="px-8 py-6">
                    <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px] px-3 py-1 uppercase tracking-widest">ACTIF</Badge>
                  </td>
                  <td className="px-8 py-6 font-bold text-gray-500 text-sm">12 Jan 2024</td>
                  <td className="px-8 py-6">
                    <Button variant="ghost" size="icon" className="rounded-xl">
                      <MoreVertical className="w-5 h-5 text-gray-400" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function PayrollView() {
  return (
    <div className="space-y-8 py-24 text-center bg-gray-50/50 rounded-[4rem] border-2 border-dashed border-gray-200">
       <Wallet className="w-24 h-24 text-gray-200 mx-auto" />
       <h2 className="text-3xl font-black text-gray-400 uppercase tracking-tight">Configuration de la Paie</h2>
       <p className="text-gray-400 font-bold max-w-md mx-auto uppercase text-xs tracking-widest leading-relaxed">
         Le module de paie automatisée est en cours d'initialisation. Connectez vos comptes trésorerie pour activer les paiements en un clic.
       </p>
       <Button className="h-16 px-10 rounded-[2rem] bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 font-black">
         ACTIVER LE MODULE
       </Button>
    </div>
  );
}
