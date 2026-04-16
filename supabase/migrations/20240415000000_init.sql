-- migration: 0001_init.sql
-- Description: Schéma initial de SHEVA OS (Tenants, Profiles, Hubs, Zones, Products)
-- Author: Antigravity (Agent Manager)

-- 1. EXTENSIONS & TYPES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'ceo', 
        'manager', 
        'sav_agent', 
        'sav_manager', 
        'dispatcher', 
        'ops_manager', 
        'driver', 
        'hub', 
        'hub_manager',
        'finance', 
        'ads_manager',
        'achats',
        'stock_manager',
        'super_admin'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. TABLES DE BASE

-- Table des Tenants (Multi-sociétés)
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    settings jsonb DEFAULT '{}'::jsonb
);

-- Table des Profils Utilisateurs
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES public.tenants(id),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role user_role NOT NULL DEFAULT 'sav_agent',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table des Hubs (Points de distribution)
CREATE TABLE IF NOT EXISTS public.hubs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id),
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table des Zones (Unités géographiques de livraison)
CREATE TABLE IF NOT EXISTS public.zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id),
    hub_id UUID REFERENCES public.hubs(id),
    name TEXT NOT NULL,
    delivery_fee NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table des Produits
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id),
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    unit_price NUMERIC NOT NULL,
    min_stock_level INTEGER DEFAULT 5,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table des Niveaux de Stock
CREATE TABLE IF NOT EXISTS public.stock_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    hub_id UUID REFERENCES public.hubs(id),
    total_stock INTEGER DEFAULT 0,
    reserved_stock INTEGER DEFAULT 0,
    available_stock INTEGER GENERATED ALWAYS AS (total_stock - reserved_stock) STORED,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(product_id, hub_id)
);

-- 3. SÉCURITÉ (RLS)
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_levels ENABLE ROW LEVEL SECURITY;

-- 4. POLICIES (Règle d'or : Isolation par tenant_id)

-- Les utilisateurs ne voient que les données de leur propre tenant
CREATE POLICY tenant_isolation_profiles ON public.user_profiles
    FOR ALL USING (id = auth.uid() OR tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()));

CREATE POLICY tenant_isolation_hubs ON public.hubs
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()));

CREATE POLICY tenant_isolation_zones ON public.zones
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()));

CREATE POLICY tenant_isolation_products ON public.products
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()));

CREATE POLICY tenant_isolation_stock ON public.stock_levels
    FOR ALL USING (product_id IN (SELECT id FROM public.products WHERE tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid())));

-- 5. TRIGGERS & FONCTIONS SÉCURISÉES

-- Synchronisation auth.users -> public.user_profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'sav_agent');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Mise à jour automatique de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
