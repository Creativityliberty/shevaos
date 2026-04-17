-- Migration: Fix Tenants RLS
-- Description: Adds the missing RLS policy for the tenants table to allow users to read their own tenant data.

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'tenants' 
        AND policyname = 'tenant_isolation_tenants'
    ) THEN
        CREATE POLICY tenant_isolation_tenants ON public.tenants
            FOR SELECT USING (id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()));
            
        -- Also allow CEOs and managers to update their tenant settings
        CREATE POLICY tenant_update_ceo_manager ON public.tenants
            FOR UPDATE USING (
                id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid())
                AND (SELECT role FROM public.user_profiles WHERE id = auth.uid()) IN ('ceo', 'super_admin', 'manager')
            );
    END IF;
END $$;
