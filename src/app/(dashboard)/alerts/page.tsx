import { createClient } from "@/lib/supabase/server";
import { AlertsClient } from "./AlertsClient";

export const dynamic = "force-dynamic";

export default async function AlertsPage() {
  const supabase = await createClient();
  
  const { data: alerts } = await supabase
    .from("alerts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="max-w-5xl mx-auto py-8">
      <AlertsClient initialAlerts={alerts || []} />
    </div>
  );
}
