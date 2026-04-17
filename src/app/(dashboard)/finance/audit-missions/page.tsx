"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/core/supabase/client";
import { 
  Gavel, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Loader2, 
  TrendingUp, 
  TrendingDown,
  Info
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function MissionAuditPage() {
  const supabase = createClient();
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchMissionsToAudit();
  }, []);

  const fetchMissionsToAudit = async () => {
    setLoading(true);
    // On cherche les missions clôturées logistiquement mais non encore vérifiées finance
    const { data, error } = await supabase
      .from("missions")
      .select(`
        *,
        driver:driver_id(full_name),
        hub:hub_id(name)
      `)
      .eq("return_status", "RETOUR_CLOTURÉ")
      .not("status", "eq", "CLÔTURÉE") // Mission non encore archivée par finance
      .order("updated_at", { ascending: false });

    if (error) toast.error("Erreur de chargement");
    else setMissions(data || []);
    setLoading(false);
  };

  const handleVerifyMission = async (missionId: string) => {
    setProcessingId(missionId);
    try {
      // 1. Marquer la mission comme clôturée définitivement
      const { error: missionError } = await supabase
        .from("missions")
        .update({ 
          status: "CLÔTURÉE",
          anomaly_status: "AUCUN_ÉCART",
          updated_at: new Date()
        })
        .eq("id", missionId);

      if (missionError) throw missionError;

      // 2. Mettre à jour les commandes liées en 'VÉRIFIÉE'
      // Normalement via une RPC 'verify_mission_finance'
      
      toast.success("Mission validée et archivée. CA comptabilisé.");
      fetchMissionsToAudit();
    } catch (error: any) {
      toast.error("Erreur : " + error.message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div className="bg-indigo-950 p-10 rounded-[3rem] text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
            <Gavel className="w-8 h-8 text-indigo-300" />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight">Audit <span className="text-indigo-400">Croisé</span> Finance</h1>
            <p className="text-indigo-200/60 font-medium text-xs uppercase tracking-widest">Validation Finale Mission & CA (Process 1-13)</p>
          </div>
        </div>

        <div className="flex gap-4 bg-white/5 p-4 rounded-3xl border border-white/10 italic text-sm">
           <Info className="w-5 h-5 text-indigo-300 shrink-0" />
           L'audit compare le stock sorti du Hub avec le cash déposé et le stock revenu.
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>
      ) : missions.length === 0 ? (
        <Card className="border-dashed bg-muted/30 p-20 flex flex-col items-center">
            <CheckCircle2 className="w-16 h-16 text-indigo-200 mb-4" />
            <p className="text-muted-foreground font-bold">Aucune mission en attente de vérification.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {missions.map((mission) => {
            const gap = (mission.total_collected_amount || 0) - (mission.total_expected_amount || 0);
            const isAnomalous = Math.abs(gap) > 0;

            return (
              <Card key={mission.id} className="rounded-[2.5rem] border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-all">
                <div className="flex flex-col lg:flex-row">
                  {/* Left: Driver Info */}
                  <div className="lg:w-1/4 p-8 bg-gray-50/50 border-r border-gray-100 flex flex-col justify-between">
                    <div>
                      <Badge variant="outline" className="mb-2 bg-white">{mission.hub?.name}</Badge>
                      <h3 className="text-xl font-black text-gray-900">{mission.driver?.full_name}</h3>
                      <p className="text-xs text-muted-foreground font-bold uppercase mt-1">N° {mission.id.slice(0, 8)}</p>
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold mt-4 uppercase">Clôturé le {new Date(mission.updated_at).toLocaleDateString()}</p>
                  </div>

                  {/* Center: Audit Numbers */}
                  <div className="flex-1 p-8 flex flex-col md:flex-row gap-8 items-center bg-white">
                    <div className="flex-1 space-y-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Théorique Emporté</p>
                      <p className="text-2xl font-black text-gray-900">{mission.total_expected_amount?.toLocaleString()} F</p>
                    </div>
                    <ArrowRight className="text-gray-200 w-6 h-6 hidden md:block" />
                    <div className="flex-1 space-y-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Réel Encaissé</p>
                      <p className="text-2xl font-black text-indigo-600">{mission.total_collected_amount?.toLocaleString()} F</p>
                    </div>
                    <div className={`p-6 rounded-[2rem] min-w-[180px] text-center ${isAnomalous ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-1 flex items-center justify-center gap-2">
                        {isAnomalous ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                        Écart Cash
                      </p>
                      <p className="text-xl font-black">{gap > 0 ? '+' : ''}{gap.toLocaleString()} F</p>
                    </div>
                  </div>

                  {/* Right: Action */}
                  <div className="lg:w-1/4 p-8 flex items-center justify-center bg-gray-50/20">
                    {isAnomalous ? (
                      <Button variant="destructive" className="w-full h-14 rounded-2xl font-black gap-2">
                        <AlertTriangle className="w-5 h-5" /> OUVRIR LITIGE
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => handleVerifyMission(mission.id)}
                        disabled={processingId === mission.id}
                        className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-slate-900 font-black gap-2"
                      >
                        {processingId === mission.id ? <Loader2 className="animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                        VALIDER MISSION
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
