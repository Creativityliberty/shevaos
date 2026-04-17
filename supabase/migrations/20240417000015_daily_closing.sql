-- Création de la table de clôture journalière
CREATE TABLE public.daily_closings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id uuid NOT NULL REFERENCES public.tenants(id),
    closing_date date NOT NULL DEFAULT CURRENT_DATE,
    theoretical_amount numeric NOT NULL DEFAULT 0,
    actual_amount numeric NOT NULL DEFAULT 0,
    discrepancy numeric GENERATED ALWAYS AS (actual_amount - theoretical_amount) STORED,
    status text NOT NULL DEFAULT 'SESSION_OUVERTE' CHECK (status IN ('SESSION_OUVERTE', 'VALIIDÉ', 'ÉCART_SIGNALÉ')),
    operator_id uuid NOT NULL REFERENCES public.user_profiles(id),
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(tenant_id, closing_date)
);

-- Activation de la RLS
ALTER TABLE public.daily_closings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "view_tenant_closings" ON public.daily_closings
    FOR SELECT USING (tenant_id = get_auth_tenant_id());

CREATE POLICY "insert_tenant_closings" ON public.daily_closings
    FOR INSERT WITH CHECK (tenant_id = get_auth_tenant_id());

CREATE POLICY "update_tenant_closings" ON public.daily_closings
    FOR UPDATE USING (tenant_id = get_auth_tenant_id());

-- Grant privileges
GRANT ALL ON public.daily_closings TO authenticated;
GRANT ALL ON public.daily_closings TO service_role;

-- Fonction pour calculer le montant théorique (Cash in Hand)
CREATE OR REPLACE FUNCTION get_theoretical_cash(p_tenant_id uuid)
RETURNS numeric AS $$
DECLARE
    v_cash numeric;
BEGIN
    -- Somme des entrées (debits) - Somme des sorties (credits) sur les comptes de type 'CASH'
    SELECT COALESCE(SUM(amount), 0)
    FROM public.ledger_entries
    WHERE tenant_id = p_tenant_id
    AND account_type = 'CASH'
    INTO v_cash;
    
    RETURN v_cash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
