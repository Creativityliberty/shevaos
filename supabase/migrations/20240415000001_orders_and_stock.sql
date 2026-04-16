-- migration: 0002_orders_and_stock.sql
-- Description: Schéma pour les clients, produits, stocks et commandes
-- Author: Antigravity

-- 1. TABLES DE RÉFÉRENTIEL

-- Table des Clients
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    secondary_phone TEXT,
    address TEXT,
    city TEXT,
    zone_id UUID REFERENCES public.zones(id),
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'VIP', 'BLACKLISTED', 'INACTIVE')),
    notes TEXT,
    total_orders INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(tenant_id, phone)
);

-- 2. TABLES DES COMMANDES

-- Table des Commandes
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) NOT NULL,
    order_number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES public.customers(id) NOT NULL,
    zone_id UUID REFERENCES public.zones(id) NOT NULL,
    status TEXT NOT NULL DEFAULT 'BROUILLON' CHECK (status IN (
      'BROUILLON', 'CONFIRMÉE', 'ASSIGNÉE', 'EN_LIVRAISON', 'LIVRÉE', 
      'ECHEC_LIVRAISON', 'REPROGRAMMÉE', 'ANNULÉE', 'ENCAISSÉE', 'DÉPOSÉE', 'VÉRIFIÉE'
    )),
    total_amount NUMERIC(15,2) NOT NULL DEFAULT 0, -- Montant total de la commande
    cod_amount NUMERIC(15,2) NOT NULL DEFAULT 0,   -- Montant à collecter (Cash on Delivery)
    delivery_fee NUMERIC(15,2) DEFAULT 0,          -- Frais de livraison (pouvant être mis à 0)
    delivery_address TEXT NOT NULL,
    source TEXT,                                   -- WhatsApp, Facebook, Call, Web
    campaign_id UUID,                              -- Lien avec marketing
    sav_agent_id UUID REFERENCES public.user_profiles(id),
    notes TEXT,
    attempt_count INTEGER DEFAULT 0,
    confirmed_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table des Articles de Commande (Order Items)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(15,2) NOT NULL,
    subtotal NUMERIC(15,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

-- Table des Événements de Commande (Timeline/Audit)
CREATE TABLE IF NOT EXISTS public.order_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    event_type TEXT NOT NULL,
    from_status TEXT,
    to_status TEXT,
    operator_id UUID REFERENCES public.user_profiles(id),
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. SÉCURITÉ (RLS)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY tenant_isolation_customers ON public.customers
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()));

CREATE POLICY tenant_isolation_orders ON public.orders
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()));

CREATE POLICY tenant_isolation_order_items ON public.order_items
    FOR ALL USING (order_id IN (SELECT id FROM public.orders WHERE tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid())));

CREATE POLICY tenant_isolation_order_events ON public.order_events
    FOR ALL USING (order_id IN (SELECT id FROM public.orders WHERE tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid())));

-- 4. FONCTIONS & LOGIQUE

-- Fonction pour générer le numéro de commande : SHEVA-CMD-YYYY-XXXXX
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
    current_year TEXT;
    new_serial INTEGER;
    tenant_slug TEXT;
BEGIN
    current_year := to_char(now(), 'YYYY');
    
    -- On récupère ou initialise le compteur pour le tenant et l'année
    -- (On pourrait utiliser une table de séquences par tenant si besoin de haute performance)
    SELECT count(*) + 1 INTO new_serial 
    FROM public.orders 
    WHERE tenant_id = NEW.tenant_id 
    AND to_char(created_at, 'YYYY') = current_year;

    NEW.order_number := 'SHEVA-CMD-' || current_year || '-' || LPAD(new_serial::text, 5, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_order_number
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
    EXECUTE PROCEDURE public.generate_order_number();

-- Trigger pour logger les changements de statut
CREATE OR REPLACE FUNCTION public.log_order_event()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO public.order_events (order_id, event_type, from_status, to_status, operator_id)
        VALUES (NEW.id, 'STATUS_CHANGE', OLD.status, NEW.status, auth.uid());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_order_status_change
    AFTER UPDATE OF status ON public.orders
    FOR EACH ROW
    EXECUTE PROCEDURE public.log_order_event();
