"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getZones() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("zones")
    .select(`
      *,
      hubs (name)
    `)
    .order("name");

  if (error) throw new Error(error.message);
  return data;
}

export async function createZone(formData: {
  name: string;
  delivery_fee: number;
  hub_id?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (!profile) throw new Error("Profil introuvable");

  const { error } = await supabase
    .from("zones")
    .insert([{
      ...formData,
      tenant_id: profile.tenant_id
    }]);

  if (error) throw new Error(error.message);
  revalidatePath("/settings");
  return { success: true };
}

export async function updateZone(id: string, formData: {
  name: string;
  delivery_fee: number;
  hub_id?: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("zones")
    .update(formData)
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/settings");
  return { success: true };
}

export async function deleteZone(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("zones")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/settings");
  return { success: true };
}
