import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Activity, Package, Car, Landmark, ArrowRight, TrendingUp, TrendingDown, ShieldCheck, AlertCircle, ShoppingBag, Headset, Megaphone } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function CeoDashboard() {
  const supabase = await createClient();
  
  // Appeler les RPCs de performance
  const [
    { data: metrics },
    { data: perfReport },
    { data: products },
    { count: openIncidents }
  ] = await Promise.all([
    supabase.rpc("get_dashboard_metrics"),
    supabase.rpc("get_ceo_performance_report", { p_days: 30 }),
    supabase.from("products").select("available_stock, min_stock_level"),
    supabase.from("customer_incidents").select("*", { count: 'exact', head: true }).eq("status", "OUVERT")
  ]);

  const stats = metrics || {
    verified_ca: 0,
    estimated_ca: 0,
    pending_orders: 0,
    success_rate: 0,
    daily_revenue: []
  };

  const health = perfReport || { 
    verified_revenue: 0, 
    other_expenses: 0, 
    marketing_spend: 0,
    net_profit: 0, 
    success_rate: 0,
    order_count: 0,
    roas: 0
  };

  const lowStockCount = products?.filter((p: any) => p.available_stock <= p.min_stock_level).length || 0;

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 px-4 sm:px-0">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">
            Tableau de <span className="text-primary">Bord CEO</span>
          </h1>
          <p className="text-gray-500 font-medium mt-2">
            Vue opérationnelle et financière certifiée (30 derniers jours).
          </p>
        </div>
        <Badge variant="outline" className="rounded-xl px-4 py-2 border-primary/20 bg-primary/5 text-primary font-bold gap-2">
          <ShieldCheck className="w-4 h-4" />
          Finance Certifiée
        </Badge>
      </div>

      {/* KPIs Principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        
        {/* CA Vérifié — LE KPI ROI */}
        <Link href="/finance/deposits">
          <Card className="p-6 rounded-[2.5rem] border-2 border-primary bg-primary/[0.02] hover:shadow-2xl hover:shadow-orange-200 transition-all group cursor-pointer relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/20 transition-colors"></div>
            <div className="flex justify-between items-start relative">
              <div className="w-12 h-12 rounded-2xl bg-primary text-white shadow-lg flex items-center justify-center font-black">CA</div>
              <ArrowRight className="w-5 h-5 text-primary/30 group-hover:text-primary transition-all group-hover:translate-x-1" />
            </div>
            <div className="mt-8 relative text-left">
              <div className="text-xl lg:text-2xl font-black text-gray-900">
                {Number(health.verified_revenue).toLocaleString('fr-FR')} <span className="text-xs font-normal text-gray-400">F</span>
              </div>
              <div className="text-[10px] font-bold text-primary uppercase mt-1 tracking-wider">CA Encaissé</div>
            </div>
          </Card>
        </Link>

        {/* Dépenses Totales */}
        <Link href="/finance/expenses">
          <Card className="p-6 rounded-[2.5rem] border-2 border-red-50 bg-white hover:border-red-500 transition-all group cursor-pointer overflow-hidden h-full">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all">
                <TrendingDown className="w-6 h-6" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-red-500 transition-all group-hover:translate-x-1" />
            </div>
            <div className="mt-8 text-left">
              <div className="text-xl lg:text-2xl font-black text-red-500">
                -{Number(health.other_expenses).toLocaleString('fr-FR')} <span className="text-xs font-normal text-gray-400">F</span>
              </div>
              <div className="text-[10px] font-bold text-gray-500 uppercase mt-1 tracking-wider">Dépenses Opé</div>
            </div>
          </Card>
        </Link>

        {/* Profit Net */}
        <Card className="p-6 rounded-[2.5rem] border-2 border-emerald-500 bg-emerald-500 text-white shadow-xl shadow-emerald-100 hover:scale-[1.02] transition-all relative overflow-hidden h-full text-left">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-xl"></div>
          <div className="flex justify-between items-start relative">
            <div className="w-12 h-12 rounded-2xl bg-white text-emerald-500 flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
            <Badge className="bg-white/20 border-none font-black text-xs uppercase text-white">ROI</Badge>
          </div>
          <div className="mt-8 relative">
            <div className="text-xl lg:text-2xl font-black">
              {Number(health.net_profit).toLocaleString('fr-FR')} <span className="text-xs opacity-70">F</span>
            </div>
            <div className="text-[10px] font-bold uppercase mt-1 tracking-wider opacity-90">Net Réel</div>
          </div>
        </Card>

        {/* CA En attente */}
        <Link href="/finance/deposits">
          <Card className="p-6 rounded-[2.5rem] border-2 border-gray-900 bg-gray-900 group cursor-pointer text-white shadow-xl relative overflow-hidden h-full text-left">
            <div className="flex justify-between items-start relative">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400">
                <Landmark className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-8 relative">
              <div className="text-xl lg:text-2xl font-black text-emerald-400">
                {Number(stats.estimated_ca).toLocaleString('fr-FR')} <span className="text-xs text-gray-400">F</span>
              </div>
              <div className="text-[10px] font-bold text-gray-400 uppercase mt-1 tracking-wider">Collecte en cours</div>
            </div>
          </Card>
        </Link>

        {/* Coût Marketing (CAC) */}
        <Link href="/ads">
          <Card className="p-6 rounded-[2.5rem] border-2 border-indigo-50 bg-white hover:border-indigo-500 transition-all group cursor-pointer overflow-hidden h-full text-left">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all">
                <Megaphone className="w-6 h-6" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 transition-all group-hover:translate-x-1" />
            </div>
            <div className="mt-8">
              <div className="text-xl lg:text-2xl font-black text-indigo-500">
                {Number(health.marketing_spend).toLocaleString()} <span className="text-[10px] font-normal text-gray-400">F</span>
              </div>
              <div className="text-[10px] font-bold text-indigo-500 uppercase mt-1 tracking-wider">ROAS : {health.roas}x</div>
            </div>
          </Card>
        </Link>

        {/* Taux de Livraison */}
        <Card className="p-6 rounded-[2.5rem] border-2 border-gray-100 bg-white hover:shadow-lg transition-all group relative overflow-hidden h-full text-left">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
              <Car className="w-6 h-6" />
            </div>
            <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[10px] uppercase">{Math.round(health.success_rate)}% Succès</Badge>
          </div>
          <div className="mt-8">
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${health.success_rate}%` }}></div>
            </div>
            <div className="text-[10px] font-bold text-gray-400 uppercase mt-4 tracking-wider">Ratio de Réussite</div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 sm:px-0">
        {/* Alertes & Volume */}
        <div className="lg:col-span-1 space-y-6">
          {lowStockCount > 0 && (
            <Link href="/stock/products" className="block">
              <Card className="p-6 rounded-[2.5rem] bg-red-50 border-2 border-red-100 hover:border-red-500 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
                  <Package className="w-20 h-20" />
                </div>
                <div className="flex items-center gap-4 relative">
                  <div className="w-12 h-12 rounded-2xl bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-200">
                    <AlertCircle className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-red-700">{lowStockCount} alertes</div>
                    <div className="text-xs font-bold text-red-500 uppercase tracking-tighter">Ruptures de stock</div>
                  </div>
                </div>
                <ArrowRight className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-red-200 group-hover:text-red-500 transition-all group-hover:translate-x-1" />
              </Card>
            </Link>
          )}

          {(openIncidents || 0) > 0 && (
            <Link href="/sav" className="block">
              <Card className="p-6 rounded-[2.5rem] bg-orange-50 border-2 border-orange-100 hover:border-orange-500 transition-all group relative overflow-hidden">
                <div className="flex items-center gap-4 relative">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-200">
                    <Headset className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-orange-700">{openIncidents} cas SAV</div>
                    <div className="text-xs font-bold text-orange-500 uppercase tracking-tighter">Incidents à traiter</div>
                  </div>
                </div>
                <ArrowRight className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-orange-200 group-hover:text-orange-500 transition-all group-hover:translate-x-1" />
              </Card>
            </Link>
          )}

          <Card className="p-6 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-900 flex items-center justify-center shadow-sm">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-black text-gray-900 leading-none">{health.order_count}</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Commandes (30j)</div>
              </div>
            </div>
          </Card>
        </div>

        <Card className="lg:col-span-2 p-8 rounded-[2.5rem] border-gray-100 shadow-sm bg-white overflow-hidden text-left relative h-full">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">Activité Récente</h3>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full">Evolution Quotidienne</div>
           </div>
           
           <div className="flex items-end justify-between h-48 gap-3">
              {stats.daily_revenue && stats.daily_revenue.length > 0 ? (
                stats.daily_revenue.map((day: any, i: number) => {
                  const maxRevenue = Math.max(...stats.daily_revenue.map((d: any) => d.revenue || 1));
                  const height = (day.revenue / maxRevenue) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-3 group h-full justify-end">
                      <div className="relative w-full flex flex-col justify-end h-full">
                        <div 
                          className="w-full bg-gray-100 group-hover:bg-primary/20 rounded-xl transition-all duration-500"
                          style={{ height: `${Math.max(height, 5)}%` }}
                        ></div>
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-xl whitespace-nowrap z-50 scale-0 group-hover:scale-100">
                          {day.revenue.toLocaleString('fr-FR')} F
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter truncate w-full text-center">
                        {new Date(day.date).toLocaleDateString('fr', { weekday: 'short' })}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 italic text-sm">
                  Pas de données disponibles pour les 7 derniers jours
                </div>
              )}
           </div>
        </Card>
      </div>
    </div>
  );
}
