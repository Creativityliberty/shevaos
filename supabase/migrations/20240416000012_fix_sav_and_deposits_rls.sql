-- Migration SAV v2.1 : Création de la table customer_incidents manquante
-- Description: Table pour le suivi des litiges SAV, retards et erreurs

-- Table customer_incidents
CREATE TABLE IF NOT EXISTS public.customer_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id),
    order_id UUID NOT NULL REFERENCES public.orders(id),
    incident_type TEXT NOT NULL CHECK (incident_type IN (
        'RETARD', 'PRODUIT_FRAGILISE', 'ERREUR_PRIX', 
        'ADRESSE_FAUSSE', 'ECHANGE_DEMANDE', 'AUTRE'
    )),
    status TEXT NOT NULL DEFAULT 'OUVERT' CHECK (status IN (
        'OUVERT', 'EN_COURS', 'RESOLU', 'ANNULE'
    )),
    priority TEXT NOT NULL DEFAULT 'MOYENNE' CHECK (priority IN (
        'BASSE', 'MOYENNE', 'HAUTE', 'URGENTE'
    )),
    description TEXT NOT NULL,
    resolution_notes TEXT,
    operator_id UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- RLS
ALTER TABLE public.customer_incidents ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_incidents_tenant ON public.customer_incidents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_incidents_order ON public.customer_incidents(order_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.customer_incidents(tenant_id, status);

-- Policies
CREATE POLICY "tenant_isolation_incidents" ON public.customer_incidents
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()));

-- Correction des politiques deposits (levée de l'ambiguïté SELECT dans USING)
DROP POLICY IF EXISTS "hub_finance_manage_deposits" ON public.deposits;
CREATE POLICY "hub_finance_manage_deposits" ON public.deposits
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() 
            AND role IN ('hub', 'hub_manager', 'finance', 'ceo', 'super_admin')
            AND tenant_id = deposits.tenant_id
        )
    );

-- Politique simplifiée pour le ledger
DROP POLICY IF EXISTS "finance_read_ledger" ON public.ledger_entries;
CREATE POLICY "finance_read_ledger" ON public.ledger_entries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() 
            AND role IN ('finance', 'ceo', 'super_admin', 'achats')
            AND tenant_id = ledger_entries.tenant_id
        )
    );
