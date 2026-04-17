-- Migration: 20260417000025_ceo_performance_roas.sql
-- Description: Ajout du ROAS et distinction entre CA estimé et CA vérifié dans le rapport CEO.

CREATE OR REPLACE FUNCTION public.get_ceo_performance_report(p_days integer DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tenant_id uuid;
    v_result jsonb;
    v_start_date timestamptz;
BEGIN
    SELECT tenant_id INTO v_tenant_id FROM public.user_profiles WHERE id = auth.uid();
    v_start_date := now() - (p_days || ' days')::interval;

    WITH 
    order_metrics AS (
        SELECT 
            -- CA Vérifié = Argent qui a été déposé et validé par la Finance
            COALESCE(SUM(o.cod_amount) FILTER (WHERE o.status = 'VÉRIFIÉE'), 0) as verified_revenue,
            -- CA Potentiel = Argent en cours de livraison ou collecté mais pas encore vérifié
            COALESCE(SUM(o.cod_amount) FILTER (WHERE o.status IN ('LIVRÉE', 'ENCAISSÉE', 'DÉPOSÉE')), 0) as pending_revenue,
            -- Revenu Total (pour le ROAS, on peut choisir, mais le ROAS "Sûr" est sur le vérifié)
            COALESCE(SUM(o.cod_amount) FILTER (WHERE o.status IN ('LIVRÉE', 'ENCAISSÉE', 'DÉPOSÉE', 'VÉRIFIÉE')), 0) as total_successful_revenue,
            COUNT(*) as total_orders,
            COUNT(*) FILTER (WHERE o.status IN ('LIVRÉE', 'ENCAISSÉE', 'DÉPOSÉE', 'VÉRIFIÉE')) as successful_order_count,
            COALESCE(SUM(p.buying_price * oi.quantity), 0) as total_cogs
        FROM public.orders o
        LEFT JOIN public.order_items oi ON oi.order_id = o.id
        LEFT JOIN public.products p ON p.id = oi.product_id
        WHERE o.tenant_id = v_tenant_id 
        AND o.created_at >= v_start_date
    ),
    expense_metrics AS (
        -- Dépenses hors marketing (salaires, loyers, etc.)
        SELECT COALESCE(SUM(amount), 0) as total_admin_expenses
        FROM public.expenses
        WHERE tenant_id = v_tenant_id 
        AND expense_date >= v_start_date::date
    ),
    marketing_metrics AS (
        -- Dépenses Marketing (Facebook Ads, Influences, etc.)
        SELECT COALESCE(SUM(spend_amount), 0) as total_marketing_spend
        FROM public.marketing_spend_logs
        WHERE tenant_id = v_tenant_id 
        AND spend_date >= v_start_date::date
    ),
    top_products AS (
        SELECT jsonb_agg(tp) FROM (
            SELECT 
                p.name,
                SUM(oi.quantity) as volume,
                SUM(oi.quantity * oi.unit_price) as revenue
            FROM public.order_items oi
            JOIN public.products p ON p.id = oi.product_id
            JOIN public.orders o ON o.id = oi.order_id
            WHERE o.tenant_id = v_tenant_id AND o.created_at >= v_start_date
            GROUP BY p.name
            ORDER BY revenue DESC
            LIMIT 5
        ) tp
    )
    SELECT 
        jsonb_build_object(
            'verified_revenue', om.verified_revenue,
            'pending_revenue', om.pending_revenue,
            'total_estimated_revenue', om.total_successful_revenue,
            'marketing_spend', mm.total_marketing_spend,
            'roas', CASE WHEN mm.total_marketing_spend > 0 THEN ROUND(om.total_successful_revenue / mm.total_marketing_spend, 2) ELSE 0 END,
            'cogs', om.total_cogs,
            'other_expenses', em.total_admin_expenses,
            'net_profit', (om.verified_revenue - om.total_cogs - em.total_admin_expenses - mm.total_marketing_spend),
            'order_count', om.total_orders,
            'success_rate', ROUND(om.successful_order_count::numeric / NULLIF(om.total_orders, 0) * 100, 2),
            'top_products', COALESCE((SELECT * FROM top_products), '[]'::jsonb),
            'period_days', p_days
        ) INTO v_result
    FROM order_metrics om, expense_metrics em, marketing_metrics mm;

    RETURN v_result;
END;
$$;
