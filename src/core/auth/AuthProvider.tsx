"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { UserRole } from "./roles";

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  tenantId: string | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  tenantId: null,
  isLoading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        if (mounted) setUser(session.user);
        
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("role, tenant_id")
          .eq("id", session.user.id)
          .single();
          
        if (mounted && profile) {
          setRole(profile.role as UserRole);
          setTenantId(profile.tenant_id);
        }
      }
      
      if (mounted) setIsLoading(false);
    }

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      if (session?.user) {
        if (mounted) setUser(session.user);
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("role, tenant_id")
          .eq("id", session.user.id)
          .single();
        if (mounted && profile) {
          setRole(profile.role as UserRole);
          setTenantId(profile.tenant_id);
        }
      } else {
        if (mounted) {
          setUser(null);
          setRole(null);
          setTenantId(null);
        }
      }
      if (mounted) setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, role, tenantId, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
