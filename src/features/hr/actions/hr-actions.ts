"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getContracts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("hr_contracts")
    .select(`
      *,
      user_profiles (full_name, role)
    `)
    .eq("is_active", true);

  if (error) {
    console.error("Error fetching contracts:", error);
    return [];
  }
  return data;
}

export async function getRecentPayrolls() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payrolls")
    .select(`
      *,
      user_profiles (full_name)
    `)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error fetching payrolls:", error);
    return [];
  }
  return data;
}

export async function calculatePayroll(userId: string, month: number, year: number) {
  const supabase = await createClient();
  
  // 1. Récupérer le contrat
  const { data: contract } = await supabase
    .from("hr_contracts")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!contract) throw new Error("Aucun contrat trouvé pour cet utilisateur");

  // 2. Calculer les commissions de livraison (si livreur)
  let deliveryCommissions = 0;
  if (contract.commission_per_delivery > 0) {
    const { count } = await supabase
      .from("deliveries")
      .select("*", { count: 'exact', head: true })
      .eq("driver_id", userId)
      .eq("status", "LIVRÉE");
      // TODO: Filtrer par mois/année via created_at
    
    deliveryCommissions = (count || 0) * contract.commission_per_delivery;
  }

  // 3. Calculer les commissions SAV
  let savCommissions = 0;
  if (contract.commission_per_sav_incident > 0) {
    const { count } = await supabase
      .from("customer_incidents")
      .select("*", { count: 'exact', head: true })
      .eq("handled_by", userId)
      .eq("status", "RESOLVED");
    
    savCommissions = (count || 0) * contract.commission_per_sav_incident;
  }

  // 4. Créer l'entrée de paie
  const { data: payroll, error } = await supabase
    .from("payrolls")
    .insert({
      tenant_id: contract.tenant_id,
      user_id: userId,
      period_month: month,
      period_year: year,
      base_amount: contract.base_salary,
      commissions_amount: deliveryCommissions + savCommissions,
      status: 'PENDING'
    })
    .select()
    .single();

  if (error) throw error;
  
  revalidatePath("/admin/hr");
  return payroll;
}
