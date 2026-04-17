-- Migration SHEVA OS v2.2 : Structure ERP Complète (Finance+, Logistique+, RH+)
-- Description: Ajout de toutes les tables métiers manquantes pour les modules 360°

-- =============================================================================
-- FINANCE : Comptes et Transferts Internes
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.finance_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('OM', 'WAVE', 'CASH', 'BANC')),
    account_number TEXT,
    balance NUMERIC(15,2) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

ALTER TABLE public.finance_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_finance_accounts" ON public.finance_accounts
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()));

CREATE TABLE IF NOT EXISTS public.internal_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id),
    from_account_id UUID NOT NULL REFERENCES public.finance_accounts(id),
    to_account_id UUID NOT NULL REFERENCES public.finance_accounts(id),
    amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
    description TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELLED')),
    operator_id UUID NOT NULL REFERENCES public.user_profiles(id) DEFAULT auth.uid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.internal_transfers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_internal_transfers" ON public.internal_transfers
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()));

-- =============================================================================
-- LOGISTIQUE & ACHATS : Fournisseurs et Imports
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id),
    name TEXT NOT NULL,
    contact_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    address TEXT,
    country TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_suppliers" ON public.suppliers
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()));

CREATE TABLE IF NOT EXISTS public.transit_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id),
    name TEXT NOT NULL,
    contact_name TEXT,
    contact_phone TEXT,
    commission_rate NUMERIC(5,2), -- Pourcentage ou forfait
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

ALTER TABLE public.transit_agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_transit_agents" ON public.transit_agents
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()));

CREATE TABLE IF NOT EXISTS public.import_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id),
    supplier_id UUID NOT NULL REFERENCES public.suppliers(id),
    transit_agent_id UUID REFERENCES public.transit_agents(id),
    description TEXT,
    tracking_number TEXT,
    status TEXT NOT NULL DEFAULT 'COMMANDÉ' CHECK (status IN ('COMMANDÉ', 'EN_TRANSIT', 'DOUANE', 'REÇU', 'ANNULÉ')),
    item_cost NUMERIC(15,2) NOT NULL,    -- Valeur marchandise
    freight_cost NUMERIC(15,2) DEFAULT 0, -- Frais de port
    customs_cost NUMERIC(15,2) DEFAULT 0, -- Frais de douane
    purchase_date DATE NOT NULL,
    eta DATE,                             -- Estimated Time of Arrival
    received_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.import_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_import_purchases" ON public.import_purchases
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()));

-- =============================================================================
-- RH : Contrats et Paie
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.hr_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id),
    base_salary NUMERIC(15,2) NOT NULL DEFAULT 0,
    commission_per_delivery NUMERIC(15,2) DEFAULT 0,
    commission_per_sav_incident NUMERIC(15,2) DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, is_active)
);

ALTER TABLE public.hr_contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_hr_contracts" ON public.hr_contracts
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()));

CREATE TABLE IF NOT EXISTS public.payrolls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id),
    period_month INTEGER NOT NULL CHECK (period_month BETWEEN 1 AND 12),
    period_year INTEGER NOT NULL,
    base_amount NUMERIC(15,2) NOT NULL,
    commissions_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
    bonus_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
    deductions_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
    net_amount NUMERIC(15,2) GENERATED ALWAYS AS 
        (base_amount + commissions_amount + bonus_amount - deductions_amount) STORED,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'CANCELLED')),
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payrolls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_payrolls" ON public.payrolls
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()));

-- =============================================================================
-- AUTOMATISATION : Stock Landed Cost (Optionnel mais recommandé)
-- =============================================================================

COMMENT ON TABLE public.import_purchases IS 'Table de suivi des achats imports avec Landed Cost.';
COMMENT ON COLUMN public.import_purchases.status IS 'Traçabilité du conteneur du fournisseur au hub.';
