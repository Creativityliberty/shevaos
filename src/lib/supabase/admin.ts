import { createClient } from "@supabase/supabase-js";
import { Database } from "../supabase.types";

export function createAdminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Variables d'environnement Admin Supabase manquantes (SUPABASE_SERVICE_ROLE_KEY)");
  }

  // Utilisation de la clé service_role pour bypasser le RLS
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
