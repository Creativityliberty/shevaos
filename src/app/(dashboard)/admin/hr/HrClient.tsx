"use client";

import { useState } from "react";
import { 
  Users, 
  Briefcase, 
  Receipt, 
  Coins, 
  Award, 
  Calendar, 
  Plus, 
  Search, 
  UserPlus, 
  FileText, 
  ArrowUpRight,
  UserCheck,
  CreditCard
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Props {
  initialContracts: any[];
  initialPayrolls: any[];
}

export function HrClient({ initialContracts, initialPayrolls }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [contracts, setContracts] = useState(initialContracts);
  const [payrolls, setPayrolls] = useState(initialPayrolls);

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-24">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-100/50">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-[2rem] bg-emerald-600 text-white flex items-center justify-center shadow-2xl shadow-emerald-100">
            <Users className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Capital <span className="text-emerald-600">Humain</span></h1>
            <p className="text-gray-500 font-bold mt-1 uppercase text-xs tracking-widest">Gestion de l'Équipe & Paie Automatisée</p>
          </div>
        </div>

        <div className="flex gap-4">
          <Button variant="outline" className="h-16 px-8 rounded-[2rem] border-gray-100 font-black gap-3 text-lg hover:bg-gray-50">
            <UserPlus className="w-6 h-6" /> NOUVEAU CONTRAT
          </Button>
          <Button className="h-16 px-8 rounded-[2rem] bg-gray-900 hover:bg-black shadow-xl shadow-gray-200 font-black gap-3 text-lg">
            <Coins className="w-6 h-6" /> GÉNÉRER LA PAIE
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-8 rounded-[2.5rem] bg-white border-gray-100 flex items-center gap-5">
           <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
             <UserCheck className="w-7 h-7" />
           </div>
           <div>
             <div className="text-2xl font-black text-gray-900">{contracts.length}</div>
             <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Effectif Actif</div>
           </div>
        </Card>
        <Card className="p-8 rounded-[2.5rem] bg-white border-gray-100 flex items-center gap-5">
           <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-center">
             <Briefcase className="w-7 h-7" />
           </div>
           <div>
             <div className="text-2xl font-black text-gray-900">{contracts.filter(c => c.user_profiles?.role === 'driver').length}</div>
             <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Logistique (Drivers)</div>
           </div>
        </Card>
        <Card className="p-8 rounded-[2.5rem] bg-white border-gray-100 flex items-center gap-5">
           <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
             <Coins className="w-7 h-7" />
           </div>
           <div>
             <div className="text-2xl font-black text-gray-900">
               {contracts.reduce((acc, curr) => acc + curr.base_salary, 0).toLocaleString()} <span className="text-xs">F</span>
             </div>
             <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Masse Salariale Fixe</div>
           </div>
        </Card>
        <Card className="p-8 rounded-[2.5rem] bg-white border-gray-100 flex items-center gap-5">
           <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
             <Award className="w-7 h-7" />
           </div>
           <div>
             <div className="text-2xl font-black text-gray-900">12%</div>
             <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ratio Commissions</div>
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left: Contracts Management */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-6">
            <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Dossiers Employés</h2>
            <div className="relative w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Rechercher un membre..." 
                className="pl-11 rounded-2xl border-gray-100 bg-white font-bold"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contracts.map((contract) => (
              <Card key={contract.id} className="p-8 rounded-[3rem] border-gray-50 bg-white hover:border-emerald-100 transition-all group overflow-hidden relative">
                <div className="space-y-6 relative z-10">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 font-black text-xl group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
                        {contract.user_profiles?.full_name?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-gray-900 uppercase">{contract.user_profiles?.full_name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[8px] uppercase tracking-widest bg-gray-50 border-gray-100 font-bold px-2 py-0.5">
                            {contract.position}
                          </Badge>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Depuis {format(new Date(contract.start_date), "MMM yyyy", { locale: fr })}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full text-gray-400">
                      <ArrowUpRight className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Salaire de Base</p>
                       <p className="text-sm font-black text-gray-900">{contract.base_salary.toLocaleString()} F</p>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                       <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Commissions</p>
                       <p className="text-sm font-black text-emerald-600">Activées</p>
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                   <Briefcase className="w-24 h-24" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right: Payroll History */}
        <div className="space-y-6">
          <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase px-6">Historique Paie</h2>
          <Card className="p-8 rounded-[3rem] bg-gray-900 text-white relative overflow-hidden shadow-2xl h-full">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <Receipt className="w-32 h-32" />
             </div>

             <div className="space-y-6 relative z-10">
                {payrolls.map((payroll) => (
                  <div key={payroll.id} className="flex justify-between items-center py-4 border-b border-gray-800 last:border-0">
                    <div className="space-y-1">
                      <p className="text-sm font-black uppercase text-gray-100 truncate max-w-[150px]">{payroll.user_profiles?.full_name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{format(new Date(payroll.created_at), "MMMM yyyy", { locale: fr })}</span>
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          payroll.status === 'PAID' ? "bg-emerald-500" : "bg-orange-500"
                        )} />
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-black text-emerald-400">{payroll.net_amount.toLocaleString()} F</p>
                       <Button variant="ghost" className="h-4 p-0 text-[8px] font-black text-gray-500 hover:text-white uppercase tracking-widest">Détails PDF</Button>
                    </div>
                  </div>
                ))}

                {payrolls.length === 0 && (
                   <div className="py-20 text-center space-y-4">
                      <Receipt className="w-12 h-12 text-gray-700 mx-auto" />
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">Aucun bulletin généré</p>
                   </div>
                )}

                <Button className="w-full mt-6 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg transition-all transform hover:scale-[1.02]">
                   GÉRER LES PAIEMENTS
                </Button>
             </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
