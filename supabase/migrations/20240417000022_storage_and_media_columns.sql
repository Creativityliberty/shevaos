-- Migration: Storage Integration & Media Columns
-- Description: Adds missing media columns to tables and enables Realtime on critical tables.

-- 1. SCHEMAS : Add media_url columns to reference storage objects

-- Users
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Tenants
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Orders (Proofs)
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_proof_url TEXT,
ADD COLUMN IF NOT EXISTS delivery_proof_url TEXT,
ADD COLUMN IF NOT EXISTS failed_delivery_proof_url TEXT;

-- Expenses
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS receipt_url TEXT;

-- HR Contracts
ALTER TABLE public.hr_contracts ADD COLUMN IF NOT EXISTS document_url TEXT;

-- Import Purchases
ALTER TABLE public.import_purchases 
ADD COLUMN IF NOT EXISTS invoice_url TEXT,
ADD COLUMN IF NOT EXISTS packing_list_url TEXT;

-- Suppliers
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 2. REALTIME : Enable realtime for critical operational tables
-- This ensures the Notification Center and CEO Dashboard update instantly.

BEGIN;
  -- Remove existing if any
  DROP PUBLICATION IF EXISTS supabase_realtime;
  
  -- Create publication for tables we want to track
  CREATE PUBLICATION supabase_realtime FOR TABLE 
    public.orders, 
    public.notifications, 
    public.deliveries,
    public.expenses;
COMMIT;

-- Note: In Supabase, you also need to enable "Realtime" in the table settings in the UI 
-- or via SQL API if not already done. The above SQL enables the publication.

-- 3. FIX : Redefine CEO Performance Report (Ensuring it exists)
-- This is a copy of 20240417000018_ceo_reporting_rpc.sql to ensure it's applied.

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
