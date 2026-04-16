"use server";

import { createClient } from "@/lib/supabase/server";

export async function getImports() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("import_purchases")
    .select(`
      *,
      suppliers (name),
      transit_agents (name)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching imports:", error);
    return [];
  }
  return data;
}

export async function createImport(params: {
  supplier_id: string;
  transite_agent_id: string;
  description: string;
  tracking_number: string;
  item_cost: number;
  freight_cost: number;
  customs_cost: number;
  purchase_date: string;
  eta: string;
}) {
  const supabase = await createClient();
  
  // Get tenant_id from user profile
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("user_profiles").select("tenant_id").eq("id", user?.id).single();

  const { data, error } = await supabase
    .from("import_purchases")
    .insert({
      ...params,
      tenant_id: profile?.tenant_id,
      status: 'COMMANDÉ'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSuppliersAndTransites() {
  const supabase = await createClient();
  const [suppliers, transitAgents] = await Promise.all([
    supabase.from("suppliers").select("id, name"),
    supabase.from("transit_agents").select("id, name")
  ]);

  return {
    suppliers: suppliers.data || [],
    transitAgents: transitAgents.data || []
  };
}
