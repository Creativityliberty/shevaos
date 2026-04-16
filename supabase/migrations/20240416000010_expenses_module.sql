-- Ajout du module de gestion des dépenses (Cash-Out)
-- Basé sur la documentation Section DÉPENSES (p.226)

-- 1. Table des catégories de dépenses (Optionnel mais recommandé pour la propreté)
CREATE TYPE expense_category AS ENUM (
  'marketing_ads',
  'carburant',
  'loyer_bureau',
  'rh_salaire',
  'stock_achat',
  'logistique_transitaire',
  'frais_bancaires',
  'divers'
);

-- 2. Table des dépenses
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  operator_id UUID REFERENCES public.user_profiles(id),
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  category expense_category NOT NULL,
  description TEXT,
  proof_url TEXT, -- Lien vers le justificatif (Supabase Storage)
  expense_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. RLS Policies
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_expenses" ON public.expenses
  FOR ALL USING (tenant_id = get_auth_tenant_id());

-- 4. Vues de synthèse financière mise à jour
-- CA Vérifié vs Dépenses vs CA en Transit
DROP VIEW IF EXISTS public.v_financial_performance;
CREATE OR REPLACE VIEW public.v_financial_performance AS
WITH daily_revenue AS (
  SELECT 
    tenant_id,
    date_trunc('day', created_at) as day,
    SUM(amount) FILTER (WHERE type = 'CASH_VERIFIED') as verified_income,
    SUM(amount) FILTER (WHERE type = 'MISSION_CASH') as transit_income
  FROM public.ledger_entries
  GROUP BY tenant_id, date_trunc('day', created_at)
),
daily_expenses AS (
  SELECT 
    tenant_id,
    date_trunc('day', expense_date) as day,
    SUM(amount) as total_expense
  FROM public.expenses
  GROUP BY tenant_id, date_trunc('day', expense_date)
)
SELECT 
  COALESCE(r.tenant_id, e.tenant_id) as tenant_id,
  COALESCE(r.day, e.day) as day,
  COALESCE(r.verified_income, 0) as verified_income,
  COALESCE(r.transit_income, 0) as transit_income,
  COALESCE(e.total_expense, 0) as total_expense,
  COALESCE(r.verified_income, 0) - COALESCE(e.total_expense, 0) as net_profit
FROM daily_revenue r
FULL OUTER JOIN daily_expenses e ON r.day = e.day AND r.tenant_id = e.tenant_id;

-- 5. Trigger pour updated_at
CREATE TRIGGER update_expenses_updated_at 
  BEFORE UPDATE ON public.expenses 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
