"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface DeliveryAssignmentResult {
    success: boolean;
    delivery_id?: string;
    message: string;
    error?: string;
}

export interface DeliveryConfirmationResult {
    success: boolean;
    message: string;
    expected_amount?: number;
    collected_amount?: number;
    difference?: number;
    error?: string;
}

export interface DeliveryFailureResult {
    success: boolean;
    message: string;
    reason?: string;
    error?: string;
}

/**
 * Assigner une commande à un livreur
 * Seulement pour les rôles DISPATCHER, CEO, SUPER_ADMIN
 */
export async function assignDelivery(
    orderId: string,
    driverId: string
): Promise<DeliveryAssignmentResult> {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase.rpc("assign_delivery", {
            p_order_id: orderId,
            p_driver_id: driverId
        });

        if (error) {
            return {
                success: false,
                message: "Erreur lors de l'assignation",
                error: error.message
            };
        }

        // Revalider les pages concernées
        revalidatePath("/dispatch");
        revalidatePath("/orders");

        return {
            success: data.success,
            delivery_id: data.delivery_id,
            message: data.message
        };

    } catch (error) {
        return {
            success: false,
            message: "Erreur inattendue",
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}

/**
 * Confirmer une livraison réussie
 * Seulement pour le livreur assigné
 */
export async function confirmDelivery(
    deliveryId: string,
    collectedAmount: number
): Promise<DeliveryConfirmationResult> {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase.rpc("confirm_delivery", {
            p_delivery_id: deliveryId,
            p_collected_amount: collectedAmount
        });

        if (error) {
            return {
                success: false,
                message: "Erreur lors de la confirmation",
                error: error.message
            };
        }

        // Revalider les pages concernées
        revalidatePath("/driver/deliveries");
        revalidatePath("/dispatch");
        revalidatePath("/orders");

        return {
            success: data.success,
            message: data.message,
            expected_amount: data.expected_amount,
            collected_amount: data.collected_amount,
            difference: data.difference
        };

    } catch (error) {
        return {
            success: false,
            message: "Erreur inattendue",
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}

/**
 * Reporter un échec de livraison
 * Seulement pour le livreur assigné
 */
export async function reportDeliveryFailure(
    deliveryId: string,
    reason: string
): Promise<DeliveryFailureResult> {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase.rpc("report_failure", {
            p_delivery_id: deliveryId,
            p_reason: reason
        });

        if (error) {
            return {
                success: false,
                message: "Erreur lors du report d'échec",
                error: error.message
            };
        }

        // Revalider les pages concernées
        revalidatePath("/driver/deliveries");
        revalidatePath("/dispatch");
        revalidatePath("/orders");

        return {
            success: data.success,
            message: data.message,
            reason: data.reason
        };

    } catch (error) {
        return {
            success: false,
            message: "Erreur inattendue",
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}

/**
 * Démarrer une livraison (après chargement Hub)
 */
export async function startDelivery(deliveryId: string): Promise<{ success: boolean; message: string; error?: string }> {
    const supabase = await createClient();
    try {
        const { data, error } = await supabase.rpc("start_delivery", { p_delivery_id: deliveryId });
        if (error) return { success: false, message: error.message };
        revalidatePath("/driver/deliveries");
        return { success: data.success, message: "Course démarrée !" };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

/**
 * Marquer l'arrivée sur zone (capture GPS)
 */
export async function markArrived(deliveryId: string, locationGps: string): Promise<{ success: boolean; message: string; error?: string }> {
    const supabase = await createClient();
    try {
        const { data, error } = await supabase.rpc("mark_arrived", { 
            p_delivery_id: deliveryId, 
            p_location_gps: locationGps 
        });
        if (error) return { success: false, message: error.message };
        revalidatePath("/driver/deliveries");
        return { success: data.success, message: "Arrivée enregistrée !" };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

/**
 * Récupérer les livraisons d'un livreur
 */
export async function getDriverDeliveries() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("deliveries")
        .select(`
      *,
      orders (
        order_number,
        cod_amount,
        customers (full_name, phone, address),
        zones (name)
      )
    `)
        .eq("driver_id", (await supabase.auth.getUser()).data.user?.id)
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error("Erreur lors de la récupération des livraisons: " + error.message);
    }

    return data;
}

/**
 * Récupérer toutes les livraisons pour le dispatcher
 */
export async function getAllDeliveries() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("deliveries")
        .select(`
      *,
      orders (
        order_number,
        cod_amount,
        customers (full_name, phone, address),
        zones (name)
      ),
      user_profiles:driver_id (full_name, phone)
    `)
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error("Erreur lors de la récupération des livraisons: " + error.message);
    }

    return data;
}