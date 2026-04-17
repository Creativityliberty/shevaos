-- Migration: Supplier Orders & Invoices Automation
-- Description: Adds tables to manage purchasing lifecycle from Order to Payment.

-- Table for Purchase Orders (Bons de Commande)
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id),
    supplier_id UUID NOT NULL REFERENCES public.suppliers(id),
    order_number TEXT NOT NULL, -- Ex: PO-2024-001
    status TEXT NOT NULL DEFAULT 'BROUILLON', -- BROUILLON, ENGOYÉ, REÇU_PARTIEL, REÇU_TOTAL, ANNULÉ
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'XOF',
    expected_delivery_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Table for Order Line Items
CREATE TABLE IF NOT EXISTS public.purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id),
    purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(15,2) NOT NULL DEFAULT 0,
    received_quantity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table for Supplier Invoices (Factures Fournisseurs / Dettes)
CREATE TABLE IF NOT EXISTS public.supplier_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id),
    supplier_id UUID NOT NULL REFERENCES public.suppliers(id),
    purchase_order_id UUID REFERENCES public.purchase_orders(id),
    invoice_number TEXT NOT NULL,
    amount_ht DECIMAL(15,2) NOT NULL DEFAULT 0,
    amount_ttc DECIMAL(15,2) NOT NULL DEFAULT 0,
    remaining_balance DECIMAL(15,2) NOT NULL DEFAULT 0, -- Reste à payer
    status TEXT NOT NULL DEFAULT 'À_PAYER', -- À_PAYER, PARTIELLEMENT_PAYÉ, PAYÉ, LITIGE
    due_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Table for Supplier Payments
CREATE TABLE IF NOT EXISTS public.supplier_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id),
    supplier_id UUID NOT NULL REFERENCES public.suppliers(id),
    amount DECIMAL(15,2) NOT NULL,
    payment_method TEXT NOT NULL, -- ESPÈCES, VIREMENT, MOBILE_MONEY
    reference TEXT, -- Numéro de virement, etc.
    payment_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Tenant Isolation)
CREATE POLICY "tenant_isolation_purchase_orders" ON public.purchase_orders
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()));

CREATE POLICY "tenant_isolation_purchase_order_items" ON public.purchase_order_items
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()));

CREATE POLICY "tenant_isolation_supplier_invoices" ON public.supplier_invoices
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()));

CREATE POLICY "tenant_isolation_supplier_payments" ON public.supplier_payments
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()));

-- Trigger for updated_at on purchase_orders
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_purchase_orders_updated_at
    BEFORE UPDATE ON public.purchase_orders
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Function to handle auto-invoice generation could be added here later
