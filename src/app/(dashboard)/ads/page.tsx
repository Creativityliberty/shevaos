import { createClient } from "@/lib/supabase/server";
import { AdsClient } from "./AdsClient";

export const dynamic = "force-dynamic";

export default async function AdsPage() {
  const supabase = await createClient();
  const { data: campaigns } = await supabase
    .from("ads_campaigns")
    .select("*")
    .order("created_at", { ascending: false });

  // Récupérer aussi l'impact sur le CA via une jointure ou une vue
  // Pour l'instant, passons les campagnes
  return (
    <div className="max-w-[1200px] mx-auto py-8 px-4">
      <AdsClient initialCampaigns={campaigns || []} />
    </div>
  );
}
