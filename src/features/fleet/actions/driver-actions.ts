"use server";

import { createClient } from "@/lib/supabase/server";

export async function getDriverStats() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { data, error } = await supabase
    .from("v_driver_performance")
    .select("*")
    .eq("driver_id", user.id)
    .order("performance_month", { ascending: false });

  if (error) {
    console.error("Error fetching driver stats:", error);
    return [];
  }
  return data;
}
