-- Migration SHEVA OS v2.3 : Audit & Dispositif de Sécurité (La Boîte Noire)
-- Description: Implémentation du journal d'audit immuable et du système de litiges conforme au CDC.

-- =============================================================================
-- TABLE : audit_log (Journal d'audit immuable)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id),
    user_id UUID REFERENCES public.user_profiles(id),
    entity_type TEXT NOT NULL, -- 'ORDER', 'MISSION', 'STOCK', 'FINANCE', 'DISPUTE'
    entity_id UUID NOT NULL,
    action TEXT NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'VALIDATE'
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Activation RLS sur Audit Log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_audit_log" ON public.audit_log
    FOR SELECT USING (tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()));

-- VERROU IMMUABLE : Empêcher toute modification ou suppression dans le journal d'audit
CREATE OR REPLACE FUNCTION public.prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Le journal d''audit SHEVA OS est immuable. Toute modification ou suppression est interdite.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_protect_audit_log
BEFORE UPDATE OR DELETE ON public.audit_log
FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_modification();

-- =============================================================================
-- TABLE : disputes (Gestion des Litiges Mission)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id),
    mission_id UUID NOT NULL REFERENCES public.missions(id),
    livreur_id UUID NOT NULL REFERENCES public.user_profiles(id),
    type TEXT NOT NULL CHECK (type IN ('ÉCART_STOCK', 'ÉCART_ARGENT', 'ÉCART_MIXTE')),
    status TEXT NOT NULL DEFAULT 'LITIGE_OUVERT' CHECK (status IN ('LITIGE_OUVERT', 'LITIGE_RÉSOLU')),
    stock_gap_qty INTEGER DEFAULT 0,
    stock_gap_value NUMERIC(15,2) DEFAULT 0,
    money_gap NUMERIC(15,2) DEFAULT 0,
    justification TEXT NOT NULL,
    decision TEXT,
    responsible_id UUID REFERENCES public.user_profiles(id),
    deadline DATE,
    evidence_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_disputes" ON public.disputes
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()));

-- =============================================================================
-- AUTOMATISATION : Enregistrement auto dans l'audit (Triggers)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.fn_auto_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    v_tenant_id UUID;
BEGIN
    -- Récupération du tenant_id selon la table
    IF (TG_TABLE_NAME = 'orders' OR TG_TABLE_NAME = 'missions') THEN
        v_tenant_id := COALESCE(NEW.tenant_id, OLD.tenant_id);
    ELSE
        -- Fallback profil
        SELECT tenant_id INTO v_tenant_id FROM public.user_profiles WHERE id = auth.uid();
    END IF;

    INSERT INTO public.audit_log (
        tenant_id,
        user_id,
        entity_type,
        entity_id,
        action,
        old_data,
        new_data
    ) VALUES (
        v_tenant_id,
        auth.uid(),
        UPPER(TG_TABLE_NAME),
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        to_jsonb(OLD),
        to_jsonb(NEW)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Application de l'audit auto sur les tables critiques
DROP TRIGGER IF EXISTS audit_orders ON public.orders;
CREATE TRIGGER audit_orders AFTER INSERT OR UPDATE OR DELETE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.fn_auto_audit_log();

DROP TRIGGER IF EXISTS audit_missions ON public.missions;
CREATE TRIGGER audit_missions AFTER INSERT OR UPDATE OR DELETE ON public.missions
FOR EACH ROW EXECUTE FUNCTION public.fn_auto_audit_log();

-- =============================================================================
-- SÉCURISATION DU GRAND LIVRE (Append-only strict)
-- =============================================================================

CREATE TRIGGER trigger_protect_ledger
BEFORE UPDATE OR DELETE ON public.grand_livre
FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_modification();

COMMENT ON TABLE public.audit_log IS 'Journal immuable SHEVA OS. Capture tous les changements critiques.';
COMMENT ON TABLE public.disputes IS 'Gestion des anomalies logistiques et financières détectées lors du débriefing mission.';
