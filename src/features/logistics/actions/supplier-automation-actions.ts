"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Récupère tous les fournisseurs avec leurs dettes actuelles
 */
export async function getSuppliersWithBalance() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("suppliers")
    .select(`
      *,
      supplier_invoices(remaining_balance)
    `)
    .is("deleted_at", null);

  if (error) throw error;

  // Calculer la balance totale par fournisseur
  return data.map(s => ({
    ...s,
    total_debt: s.supplier_invoices?.reduce((acc: number, curr: any) => acc + (Number(curr.remaining_balance) || 0), 0) || 0
  }));
}

/**
 * Crée un nouveau Bon de Commande (Purchase Order)
 */
export async function createPurchaseOrder(data: {
  supplier_id: string;
  order_number: string;
  items: { product_id: string; quantity: number; unit_price: number }[];
}) {
  const supabase = await createClient();
  
  // 1. Déterminer le tenant
  const { data: profile } = await supabase.from("user_profiles").select("tenant_id").single();
  if (!profile) throw new Error("Non autorisé");

  const totalAmount = data.items.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0);

  // 2. Créer l'entête
  const { data: po, error: poError } = await supabase
    .from("purchase_orders")
    .insert({
      tenant_id: profile.tenant_id,
      supplier_id: data.supplier_id,
      order_number: data.order_number,
      total_amount: totalAmount,
      status: 'BROUILLON'
    })
    .select()
    .single();

  if (poError) throw poError;

  // 3. Créer les lignes
  const itemsWithMeta = data.items.map(item => ({
    ...item,
    purchase_order_id: po.id,
    tenant_id: profile.tenant_id
  }));

  const { error: itemsError } = await supabase
    .from("purchase_order_items")
    .insert(itemsWithMeta);

  if (itemsError) throw itemsError;

  revalidatePath("/logistique/fournisseurs");
  return po;
}

/**
 * Enregistre un paiement fournisseur
 */
export async function paySupplierInvoice(data: {
  supplier_id: string;
  amount: number;
  payment_method: string;
  reference?: string;
}) {
  const supabase = await createClient();
  const { data: profile } = await supabase.from("user_profiles").select("tenant_id").single();
  if (!profile) throw new Error("Non autorisé");

  // 1. Enregistrer le paiement
  const { data: payment, error: pError } = await supabase
    .from("supplier_payments")
    .insert({
      tenant_id: profile.tenant_id,
      supplier_id: data.supplier_id,
      amount: data.amount,
      payment_method: data.payment_method,
      reference: data.reference
    })
    .select()
    .single();

  if (pError) throw pError;

  // 2. Imputer sur les factures impayées (FIFO logic)
  // TODO: Implement sophisticated allocation or just update balances
  
  revalidatePath("/logistique/fournisseurs");
  return payment;
}
