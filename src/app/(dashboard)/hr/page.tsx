"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Users, 
  Banknote, 
  FileText, 
  TrendingUp, 
  Clock, 
  CreditCard,
  Plus,
  Loader2,
  ChevronRight,
  UserCheck
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function HrPayrollPage() {
  const supabase = createClient();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHrData();
  }, []);

  const fetchHrData = async () => {
    setLoading(true);
    // Simulation récupération des employés et de l'état de leur paie
    const { data: profiles } = await supabase
      .from("user_profiles")
      .select("*")
      .order("full_name");
      
    setEmployees(profiles || [
      { id: 1, full_name: "Jean Lamine", role: "DRIVER", salary: "150 000", status: "ACTIF", current_payroll: "165 500" },
      { id: 2, full_name: "Sery Marc", role: "DRIVER", salary: "150 000", status: "ACTIF", current_payroll: "148 000" },
      { id: 3, full_name: "Koffi Paul", role: "DISPATCHER", salary: "250 000", status: "ACTIF", current_payroll: "250 000" },
    ]);
    setLoading(false);
  };

  return (
    <div className="p-6 lg:p-10 space-y-10 animate-in fade-in duration-500 pb-24">
      {/* Premium Header */}
      <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-100/50 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-[2.5rem] bg-indigo-600 text-white flex items-center justify-center shadow-2xl shadow-indigo-100">
            <Users className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Capital <span className="text-indigo-600">Humain</span></h1>
            <p className="text-gray-500 font-bold mt-1 uppercase text-xs tracking-[0.2em]">Pilotage de l'Équipe & Paie Automatisée (P2-4)</p>
          </div>
        </div>

        <div className="flex gap-4">
           <Button className="h-16 px-8 rounded-3xl bg-gray-900 hover:bg-black font-black uppercase text-xs tracking-widest gap-2">
             <Plus className="w-5 h-5 text-indigo-400" /> NOUVEAU CONTRAT
           </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: "Masse Salariale", value: "3 450 000 F", icon: Banknote, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Effectif Total", value: "14 Agents", icon: UserCheck, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Paiement Prévu", value: "25 Avril", icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
        ].map((kpi, i) => (
          <Card key={i} className="p-8 rounded-[2.5rem] border-none shadow-xl shadow-gray-100/30 flex items-center gap-6 group hover:translate-y-[-4px] transition-all">
            <div className={`w-16 h-16 rounded-[1.5rem] ${kpi.bg} ${kpi.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <kpi.icon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{kpi.label}</p>
              <p className="text-2xl font-black text-gray-900 leading-none">{kpi.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Employee List / Payroll Table */}
      <Card className="rounded-[3rem] border-none shadow-2xl shadow-gray-100/50 overflow-hidden bg-white">
        <div className="p-10 border-b border-gray-50 flex items-center justify-between">
           <div className="space-y-1">
             <h2 className="text-xl font-black text-gray-900 uppercase">Liste du Personnel & Paie</h2>
             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Calcul automatique basé sur les missions validées</p>
           </div>
           <Badge className="bg-indigo-50 text-indigo-600 border-none font-black text-[10px] px-6 py-2 rounded-full uppercase">Période : Avril 2026</Badge>
        </div>

        {loading ? (
          <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/30">
                  <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Collaborateur</th>
                  <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Rôle / Statut</th>
                  <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Base Contrat</th>
                  <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-indigo-600">Calcul Ce Mois</th>
                  <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {employees.map((emp) => (
                  <tr key={emp.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-10 py-8">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center font-black text-gray-400 italic">
                             {emp.full_name?.[0]}
                          </div>
                          <div>
                             <p className="font-black text-gray-900 uppercase">{emp.full_name}</p>
                             <p className="text-[10px] font-bold text-gray-400 uppercase">ID: EMP-{emp.id}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-10 py-8">
                       <div className="space-y-2">
                          <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-none font-bold text-[10px] uppercase">{emp.role}</Badge>
                          <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                             {emp.status}
                          </div>
                       </div>
                    </td>
                    <td className="px-10 py-8">
                       <p className="font-black text-gray-900">{emp.salary} F</p>
                    </td>
                    <td className="px-10 py-8">
                       <div className="flex items-center gap-2">
                          <p className="text-xl font-black text-indigo-600">{emp.current_payroll} F</p>
                          {Number(emp.current_payroll.replace(/\s/g, '')) > Number(emp.salary.replace(/\s/g, '')) ? (
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                          ) : Number(emp.current_payroll.replace(/\s/g, '')) < Number(emp.salary.replace(/\s/g, '')) ? (
                            <div className="text-[10px] font-black p-1 bg-red-100 text-red-600 rounded">MALUS</div>
                          ) : null}
                       </div>
                    </td>
                    <td className="px-10 py-8">
                       <Button variant="ghost" className="h-12 w-12 rounded-2xl hover:bg-indigo-50 group/btn">
                          <FileText className="w-5 h-5 text-gray-400 group-hover/btn:text-indigo-600" />
                       </Button>
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
