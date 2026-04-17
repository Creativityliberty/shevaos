-- Migration SHEVA OS v2.7 : Verrouillage du Chiffre d'Affaires
-- Description: Enforce que seul le CA 'VÉRIFIÉE' est considéré comme acquis dans les rapports.

-- 1. Mise à jour de get_dashboard_metrics
CREATE OR REPLACE FUNCTION public.get_dashboard_metrics()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_verified_ca NUMERIC;
    v_estimated_ca NUMERIC;
    v_pending_orders INTEGER;
    v_success_rate NUMERIC;
    v_daily_revenue JSONB;
BEGIN
    -- CA certifié (Seulement VÉRIFIÉE)
    SELECT COALESCE(SUM(cod_amount), 0) INTO v_verified_ca
    FROM public.orders
    WHERE status = 'VÉRIFIÉE'
    AND tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid());

    -- CA estimé (Encaissé mais non encore vérifié, ou en livraison)
    SELECT COALESCE(SUM(cod_amount), 0) INTO v_estimated_ca
    FROM public.orders
    WHERE status IN ('ENCAISSÉE', 'DÉPOSÉE', 'LIVRÉE', 'EN_LIVRAISON')
    AND tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid());

    -- Commandes à traiter
    SELECT COUNT(*) INTO v_pending_orders
    FROM public.orders
    WHERE status IN ('CONFIRMÉE', 'ASSIGNÉE', 'EN_LIVRAISON')
    AND tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid());

    -- Taux de succès
    SELECT 
        CASE 
            WHEN COUNT(*) = 0 THEN 0 
            ELSE (COUNT(*) FILTER (WHERE status IN ('LIVRÉE', 'ENCAISSÉE', 'VÉRIFIÉE'))::NUMERIC / COUNT(*)::NUMERIC) * 100 
        END INTO v_success_rate
    FROM public.orders
    WHERE status NOT IN ('BROUILLON', 'ANNULÉE')
    AND tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid());

    -- Revenu quotidien certifié (7 derniers jours)
    SELECT jsonb_agg(t) INTO v_daily_revenue
    FROM (
        SELECT 
            d::date as date,
            COALESCE(SUM(o.cod_amount), 0) as revenue
        FROM generate_series(current_date - interval '6 days', current_date, interval '1 day') d
        LEFT JOIN public.orders o ON o.updated_at::date = d::date AND o.status = 'VÉRIFIÉE'
        GROUP BY 1 ORDER BY 1
    ) t;

    RETURN jsonb_build_object(
        'verified_ca', v_verified_ca,
        'estimated_ca', v_estimated_ca,
        'pending_orders', v_pending_orders,
        'success_rate', v_success_rate,
        'daily_revenue', v_daily_revenue
    );
END;
$$;

-- 2. Mise à jour de get_ceo_performance_report
CREATE OR REPLACE FUNCTION public.get_ceo_performance_report(p_days integer DEFAULT 30)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
-- Même logique de filtrage strict pour le rapport de performance 30j
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'verified_revenue', COALESCE(SUM(cod_amount) FILTER (WHERE status = 'VÉRIFIÉE'), 0),
        'other_expenses', 0, -- Reste à brancher sur table expenses
        'marketing_spend', 0, -- Reste à brancher sur table marketing
        'net_profit', COALESCE(SUM(cod_amount) FILTER (WHERE status = 'VÉRIFIÉE'), 0),
        'success_rate', CASE WHEN COUNT(*) = 0 THEN 0 ELSE (COUNT(*) FILTER (WHERE status IN ('LIVRÉE', 'ENCAISSÉE', 'VÉRIFIÉE'))::NUMERIC / COUNT(*)::NUMERIC) * 100 END,
        'order_count', COUNT(*),
        'roas', 0
    ) INTO v_result
    FROM public.orders
    WHERE created_at >= (now() - (p_days || ' days')::interval)
    AND tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid());

    RETURN v_result;
END;
$$;
