"use server";

import { createClient } from "@/lib/supabase/server";
import { UserRole } from "@/core/auth/roles";
import { revalidatePath } from "next/cache";

export async function getUsers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .order("full_name");

  if (error) {
    console.error("Error fetching users:", error);
    return [];
  }
  return data;
}

export async function toggleUserStatus(userId: string, currentStatus: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("user_profiles")
    .update({ is_active: !currentStatus })
    .eq("id", userId);

  if (error) throw error;
  revalidatePath("/admin/users");
}

export async function updateUserRole(userId: string, role: UserRole) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("user_profiles")
    .update({ role })
    .eq("id", userId);

  if (error) throw error;
  revalidatePath("/admin/users");
}
