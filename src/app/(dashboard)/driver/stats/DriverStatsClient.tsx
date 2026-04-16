"use client";

import { 
  Trophy, 
  TrendingUp, 
  Wallet, 
  PackageCheck, 
  AlertCircle, 
  Calendar,
  ChevronRight,
  Target
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface DriverStatsProps {
  initialStats: any[];
}

export function DriverStatsClient({ initialStats }: DriverStatsProps) {
  const currentMonthStats = initialStats[0] || {
    total_delivered: 0,
    total_failed: 0,
    current_commission: 0,
    total_cash_collected: 0
  };

  const deliveryRate = currentMonthStats.total_delivered + currentMonthStats.total_failed > 0
    ? (currentMonthStats.total_delivered / (currentMonthStats.total_delivered + currentMonthStats.total_failed)) * 100
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Hero Stats Agent */}
      <div className="text-center space-y-4 py-4">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-[2.5rem] bg-orange-500 flex items-center justify-center text-white shadow-2xl shadow-orange-200">
            <Trophy className="w-12 h-12" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-xl shadow-lg border border-orange-100">
            <TrendingUp className="w-5 h-5 text-orange-500" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Mes Performances</h1>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-1">
             {format(new Date(), "MMMM yyyy", { locale: fr })}
          </p>
        </div>
      </div>

      {/* Main KPI: Commission */}
      <Card className="rounded-[2.5rem] bg-gray-900 p-8 shadow-2xl shadow-gray-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Wallet className="w-24 h-24 text-white" />
        </div>
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-primary">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Ma Prime Cumulée</span>
          </div>
          <div>
            <span className="text-5xl font-black text-primary tracking-tighter">
              {currentMonthStats.current_commission.toLocaleString()}
            </span>
            <span className="text-xl font-bold text-white ml-2">FCFA</span>
          </div>
          <div className="pt-6 border-t border-white/10 flex justify-between items-center text-xs font-bold text-gray-400">
            <span>Payé à la fin du mois</span>
            <span className="text-white">Statut: En cours</span>
          </div>
        </div>
      </Card>

      {/* Sub KPIs */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-6 rounded-[2rem] border-gray-100 bg-white">
          <PackageCheck className="w-6 h-6 text-emerald-500 mb-4" />
          <div className="text-2xl font-black text-gray-900">{currentMonthStats.total_delivered}</div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Livrées</div>
        </Card>
        <Card className="p-6 rounded-[2rem] border-gray-100 bg-white">
          <AlertCircle className="w-6 h-6 text-red-500 mb-4" />
          <div className="text-2xl font-black text-gray-900">{currentMonthStats.total_failed}</div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Échecs</div>
        </Card>
      </div>

      {/* Success Rate Visual */}
      <Card className="p-8 rounded-[2.5rem] border-gray-100 bg-white shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="font-black text-gray-900 text-sm uppercase">Taux de Réussite</h3>
          </div>
          <Badge className="bg-orange-50 text-orange-600 border-none font-black">{Math.round(deliveryRate)}%</Badge>
        </div>
        <div className="h-4 w-full bg-gray-50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-orange-500 transition-all duration-1000 shadow-inner"
            style={{ width: `${deliveryRate}%` }}
          />
        </div>
        <p className="text-[10px] text-gray-400 font-medium text-center">
          Visez plus de 90% pour débloquer les bonus de palier.
        </p>
      </Card>

      {/* History */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2">Historique des mois</h3>
        <div className="space-y-2">
          {initialStats.slice(1).map((month, i) => (
            <Card key={i} className="p-4 rounded-2xl border-gray-50 bg-white/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-300" />
                <span className="text-sm font-bold text-gray-600 capitalize">
                  {format(new Date(month.performance_month), "MMMM yyyy", { locale: fr })}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-black text-gray-900">{month.current_commission.toLocaleString()} F</span>
                <ChevronRight className="w-4 h-4 text-gray-200" />
              </div>
            </Card>
          ))}
          {initialStats.length <= 1 && (
            <div className="text-center py-8 text-gray-400 text-xs italic">
              Aucun historique disponible
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
