-- Migration: Follow-up RPC
-- Description: Identifies orders that require customer service attention (SAV/Follow-up).

CREATE OR REPLACE FUNCTION public.get_orders_needing_followup()
RETURNS TABLE (
    id UUID,
    order_number TEXT,
    customer_name TEXT,
    customer_phone TEXT,
    status TEXT,
    created_at TIMESTAMPTZ,
    last_update TIMESTAMPTZ,
    reason TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tenant_id uuid;
BEGIN
    SELECT tenant_id INTO v_tenant_id FROM public.user_profiles WHERE id = auth.uid();

    RETURN QUERY
    -- Case 1: Orders confirmed but not assigned for > 12h
    SELECT 
        o.id, o.order_number, o.customer_name, o.customer_phone, o.status, o.created_at, o.updated_at,
        'RETARD_ASSIGNATION'::text as reason
    FROM public.orders o
    WHERE o.tenant_id = v_tenant_id
    AND o.status = 'CONFIRMÉE'
    AND o.updated_at < (now() - interval '12 hours')
    
    UNION ALL

    -- Case 2: Delivery failures
    SELECT 
        o.id, o.order_number, o.customer_name, o.customer_phone, o.status, o.created_at, o.updated_at,
        'ECHEC_LIVRAISON'::text as reason
    FROM public.orders o
    WHERE o.tenant_id = v_tenant_id
    AND o.status = 'ECHEC_LIVRAISON'
    
    UNION ALL

    -- Case 3: Stuck in delivery for > 24h
    SELECT 
        o.id, o.order_number, o.customer_name, o.customer_phone, o.status, o.created_at, o.updated_at,
        'REQUIS_POINT_DRIVER'::text as reason
    FROM public.orders o
    WHERE o.tenant_id = v_tenant_id
    AND o.status = 'EN_LIVRAISON'
    AND o.updated_at < (now() - interval '24 hours');
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_orders_needing_followup() TO authenticated;
