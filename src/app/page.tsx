import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function IndexPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  // Récupérer le rôle pour redirection intelligente
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  // Logique de redirection par rôle
  switch (profile.role) {
    case 'driver':
      redirect("/driver/deliveries");
      break;
    case 'dispatcher':
    case 'ops_manager':
      redirect("/dispatch");
      break;
    case 'sav_agent':
    case 'sav_manager':
      redirect("/orders");
      break;
    case 'finance':
      redirect("/finance/deposits");
      break;
    case 'achats':
    case 'stock_manager':
      redirect("/stock/inventory");
      break;
    default:
      redirect("/dashboard");
      break;
  }
}
