-- Migration: Marketing & Ads Management Module
-- Description: Adds tables for marketing accounts, campaigns, and spend tracking.

-- 1. Table des Comptes Marketing (Clients ou Entités)
CREATE TABLE IF NOT EXISTS public.marketing_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    contact_person TEXT,
    logo_url TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'ARCHIVED')),
    monthly_budget_cap NUMERIC(15,2) DEFAULT 0,
    account_manager_id UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Table des Campagnes Marketing
CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    marketing_account_id UUID NOT NULL REFERENCES public.marketing_accounts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    platform TEXT NOT NULL, -- 'FB', 'TIKTOK', 'GOOGLE', 'SNAPCHAT', 'INFLUENCE', 'AUTRE'
    platform_campaign_id TEXT, -- ID externe de la plateforme
    total_budget NUMERIC(15,2) DEFAULT 0,
    daily_budget NUMERIC(15,2) DEFAULT 0,
    start_date DATE,
    end_date DATE,
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'RUNNING', 'PAUSED', 'COMPLETED', 'CANCELLED')),
    assigned_agent_id UUID REFERENCES public.user_profiles(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Table des Dépenses Journalières (Daily Ad Spend)
CREATE TABLE IF NOT EXISTS public.marketing_spend_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES public.marketing_campaigns(id) ON DELETE CASCADE,
    spend_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
    reach INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(campaign_id, log_date)
);

-- 4. SÉCURITÉ (RLS)
ALTER TABLE public.marketing_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_spend_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_marketing_accounts" ON public.marketing_accounts
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()));

CREATE POLICY "tenant_isolation_marketing_campaigns" ON public.marketing_campaigns
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()));

CREATE POLICY "tenant_isolation_marketing_spend_logs" ON public.marketing_spend_logs
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()));

-- 5. TRIGGERS pour updated_at
CREATE TRIGGER update_marketing_accounts_updated_at
    BEFORE UPDATE ON public.marketing_accounts
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_marketing_campaigns_updated_at
    BEFORE UPDATE ON public.marketing_campaigns
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 6. COMMENTAIRES
COMMENT ON TABLE public.marketing_accounts IS 'Base de données des clients ou marques gérés en marketing.';
COMMENT ON TABLE public.marketing_campaigns IS 'Gestion des campagnes publicitaires par plateforme et budget.';
COMMENT ON TABLE public.marketing_spend_logs IS 'Trace quotidienne des dépenses réelles pour calcul du ROI/ROAS.';
