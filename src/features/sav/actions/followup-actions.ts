"use server";

import { createClient } from "@/lib/supabase/server";

export async function getFollowUps() {
  const supabase = await createClient();
  
  const { data, error } = await supabase.rpc("get_orders_needing_followup");

  if (error) {
    console.error("Error fetching follow-ups:", error);
    return [];
  }

  return data;
}
