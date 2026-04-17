"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/core/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Truck, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function HubLoadingPage() {
  const supabase = createClient();
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingMissions();
  }, []);

  const fetchPendingMissions = async () => {
    setLoading(true);
    // On cherche les missions assignées non encore chargées
    const { data, error } = await supabase
      .from("missions")
      .select(`
        *,
        driver:driver_id(full_name),
        hub:hub_id(name)
      `)
      .in("status", ["ASSIGNÉE", "EN_ATTENTE_CHARGEMENT"])
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erreur lors du chargement des missions");
    } else {
      setMissions(data || []);
    }
    setLoading(false);
  };

  const handleValidateLoading = async (missionId: string) => {
    setProcessingId(missionId);
    try {
      // 1. Passage de la mission en 'CHARGÉE'
      const { error: missionError } = await supabase
        .from("missions")
        .update({ status: "CHARGÉE", updated_at: new Date() })
        .eq("id", missionId);

      if (missionError) throw missionError;

      // 2. Récupération des livraisons liées à cette mission pour mettre à jour les commandes
      // Note: Dans une version plus complexe, nous aurions une table de liaison mission_orders.
      // Ici, on suppose que les livraisons du livreur créées aujourd'hui font partie de la mission.
      // Pour être conforme P1-8.6, nous devrions avoir une RPC 'validate_hub_loading'
      
      toast.success("Mission chargée avec succès. Le livreur peut démarrer.");
      fetchPendingMissions();
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
            <Package className="w-6 h-6 text-blue-500" />
            Sas du Hub : Chargement Matin
          </h1>
          <p className="text-muted-foreground">Validez le stock emporté par les livreurs avant leur départ.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : missions.length === 0 ? (
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
            <Package className="w-12 h-12 mb-4 opacity-20" />
            <p>Aucune mission en attente de chargement pour le moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {missions.map((mission) => (
            <Card key={mission.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                    {mission.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(mission.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <CardTitle className="text-lg flex items-center gap-2 pt-2">
                  <Truck className="w-4 h-4" />
                  {mission.driver?.full_name || "Livreur inconnu"}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{mission.hub?.name}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-secondary/30 p-3 rounded-lg flex justify-between items-center">
                  <span className="text-sm">Total à collecter</span>
                  <span className="font-bold">{mission.total_expected_amount?.toLocaleString()} F</span>
                </div>
                
                <Button 
                  className="w-full gap-2" 
                  disabled={processingId === mission.id}
                  onClick={() => handleValidateLoading(mission.id)}
                >
                  {processingId === mission.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Confirmer le Chargement
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
