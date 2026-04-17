-- Migration: 20260417000026_marketing_campaigns_management.sql
-- Description: Introduction de la gestion structurée des campagnes publicitaires.

-- 1. Table des Campagnes
CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id),
    account_id UUID NOT NULL REFERENCES public.marketing_accounts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    platform TEXT CHECK (platform IN ('FACEBOOK', 'GOOGLE', 'TIKTOK', 'INSTAGRAM', 'SNAPCHAT', 'AUTRE')),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED')),
    
    -- Budgets
    total_budget_limit NUMERIC(15,2) DEFAULT 0,
    daily_budget_limit NUMERIC(15,2) DEFAULT 0,
    
    -- Planning
    start_date DATE,
    end_date DATE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- 2. Sécurité (RLS)
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_marketing_campaigns" ON public.marketing_campaigns
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()));

-- 3. Mise à jour des Logs de Dépenses pour lier à une campagne
ALTER TABLE public.marketing_spend_logs ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES public.marketing_campaigns(id);

-- 4. Index de performance
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_account ON public.marketing_campaigns(account_id);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_status ON public.marketing_campaigns(status);

-- 5. Trigger pour updated_at
CREATE OR REPLACE FUNCTION public.handle_marketing_campaign_update()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_marketing_campaign_update
    BEFORE UPDATE ON public.marketing_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_marketing_campaign_update();

COMMENT ON TABLE public.marketing_campaigns IS 'Gestion structurée des campagnes publicitaires pour SHEVA OS.';
