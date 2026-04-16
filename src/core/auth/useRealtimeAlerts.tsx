"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { AlertCircle, TrendingDown, Package } from "lucide-react";
import { useRouter } from "next/navigation";

export function useRealtimeAlerts() {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    // S'abonner aux nouvelles insertions dans la table 'alerts'
    const channel = supabase
      .channel("realtime_alerts")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "alerts",
        },
        (payload) => {
          const newAlert = payload.new;
          
          // Personnalisation du toast selon la sévérité et le type
          const icon = newAlert.severity === "CRITICAL" ? AlertCircle : Package;
          const bgColor = newAlert.severity === "CRITICAL" ? "border-red-500" : "border-orange-500";
          
          toast(newAlert.title, {
            description: newAlert.message,
            duration: 8000,
            icon: <div className="p-1 bg-red-100 rounded-full text-red-600"><AlertCircle className="w-4 h-4" /></div>,
            action: {
              label: "Voir",
              onClick: () => router.push("/finance/deposits"),
            },
          });
          
          // Rafraîchir les données de la page actuelle si nécessaire
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router]);
}
