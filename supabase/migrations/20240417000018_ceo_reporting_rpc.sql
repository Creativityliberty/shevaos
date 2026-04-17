-- Migration: CEO Reporting Enhancements
-- Description: Adds cost tracking to products and creates an advanced reporting RPC.

-- 1. Add buying_price to products if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='buying_price') THEN
        ALTER TABLE public.products ADD COLUMN buying_price DECIMAL(15,2) DEFAULT 0;
    END IF;
END $$;

-- 2. Advanced CEO Reporting RPC
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
            COALESCE(SUM(o.cod_amount), 0) as total_revenue,
            COUNT(*) as total_orders,
            COUNT(*) FILTER (WHERE o.status IN ('LIVRÉE', 'ENCAISSÉE', 'DÉPOSÉE', 'VÉRIFIÉE')) as successful_orders,
            COALESCE(SUM(p.buying_price * oi.quantity), 0) as total_cogs
        FROM public.orders o
        LEFT JOIN public.order_items oi ON oi.order_id = o.id
        LEFT JOIN public.products p ON p.id = oi.product_id
        WHERE o.tenant_id = v_tenant_id 
        AND o.created_at >= v_start_date
    ),
    expense_metrics AS (
        SELECT COALESCE(SUM(amount), 0) as total_expenses
        FROM public.expenses
        WHERE tenant_id = v_tenant_id 
        AND expense_date >= v_start_date::date
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
    ),
    driver_stats AS (
        SELECT jsonb_agg(ds) FROM (
            SELECT 
                up.full_name,
                COUNT(d.id) as total_assigned,
                COUNT(d.id) FILTER (WHERE d.status = 'LIVRÉE') as delivered,
                ROUND(COUNT(d.id) FILTER (WHERE d.status = 'LIVRÉE')::numeric / NULLIF(COUNT(d.id), 0) * 100, 2) as success_rate
            FROM public.deliveries d
            JOIN public.user_profiles up ON up.id = d.driver_id
            WHERE d.tenant_id = v_tenant_id AND d.created_at >= v_start_date
            GROUP BY up.full_name
            ORDER BY success_rate DESC
        ) ds
    )
    SELECT 
        jsonb_build_object(
            'revenue', om.total_revenue,
            'cogs', om.total_cogs,
            'expenses', em.total_expenses,
            'net_margin', (om.total_revenue - om.total_cogs - em.total_expenses),
            'order_count', om.total_orders,
            'success_rate', ROUND(om.successful_orders::numeric / NULLIF(om.total_orders, 0) * 100, 2),
            'top_products', COALESCE((SELECT * FROM top_products), '[]'::jsonb),
            'driver_performance', COALESCE((SELECT * FROM driver_stats), '[]'::jsonb),
            'period_days', p_days
        ) INTO v_result
    FROM order_metrics om, expense_metrics em;

    RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_ceo_performance_report(integer) TO authenticated;
