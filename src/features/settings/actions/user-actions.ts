"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { UserRole } from "@/core/auth/roles";
import { revalidatePath } from "next/cache";

/**
 * Récupère tous les utilisateurs (Nécessite droits CEO/Admin).
 * Utilise le client Admin pour s'assurer que tous les users du tenant remontent, 
 * même si les policies RLS sont restrictives sur user_profiles.
 */
export async function getTeamMembers() {
    // Vérifier les droits du caller
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Non authentifié");

    const { data: callerProfile } = await supabase
        .from('user_profiles')
        .select('role, tenant_id')
        .eq('id', user.id)
        .single();

    if (!callerProfile || !['ceo', 'super_admin'].includes(callerProfile.role)) {
        throw new Error("Droits insuffisants");
    }

    const admin = createAdminClient();
    
    // Filtrer par le tenant du CEO
    let query = admin.from("user_profiles").select("*").order("created_at", { ascending: false });
    if (callerProfile.role !== 'super_admin' && callerProfile.tenant_id) {
        query = query.eq("tenant_id", callerProfile.tenant_id);
    }
    
    const { data, error } = await query as { data: any[], error: any };
    if (error) throw new Error(error.message);
    
    return data;
}

/**
 * Créer un compte membre de l'équipe (Auth + Profil)
 */
export async function createTeamMember(data: { email: string, full_name: string, role: string, password?: string }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Non authentifié");

    const { data: callerProfile } = await supabase.from('user_profiles').select('role, tenant_id').eq('id', user.id).single();
    if (!callerProfile || !['ceo', 'super_admin'].includes(callerProfile.role)) {
        throw new Error("Droits insuffisants");
    }

    const admin = createAdminClient();
    
    // 1. Créer le user dans auth.users
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
        email: data.email,
        password: data.password || "TempPassword123!", // En mode prod, un email de reset devrait être envoyé
        email_confirm: true,
        user_metadata: {
            full_name: data.full_name
        }
    });

    if (authError) throw new Error(authError.message);
    const userId = authData.user.id;

    // 2. Mettre à jour le profil (qui a probablement été créé par le trigger on_auth_user_created)
    // On force le role et le tenant_id (si on est pas super_admin)
    const payload: any = {
        role: data.role as UserRole,
        full_name: data.full_name,
    };
    
    if (callerProfile.tenant_id && callerProfile.role !== 'super_admin') {
        payload.tenant_id = callerProfile.tenant_id;
    }

    const { error: profileError } = await (admin.from("user_profiles") as any).update(payload as any).eq("id", userId);

    if (profileError) throw new Error(profileError.message);
    
    revalidatePath("/settings/users");
    return true;
}

/**
 * Activer / Désactiver un utilisateur
 */
export async function toggleUserStatus(userId: string, isActive: boolean) {
    const admin = createAdminClient();
    const { error } = await (admin.from("user_profiles") as any).update({ is_active: isActive } as any).eq("id", userId);
    if (error) throw new Error(error.message);
    revalidatePath("/settings/users");
    return true;
}
