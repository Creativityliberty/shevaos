import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DEFAULT_REDIRECTS, UserRole } from "@/core/auth/roles";

export default async function DashboardDispatcher() {
  const supabase = await createClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  const role = profile.role as UserRole;
  const target = DEFAULT_REDIRECTS[role] || "/dashboard";

  // Petite protection pour éviter la boucle infinie si target est /dashboard
  if (target === "/dashboard") {
    // Si le rôle n'a pas de redirection spécifique, on laisse la page normale (mais ici on est dans /dashboard root)
    // On peut par exemple rediriger vers un dashboard par défaut ou afficher une vue CEO
    redirect("/dashboard"); // Next.js gère la redirection vers /dashboard/page.tsx si elle existe
  }

  redirect(target);
}
