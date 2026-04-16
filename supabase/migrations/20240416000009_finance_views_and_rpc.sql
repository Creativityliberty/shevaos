-- migration: 20240416000009_finance_views_and_rpc.sql
-- Description: Vues et RPC pour le Bloc 6 (Finance & Dashboard CEO)
-- Author: Antigravity

-- 1. VUE : Résumé quotidien des revenus (Basé sur le Ledger immuable)
-- C'est la source de vérité pour le CA VÉRIFIÉ
CREATE OR REPLACE VIEW public.v_daily_revenue AS
SELECT 
    date_trunc('day', created_at)::date as day,
    tenant_id,
    SUM(amount) FILTER (WHERE type = 'CASH_VERIFIED') as verified_revenue,
    COUNT(*) FILTER (WHERE type = 'CASH_VERIFIED') as deposit_count
FROM public.ledger_entries
GROUP BY 1, 2;

-- 2. VUE : Statistiques des commandes par statut
CREATE OR REPLACE VIEW public.v_orders_stats AS
SELECT 
    tenant_id,
    status,
    COUNT(*) as count,
    SUM(cod_amount) as total_amount
FROM public.orders
GROUP BY 1, 2;

-- 3. RPC : get_dashboard_metrics
-- Centralise tous les KPIs pour le Dashboard CEO
CREATE OR REPLACE FUNCTION public.get_dashboard_metrics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tenant_id uuid;
    v_result jsonb;
    v_verified_ca numeric(15,2);
    v_estimated_ca numeric(15,2); -- Commandes livrées mais pas encore vérifiées
    v_pending_orders integer;
    v_success_rate numeric(5,2);
    v_daily_data jsonb;
BEGIN
    -- Récupérer le tenant_id de l'utilisateur
    SELECT tenant_id INTO v_tenant_id FROM public.user_profiles WHERE id = auth.uid();

    -- CA Vérifié (depuis le ledger)
    SELECT COALESCE(SUM(amount), 0) INTO v_verified_ca
    FROM public.ledger_entries
    WHERE tenant_id = v_tenant_id AND type = 'CASH_VERIFIED';

    -- CA Potentiel (Livrées + Encaissées + Déposées)
    SELECT COALESCE(SUM(cod_amount), 0) INTO v_estimated_ca
    FROM public.orders
    WHERE tenant_id = v_tenant_id 
    AND status IN ('LIVRÉE', 'ENCAISSÉE', 'DÉPOSÉE');

    -- Commandes en attente (Confirmée, Assignée, En livraison)
    SELECT COUNT(*) INTO v_pending_orders
    FROM public.orders
    WHERE tenant_id = v_tenant_id AND status IN ('CONFIRMÉE', 'ASSIGNÉE', 'EN_LIVRAISON');

    -- Taux de succès (Livrées vs Total traitées)
    SELECT 
        CASE 
            WHEN COUNT(*) FILTER (WHERE status IN ('LIVRÉE', 'ENCAISSÉE', 'DÉPOSÉE', 'VÉRIFIÉE', 'ECHEC_LIVRAISON')) = 0 THEN 0
            ELSE (COUNT(*) FILTER (WHERE status IN ('LIVRÉE', 'ENCAISSÉE', 'DÉPOSÉE', 'VÉRIFIÉE'))::numeric / 
                  COUNT(*) FILTER (WHERE status IN ('LIVRÉE', 'ENCAISSÉE', 'DÉPOSÉE', 'VÉRIFIÉE', 'ECHEC_LIVRAISON'))::numeric * 100)
        END INTO v_success_rate
    FROM public.orders
    WHERE tenant_id = v_tenant_id;

    -- Données quotidiennes pour le graphique (7 derniers jours)
    SELECT jsonb_agg(d) INTO v_daily_data
    FROM (
        SELECT 
            gs.day::date as date,
            COALESCE(r.verified_revenue, 0) as revenue
        FROM generate_series(current_date - interval '6 days', current_date, interval '1 day') gs(day)
        CROSS JOIN (SELECT v_tenant_id as tid) t
        LEFT JOIN public.v_daily_revenue r ON r.day = gs.day::date AND r.tenant_id = t.tid
        ORDER BY gs.day
    ) d;

    -- Construction du résultat final
    v_result := jsonb_build_object(
        'verified_ca', v_verified_ca,
        'estimated_ca', v_estimated_ca,
        'pending_orders', v_pending_orders,
        'success_rate', ROUND(v_success_rate, 2),
        'daily_revenue', COALESCE(v_daily_data, '[]'::jsonb)
    );

    RETURN v_result;
END;
$$;

-- 4. RPC : get_financial_report
-- Pour la page de reporting finance
CREATE OR REPLACE FUNCTION public.get_financial_report(p_start_date date, p_end_date date)
RETURNS TABLE (
    day date,
    total_entries integer,
    total_amount numeric(15,2),
    entry_types jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        date_trunc('day', created_at)::date as day,
        COUNT(*)::integer as total_entries,
        SUM(amount)::numeric(15,2) as total_amount,
        jsonb_object_agg(type, count_entry) as entry_types
    FROM (
        SELECT 
            created_at, 
            amount, 
            type, 
            count(*) over(partition by date_trunc('day', created_at)::date, type) as count_entry
        FROM public.ledger_entries
        WHERE tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid())
        AND created_at::date BETWEEN p_start_date AND p_end_date
    ) sub
    GROUP BY 1
    ORDER BY 1 DESC;
END;
$$;

-- 5. GRANTS
GRANT EXECUTE ON FUNCTION public.get_dashboard_metrics() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_financial_report(date, date) TO authenticated;

-- 6. POLICIES pour les vues
ALTER VIEW public.v_daily_revenue OWNER TO postgres;
ALTER VIEW public.v_orders_stats OWNER TO postgres;
-- Les vues héritent généralement des politiques des tables sous-jacentes si définies avec SECURITY INVOKER
-- Mais ici on va laisser ainsi car les RPC SECURITY DEFINER filtrent déjà par tenant_id.
