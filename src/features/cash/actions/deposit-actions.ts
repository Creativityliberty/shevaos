"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// 1. Récupérer les livreurs qui ont du cash "flottant"
export async function getDriversWithPendingCash() {
  const supabase = await createClient();

  // On cherche toutes les cash_collections qui n'ont pas encore été déposées et non libérées
  const { data, error } = await supabase
    .from("cash_collections")
    .select(`
      id,
      amount,
      driver_id,
      delivery_id,
      created_at,
      user_profiles!cash_collections_driver_id_fkey (full_name, phone)
    `)
    .is("deposit_id", null);

  if (error) {
    throw new Error(error.message);
  }

  // Grouper par chauffeur
  const grouped: Record<string, { driverId: string, driver: any, total: number, collections: string[] }> = {};
  
  data.forEach(coll => {
    if (!grouped[coll.driver_id]) {
        grouped[coll.driver_id] = { driverId: coll.driver_id, driver: (coll as any).user_profiles, total: 0, collections: [] };
    }
    grouped[coll.driver_id].total += coll.amount;
    grouped[coll.driver_id].collections.push(coll.id);
  });

  return Object.values(grouped);
}

// 2. Le Hub valide le transfert
export async function createDepositAsHub(driverId: string, declaredAmount: number, countedAmount: number, collectionIds: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if(!user) return { success: false, error: "Non autorisé" };

  try {
    // Récupération Tenant
    const { data: profile } = await supabase.from('user_profiles').select('tenant_id').eq('id', user.id).single();

    // Insertion du dépôt avec status VALIDÉ_HUB directement (car le HubManager le compte)
    const { data: deposit, error: depError } = await supabase.from('deposits').insert({
        tenant_id: profile?.tenant_id,
        driver_id: driverId,
        declared_amount: declaredAmount,
        counted_amount: countedAmount,
        status: 'VALIDÉ_HUB',
        hub_validated_by: user.id,
        hub_validated_at: new Date().toISOString()
    }).select().single();

    if(depError) throw new Error(depError.message);

    // Mettre à jour les cash_collections pour les lier
    const { error: collError } = await supabase.from('cash_collections')
        .update({ deposit_id: deposit.id })
        .in('id', collectionIds);

    if(collError) throw new Error(collError.message);

    revalidatePath("/hub/deposits");
    return { success: true, depositId: deposit.id };
  } catch(e: any) {
    return { success: false, error: e.message };
  }
}
