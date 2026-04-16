-- migration: 0004_tenant_settings.sql
-- Description: Configuration des seuils opérationnels par tenant
-- Author: SHEVA OS Team
-- Date: 2024-04-15

-- Table des paramètres de configuration par tenant
CREATE TABLE IF NOT EXISTS public.tenant_settings (
    tenant_id UUID PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
    
    -- Seuils financiers
    cash_discrepancy_threshold NUMERIC(15,2) NOT NULL DEFAULT 500,
    cash_deposit_warning_hours INTEGER NOT NULL DEFAULT 24,
    cash_deposit_critical_hours INTEGER NOT NULL DEFAULT 48,
    max_cash_per_driver NUMERIC(15,2) NOT NULL DEFAULT 200000,
    
    -- Seuils opérationnels
    stock_alert_threshold INTEGER NOT NULL DEFAULT 10,
    max_orders_per_driver INTEGER NOT NULL DEFAULT 20,
    delivery_timeout_minutes INTEGER NOT NULL DEFAULT 240,
    
    -- Paramètres généraux
    default_currency TEXT NOT NULL DEFAULT 'FCFA',
    timezone TEXT NOT NULL DEFAULT 'Africa/Abidjan',
    
    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Contraintes
    CHECK (cash_discrepancy_threshold >= 0),
    CHECK (stock_alert_threshold >= 0),
    CHECK (max_orders_per_driver > 0),
    CHECK (delivery_timeout_minutes >= 30)
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_tenant_settings_tenant_id ON public.tenant_settings(tenant_id);

-- RLS (Row Level Security)
ALTER TABLE public.tenant_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Chaque tenant ne voit que ses propres paramètres
CREATE POLICY tenant_isolation_settings ON public.tenant_settings
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()));

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_tenant_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tenant_settings_updated_at
    BEFORE UPDATE ON public.tenant_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_tenant_settings_timestamp();

-- Fonction utilitaire pour récupérer les paramètres d'un tenant
CREATE OR REPLACE FUNCTION public.get_tenant_settings(p_tenant_id UUID)
RETURNS TABLE (
    cash_discrepancy_threshold NUMERIC,
    stock_alert_threshold INTEGER,
    cash_deposit_warning_hours INTEGER,
    cash_deposit_critical_hours INTEGER,
    max_cash_per_driver NUMERIC,
    max_orders_per_driver INTEGER,
    delivery_timeout_minutes INTEGER,
    default_currency TEXT,
    timezone TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ts.cash_discrepancy_threshold,
        ts.stock_alert_threshold,
        ts.cash_deposit_warning_hours,
        ts.cash_deposit_critical_hours,
        ts.max_cash_per_driver,
        ts.max_orders_per_driver,
        ts.delivery_timeout_minutes,
        ts.default_currency,
        ts.timezone
    FROM public.tenant_settings ts
    WHERE ts.tenant_id = p_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insertion des paramètres par défaut pour les tenants existants
DO $$
DECLARE
    tenant_record RECORD;
BEGIN
    FOR tenant_record IN SELECT id FROM public.tenants
    LOOP
        INSERT INTO public.tenant_settings (tenant_id)
        VALUES (tenant_record.id)
        ON CONFLICT (tenant_id) DO NOTHING;
    END LOOP;
END;
$$;