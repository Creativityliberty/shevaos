"use server";

import { createClient } from "@/lib/supabase/server";

export async function getFinancialReports(startDate: string, endDate: string) {
  const supabase = await createClient();

  // Appeler la RPC get_financial_report
  const { data, error } = await supabase.rpc("get_financial_report", {
    p_start_date: startDate,
    p_end_date: endDate,
  });

  if (error) {
    console.error("Financial report error:", error);
    throw new Error("Impossible de générer le rapport financier.");
  }

  return data;
}
