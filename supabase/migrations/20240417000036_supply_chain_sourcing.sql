-- Migration SHEVA OS v2.8 : Supply Chain & Sourcing
-- Description: Tables pour la gestion des commandes fournisseurs et des dettes.

-- 1. Table des Commandes Fournisseurs (CMD)
CREATE TABLE IF NOT EXISTS public.supplier_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE,
    order_reference TEXT UNIQUE NOT NULL, -- Ex: CMD-2024-001
    total_amount_currency NUMERIC DEFAULT 0, -- Montant en devise (CNY, USD, etc)
    currency TEXT DEFAULT 'CNY',
    exchange_rate NUMERIC DEFAULT 1, -- Taux au jour de la commande
    total_amount_fca NUMERIC DEFAULT 0, -- Montant converti en FCFA
    status TEXT DEFAULT 'BROUILLON' CHECK (status IN ('BROUILLON', 'CONFIRMÉE', 'EN_TRANSIT', 'DOUANE', 'ARRIVÉE', 'ANNULÉE')),
    estimated_arrival_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Table des Paiements Fournisseurs
CREATE TABLE IF NOT EXISTS public.supplier_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.supplier_orders(id) ON DELETE SET NULL,
    amount_fca NUMERIC NOT NULL,
    payment_method TEXT NOT NULL, -- Ex: Wave, Chèque, Cash
    payment_date DATE DEFAULT current_date,
    reference_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Vue pour la balance fournisseurs (Dette en temps réel)
CREATE OR REPLACE VIEW public.v_supplier_balances AS
SELECT 
    s.id,
    s.name,
    s.tenant_id,
    COALESCE(SUM(so.total_amount_fca) FILTER (WHERE so.status != 'ANNULÉE'), 0) as total_ordered,
    COALESCE(SUM(sp.amount_fca), 0) as total_paid,
    (COALESCE(SUM(so.total_amount_fca) FILTER (WHERE so.status != 'ANNULÉE'), 0) - COALESCE(SUM(sp.amount_fca), 0)) as balance
FROM public.suppliers s
LEFT JOIN public.supplier_orders so ON s.id = so.supplier_id
LEFT JOIN public.supplier_payments sp ON s.id = sp.supplier_id
GROUP BY s.id, s.name, s.tenant_id;

-- 4. RLS pour les commandes fournisseurs
ALTER TABLE public.supplier_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only see their tenant's supplier orders" ON public.supplier_orders
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()));

ALTER TABLE public.supplier_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only see their tenant's supplier payments" ON public.supplier_payments
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()));

-- Indexation
CREATE INDEX idx_supplier_orders_status ON public.supplier_orders(status);
CREATE INDEX idx_supplier_orders_supplier ON public.supplier_orders(supplier_id);
