"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type IncidentType = 'RETARD' | 'PRODUIT_FRAGILISE' | 'ERREUR_PRIX' | 'ADRESSE_FAUSSE' | 'ECHANGE_DEMANDE' | 'AUTRE';
export type IncidentStatus = 'OUVERT' | 'EN_COURS' | 'RESOLU' | 'ANNULE';

export async function getIncidents() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("customer_incidents")
    .select(`
      *,
      orders:order_id (
        order_number,
        customer:customer_id (
          full_name,
          phone
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching incidents:", error);
    return [];
  }
  return data;
}

export async function createIncident(formData: {
  order_id: string;
  incident_type: IncidentType;
  description: string;
  priority?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  // Get tenant_id
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (!profile?.tenant_id) throw new Error("Profil non trouvé");

  const { error } = await supabase
    .from("customer_incidents")
    .insert({
      tenant_id: profile.tenant_id,
      order_id: formData.order_id,
      incident_type: formData.incident_type,
      description: formData.description,
      priority: formData.priority || "MOYENNE",
      operator_id: user.id
    });

  if (error) throw error;
  
  revalidatePath("/sav");
  return { success: true };
}

export async function updateIncidentStatus(id: string, status: IncidentStatus) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("customer_incidents")
    .update({ status })
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/sav");
  return { success: true };
}
