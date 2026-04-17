"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Truck, AlertTriangle, CheckCircle, Loader2, Archive } from "lucide-react";
import { toast } from "sonner";

export default function HubReturnsPage() {
  const supabase = createClient();
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchActiveReturns();
  }, []);

  const fetchActiveReturns = async () => {
    setLoading(true);
    // On cherche les missions EN_COURS ou en attente de retour soir
    const { data, error } = await supabase
      .from("missions")
      .select(`
        *,
        driver:driver_id(full_name),
        hub:hub_id(name)
      `)
      .in("return_status", ["EN_ATTENTE_RETOUR_SOIR", "RETOUR_REÇU_HUB"])
      .order("updated_at", { ascending: false });

    if (error) {
      toast.error("Erreur lors du chargement des retours");
    } else {
      setMissions(data || []);
    }
    setLoading(false);
  };

  const handleProcessReturn = async (missionId: string, status: "RETOUR_CONTRÔLÉ" | "RETOUR_CLOTURÉ" | "RETOUR_REÇU_HUB") => {
    setProcessingId(missionId);
    try {
      const { error } = await supabase
        .from("missions")
        .update({ 
          return_status: status,
          updated_at: new Date()
        })
        .eq("id", missionId);

      if (error) throw error;

      toast.success(status === "RETOUR_CLOTURÉ" 
        ? "Mission de stock clôturée avec succès." 
        : "Retour réceptionné, en attente de contrôle.");
      fetchActiveReturns();
    } catch (error: any) {
      toast.error("Erreur : " + error.message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <RotateCcw className="w-6 h-6 text-orange-500" />
            Réception Retours Soir
          </h1>
          <p className="text-muted-foreground">Réintégrez les articles non livrés et gérez les anomalies de stock.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : missions.length === 0 ? (
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
            <Archive className="w-12 h-12 mb-4 opacity-20" />
            <p>Aucun livreur n'est actuellement en attente de retour soir.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {missions.map((mission) => (
            <Card key={mission.id} className="hover:shadow-md transition-shadow border-orange-500/20">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className={
                    mission.return_status === "RETOUR_REÇU_HUB" 
                    ? "bg-green-500/10 text-green-500 border-green-500/20"
                    : "bg-orange-500/10 text-orange-500 border-orange-500/20"
                  }>
                    {mission.return_status.replace(/_/g, " ")}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(mission.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <CardTitle className="text-lg flex items-center gap-2 pt-2">
                  <Truck className="w-4 h-4" />
                  {mission.driver?.full_name || "Livreur inconnu"}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{mission.hub?.name}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm italic">
                    <span>État Anomalie</span>
                    <Badge variant={mission.anomaly_status === "AUCUN_ÉCART" ? "secondary" : "destructive"} className="text-[10px] h-4">
                      {mission.anomaly_status}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {mission.return_status === "EN_ATTENTE_RETOUR_SOIR" ? (
                    <Button 
                      className="w-full bg-orange-600 hover:bg-orange-700"
                      disabled={processingId === mission.id}
                      onClick={() => handleProcessReturn(mission.id, "RETOUR_REÇU_HUB")}
                    >
                      Marquer Présent au Hub
                    </Button>
                  ) : (
                    <Button 
                      className="w-full"
                      disabled={processingId === mission.id}
                      onClick={() => handleProcessReturn(mission.id, "RETOUR_CLOTURÉ")}
                    >
                      Clôturer le Stock
                    </Button>
                  )}
                </div>

                <Button variant="outline" className="w-full gap-2 border-dashed text-xs text-muted-foreground h-8">
                  <AlertTriangle className="w-3 h-3" />
                  Signaler un article endommagé
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
