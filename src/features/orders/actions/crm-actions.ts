"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Enregistrer une tentative d'appel SAV
 */
export async function logCallAttempt(orderId: string, note: string) {
  const supabase = await createClient();
  
  try {
    // 1. Récupérer l'actuel attempt_count
    const { data: order } = await supabase
      .from("orders")
      .select("attempt_count")
      .eq("id", orderId)
      .single();

    const newCount = (order?.attempt_count || 0) + 1;

    // 2. Mettre à jour la commande
    const { error } = await supabase
      .from("orders")
      .update({
        attempt_count: newCount,
        last_call_at: new Date().toISOString(),
        notes: note ? `[Appel #${newCount}] ${note}` : undefined
      })
      .eq("id", orderId);

    if (error) throw error;

    revalidatePath("/sav/post-terrain");
    revalidatePath(`/orders/${orderId}`);
    
    return { success: true, message: `Appel #${newCount} enregistré.` };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Programmer un rappel client
 */
export async function scheduleRecall(orderId: string, recallDate: Date) {
  const supabase = await createClient();
  
  try {
    const { error } = await supabase
      .from("orders")
      .update({
        next_recall_at: recallDate.toISOString(),
      })
      .eq("id", orderId);

    if (error) throw error;

    revalidatePath("/sav/post-terrain");
    revalidatePath(`/orders/${orderId}`);
    
    return { success: true, message: "Rappel programmé." };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Confirmer une commande depuis le SAV
 */
export async function confirmFromSav(orderId: string) {
  const supabase = await createClient();
  
  try {
    const { error } = await supabase
      .from("orders")
      .update({
        status: "CONFIRMÉE",
        next_recall_at: null, // On efface le rappel car traité
        updated_at: new Date().toISOString()
      })
      .eq("id", orderId);

    if (error) throw error;

    revalidatePath("/sav/post-terrain");
    revalidatePath("/dispatch");
    
    return { success: true, message: "Commande confirmée et envoyée au dispatch." };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
