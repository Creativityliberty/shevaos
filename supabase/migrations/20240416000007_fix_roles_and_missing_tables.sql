-- migration: 20240416000007_fix_roles_and_missing_tables.sql
-- Description: Correctifs Phase 0 + tables manquantes (Blocs 4 & 5)
-- Author: SHEVA OS — Agent Manager
-- Date: 2026-04-16

-- =============================================================================
-- PARTIE 1 : Ajout des rôles manquants dans l'enum user_role
-- =============================================================================
DO $$ BEGIN
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'achats';
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'stock_manager';
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'hub_manager';
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'ops_manager';
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Certains rôles existaient déjà';
END $$;

-- =============================================================================
-- PARTIE 2 : Ajout de deleted_at (soft-delete) sur les tables existantes
-- =============================================================================
ALTER TABLE public.tenants        ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.user_profiles  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.hubs           ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.zones          ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.products       ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.customers      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.orders         ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- =============================================================================
-- PARTIE 3 : Ajout tenant_id sur deliveries et cash_collections
-- (la migration 0003 ne les incluait pas)
-- =============================================================================
ALTER TABLE public.deliveries
    ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

ALTER TABLE public.cash_collections
    ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

-- Index tenant sur deliveries
CREATE INDEX IF NOT EXISTS idx_deliveries_tenant ON public.deliveries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_tenant_status ON public.deliveries(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_deliveries_tenant_created ON public.deliveries(tenant_id, created_at DESC);

-- Policy tenant_isolation sur deliveries (en plus des policies livreur existantes)
DROP POLICY IF EXISTS "tenant_isolation_deliveries" ON public.deliveries;
CREATE POLICY "tenant_isolation_deliveries" ON public.deliveries
    FOR ALL USING (
        tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid())
        OR driver_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role IN ('dispatcher', 'ceo', 'super_admin', 'ops_manager', 'finance', 'hub_manager', 'hub')
        )
    );

DROP POLICY IF EXISTS "tenant_isolation_cash_collections" ON public.cash_collections;
CREATE POLICY "tenant_isolation_cash_collections" ON public.cash_collections
    FOR ALL USING (
        tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid())
        OR driver_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role IN ('dispatcher', 'ceo', 'super_admin', 'finance', 'hub_manager', 'hub')
        )
    );

-- Correction du bug dans assign_delivery: active → is_active
CREATE OR REPLACE FUNCTION assign_delivery(
  p_order_id UUID,
  p_driver_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_delivery_id UUID;
  v_order_status TEXT;
  v_caller_role TEXT;
  v_result JSONB;
BEGIN
  SELECT role INTO v_caller_role FROM user_profiles WHERE id = auth.uid();
  IF v_caller_role NOT IN ('dispatcher', 'ceo', 'super_admin', 'ops_manager') THEN
    RAISE EXCEPTION 'Seuls les dispatchers et CEO peuvent assigner des livraisons';
  END IF;

  SELECT status INTO v_order_status FROM orders WHERE id = p_order_id;
  IF v_order_status != 'CONFIRMÉE' THEN
    RAISE EXCEPTION 'Seules les commandes CONFIRMÉES peuvent être assignées';
  END IF;

  -- BUG FIX : was "active = true", corrected to "is_active = true"
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = p_driver_id AND role = 'driver' AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Livreur non trouvé ou inactif';
  END IF;

  IF EXISTS (
    SELECT 1 FROM deliveries
    WHERE order_id = p_order_id AND status != 'ECHEC_LIVRAISON'
  ) THEN
    RAISE EXCEPTION 'Cette commande est déjà assignée à un livreur';
  END IF;

  INSERT INTO deliveries (order_id, driver_id, status,
    tenant_id)
  SELECT p_order_id, p_driver_id, 'ASSIGNÉE',
    o.tenant_id
  FROM orders o WHERE o.id = p_order_id
  RETURNING id INTO v_delivery_id;

  UPDATE orders SET status = 'ASSIGNÉE', updated_at = now() WHERE id = p_order_id;

  v_result := jsonb_build_object(
    'success', true,
    'delivery_id', v_delivery_id,
    'message', 'Livraison assignée avec succès'
  );
  RETURN v_result;

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- =============================================================================
-- PARTIE 4 : Correction release_reserved_stock (était un stub NULL)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.release_reserved_stock(p_order_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_hub_id UUID;
    v_item RECORD;
BEGIN
    -- Récupérer le hub lié à la commande
    SELECT h.id INTO v_hub_id
    FROM public.hubs h
    JOIN public.tenants t ON t.id = h.tenant_id
    JOIN public.orders o ON o.tenant_id = t.id
    WHERE o.id = p_order_id
    LIMIT 1;

    -- Libérer le stock réservé pour chaque article
    FOR v_item IN
        SELECT oi.product_id, oi.quantity
        FROM public.order_items oi
        WHERE oi.order_id = p_order_id
    LOOP
        UPDATE public.stock_levels
        SET reserved_stock = GREATEST(0, reserved_stock - v_item.quantity),
            updated_at = now()
        WHERE product_id = v_item.product_id AND hub_id = v_hub_id;
    END LOOP;

    -- Logger le mouvement
    INSERT INTO public.order_events (order_id, event_type, operator_id, metadata)
    VALUES (p_order_id, 'STOCK_RELEASED', auth.uid(),
            jsonb_build_object('reason', 'Annulation commande'));
END;
$$;

-- Trigger décrémentation stock après livraison confirmée
CREATE OR REPLACE FUNCTION public.after_delivery_confirmed()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_hub_id UUID;
    v_item RECORD;
BEGIN
    -- Seulement sur passage EN_LIVRAISON → LIVRÉE
    IF OLD.status = 'EN_LIVRAISON' AND NEW.status = 'LIVRÉE' THEN
        SELECT hub_id INTO v_hub_id FROM public.deliveries WHERE id = NEW.id;
        IF v_hub_id IS NULL THEN
            SELECT h.id INTO v_hub_id FROM public.hubs h
            JOIN public.orders o ON o.tenant_id = h.tenant_id
            WHERE o.id = NEW.order_id LIMIT 1;
        END IF;
        FOR v_item IN
            SELECT oi.product_id, oi.quantity
            FROM public.order_items oi
            WHERE oi.order_id = NEW.order_id
        LOOP
            UPDATE public.stock_levels
            SET total_stock = GREATEST(0, total_stock - v_item.quantity),
                reserved_stock = GREATEST(0, reserved_stock - v_item.quantity),
                updated_at = now()
            WHERE product_id = v_item.product_id AND hub_id = v_hub_id;

            -- Tracer dans stock_movements (table créée dans cette migration)
            INSERT INTO public.stock_movements
                (tenant_id, product_id, hub_id, type, quantity, reference_id, operator_id)
            SELECT o.tenant_id, v_item.product_id, v_hub_id,
                   'SORTIE_LIVRAISON', -v_item.quantity, NEW.order_id, NEW.driver_id
            FROM public.orders o WHERE o.id = NEW.order_id;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$;

-- =============================================================================
-- PARTIE 5 : Table stock_movements
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id),
    product_id UUID NOT NULL REFERENCES public.products(id),
    hub_id UUID REFERENCES public.hubs(id),
    type TEXT NOT NULL CHECK (type IN (
        'ENTREE_FOURNISSEUR', 'SORTIE_LIVRAISON', 'AJUSTEMENT',
        'TRANSFERT_SORTIE', 'TRANSFERT_ENTREE', 'RETOUR'
    )),
    quantity INTEGER NOT NULL,   -- positif = entrée, négatif = sortie
    reference_id UUID,           -- order_id, purchase_order_id, etc.
    operator_id UUID REFERENCES public.user_profiles(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_stock_movements_tenant ON public.stock_movements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON public.stock_movements(tenant_id, product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created ON public.stock_movements(tenant_id, created_at DESC);

CREATE POLICY "tenant_isolation_stock_movements" ON public.stock_movements
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()));

-- Trigger livraison → décrémentation stock (maintenant que stock_movements existe)
DROP TRIGGER IF EXISTS trg_after_delivery_confirmed ON public.deliveries;
CREATE TRIGGER trg_after_delivery_confirmed
    AFTER UPDATE OF status ON public.deliveries
    FOR EACH ROW EXECUTE FUNCTION public.after_delivery_confirmed();

-- =============================================================================
-- PARTIE 6 : Table alerts
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id),
    type TEXT NOT NULL CHECK (type IN (
        'STOCK_CRITIQUE', 'CASH_48H', 'CASH_24H', 'ECART_CAISSE',
        'BUDGET_ADS_90PCT', 'ROAS_SOUS_SEUIL', 'LIVREUR_INACTIF'
    )),
    severity TEXT NOT NULL DEFAULT 'WARNING' CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    reference_id UUID,    -- product_id, driver_id, etc.
    reference_table TEXT, -- 'products', 'deliveries', etc.
    is_read BOOLEAN NOT NULL DEFAULT false,
    is_resolved BOOLEAN NOT NULL DEFAULT false,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_alerts_tenant ON public.alerts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_alerts_tenant_unread ON public.alerts(tenant_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON public.alerts(tenant_id, severity, is_resolved);

CREATE POLICY "tenant_isolation_alerts" ON public.alerts
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()));

-- Alerte automatique si stock < seuil
CREATE OR REPLACE FUNCTION public.check_stock_alert_after_update()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_tenant_id UUID;
    v_product_name TEXT;
    v_threshold INTEGER;
BEGIN
    SELECT p.tenant_id, p.name, p.min_stock_level
    INTO v_tenant_id, v_product_name, v_threshold
    FROM public.products p WHERE p.id = NEW.product_id;

    IF NEW.available_stock <= v_threshold AND NEW.available_stock > 0 THEN
        INSERT INTO public.alerts (tenant_id, type, severity, title, message, reference_id, reference_table)
        VALUES (
            v_tenant_id, 'STOCK_CRITIQUE', 'WARNING',
            'Stock critique : ' || v_product_name,
            'Stock disponible (' || NEW.available_stock || ') ≤ seuil (' || v_threshold || ')',
            NEW.product_id, 'products'
        )
        ON CONFLICT DO NOTHING;
    END IF;

    IF NEW.available_stock <= 0 THEN
        INSERT INTO public.alerts (tenant_id, type, severity, title, message, reference_id, reference_table)
        VALUES (
            v_tenant_id, 'STOCK_CRITIQUE', 'CRITICAL',
            'Rupture de stock : ' || v_product_name,
            'Stock à 0 — Nouvelles commandes bloquées automatiquement',
            NEW.product_id, 'products'
        )
        ON CONFLICT DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_check_stock_alert
    AFTER UPDATE ON public.stock_levels
    FOR EACH ROW EXECUTE FUNCTION public.check_stock_alert_after_update();

-- =============================================================================
-- PARTIE 7 : Tables Bloc 4 — Dépôts et Ledger
-- =============================================================================

-- Table des dépôts cash (livreur → hub → finance)
CREATE TABLE IF NOT EXISTS public.deposits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id),
    driver_id UUID NOT NULL REFERENCES public.user_profiles(id),
    hub_id UUID REFERENCES public.hubs(id),
    declared_amount NUMERIC(15,2) NOT NULL,    -- montant déclaré par le livreur
    counted_amount NUMERIC(15,2),              -- montant compté par le hub
    verified_amount NUMERIC(15,2),             -- montant vérifié par Finance
    status TEXT NOT NULL DEFAULT 'INITIÉ' CHECK (status IN (
        'INITIÉ', 'EN_ATTENTE_HUB', 'COMPTÉ', 'VALIDÉ_HUB', 'VÉRIFIÉ_FINANCE'
    )),
    hub_validated_by UUID REFERENCES public.user_profiles(id),
    hub_validated_at TIMESTAMPTZ,
    finance_verified_by UUID REFERENCES public.user_profiles(id),
    finance_verified_at TIMESTAMPTZ,
    discrepancy_amount NUMERIC(15,2) GENERATED ALWAYS AS
        (COALESCE(counted_amount, 0) - declared_amount) STORED,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_deposits_tenant ON public.deposits(tenant_id);
CREATE INDEX IF NOT EXISTS idx_deposits_driver ON public.deposits(tenant_id, driver_id);
CREATE INDEX IF NOT EXISTS idx_deposits_status ON public.deposits(tenant_id, status, created_at DESC);

-- Livreur voit ses dépôts
CREATE POLICY "drivers_see_own_deposits" ON public.deposits
    FOR SELECT USING (driver_id = auth.uid());

CREATE POLICY "drivers_create_own_deposits" ON public.deposits
    FOR INSERT WITH CHECK (driver_id = auth.uid());

-- Hub et Finance gestion complète
CREATE POLICY "hub_finance_manage_deposits" ON public.deposits
    FOR ALL USING (
        tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid())
        AND EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role IN ('hub', 'hub_manager', 'finance', 'ceo', 'super_admin')
        )
    );

-- FK entre cash_collections et deposits
ALTER TABLE public.cash_collections
    ADD CONSTRAINT fk_cash_collections_deposit
    FOREIGN KEY (deposit_id) REFERENCES public.deposits(id)
    DEFERRABLE INITIALLY DEFERRED
    NOT VALID;

-- Ledger (append-only, immuable — R-FIN-001)
CREATE TABLE IF NOT EXISTS public.ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id),
    type TEXT NOT NULL CHECK (type IN (
        'CASH_COLLECTED', 'CASH_DEPOSITED', 'CASH_VERIFIED',
        'EXPENSE', 'ADJUSTMENT', 'COUNTER_ENTRY'
    )),
    amount NUMERIC(15,2) NOT NULL,   -- positif = crédit, négatif = débit
    reference_id UUID,               -- deposit_id, order_id, etc.
    reference_table TEXT,
    description TEXT NOT NULL,
    operator_id UUID NOT NULL REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    -- ABSOLUMENT PAS de updated_at ni deleted_at — ce ledger est immuable
);

ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_ledger_tenant ON public.ledger_entries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ledger_type ON public.ledger_entries(tenant_id, type);
CREATE INDEX IF NOT EXISTS idx_ledger_created ON public.ledger_entries(tenant_id, created_at DESC);

-- CRITIQUE — Interdire UPDATE et DELETE sur le ledger (R-FIN-001)
CREATE POLICY "ledger_no_update" ON public.ledger_entries
    FOR UPDATE USING (false);

CREATE POLICY "ledger_no_delete" ON public.ledger_entries
    FOR DELETE USING (false);

-- Finance peut insérer (append seulement)
CREATE POLICY "finance_insert_ledger" ON public.ledger_entries
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role IN ('finance', 'ceo', 'super_admin')
        )
    );

-- Finance et CEO peuvent lire
CREATE POLICY "finance_read_ledger" ON public.ledger_entries
    FOR SELECT USING (
        tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid())
        AND EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role IN ('finance', 'ceo', 'super_admin', 'achats')
        )
    );

-- =============================================================================
-- PARTIE 8 : RPC verify_and_ledger_deposit (Finance valide + écrit au ledger)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.verify_and_ledger_deposit(
    p_deposit_id UUID,
    p_verified_amount NUMERIC(15,2),
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_deposit RECORD;
    v_role TEXT;
    v_tenant_id UUID;
    v_discrepancy NUMERIC(15,2);
BEGIN
    -- Vérification du rôle (R-FIN-001)
    SELECT role, tenant_id INTO v_role, v_tenant_id
    FROM public.user_profiles WHERE id = auth.uid();

    IF v_role NOT IN ('finance', 'ceo', 'super_admin') THEN
        RAISE EXCEPTION 'Seul Finance peut vérifier un dépôt';
    END IF;

    -- Récupérer le dépôt
    SELECT * INTO v_deposit FROM public.deposits WHERE id = p_deposit_id;
    IF v_deposit.id IS NULL THEN
        RAISE EXCEPTION 'Dépôt non trouvé';
    END IF;
    IF v_deposit.status != 'VALIDÉ_HUB' THEN
        RAISE EXCEPTION 'Le dépôt doit être VALIDÉ_HUB avant vérification Finance (statut actuel: %)', v_deposit.status;
    END IF;

    -- Mettre à jour le dépôt
    UPDATE public.deposits SET
        status = 'VÉRIFIÉ_FINANCE',
        verified_amount = p_verified_amount,
        finance_verified_by = auth.uid(),
        finance_verified_at = now(),
        notes = COALESCE(p_notes, notes),
        updated_at = now()
    WHERE id = p_deposit_id;

    -- Écrire dans le ledger (append-only)
    INSERT INTO public.ledger_entries (
        tenant_id, type, amount, reference_id, reference_table, description, operator_id
    ) VALUES (
        v_deposit.tenant_id,
        'CASH_VERIFIED',
        p_verified_amount,
        p_deposit_id,
        'deposits',
        'Dépôt vérifié Finance — Livreur: ' || v_deposit.driver_id::TEXT,
        auth.uid()
    );

    -- Si écart > seuil, créer une alerte
    v_discrepancy := ABS(p_verified_amount - v_deposit.declared_amount);
    IF v_discrepancy > 1000 THEN
        INSERT INTO public.alerts (
            tenant_id, type, severity, title, message, reference_id, reference_table
        ) VALUES (
            v_deposit.tenant_id,
            'ECART_CAISSE',
            'CRITICAL',
            'Écart de caisse détecté',
            'Écart de ' || v_discrepancy || ' FCFA sur dépôt #' || p_deposit_id::TEXT,
            p_deposit_id,
            'deposits'
        );
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'deposit_id', p_deposit_id,
        'verified_amount', p_verified_amount,
        'discrepancy', v_discrepancy,
        'message', 'Dépôt vérifié et enregistré au ledger'
    );
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- =============================================================================
-- PARTIE 9 : tenant_settings — table de configuration
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.tenant_settings (
    tenant_id UUID PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
    cash_discrepancy_threshold NUMERIC(15,2) NOT NULL DEFAULT 500,
    cash_deposit_warning_hours INTEGER NOT NULL DEFAULT 24,
    cash_deposit_critical_hours INTEGER NOT NULL DEFAULT 48,
    max_cash_per_driver NUMERIC(15,2) NOT NULL DEFAULT 200000,
    stock_alert_threshold INTEGER NOT NULL DEFAULT 10,
    max_orders_per_driver INTEGER NOT NULL DEFAULT 20,
    delivery_timeout_minutes INTEGER NOT NULL DEFAULT 240,
    default_currency TEXT NOT NULL DEFAULT 'FCFA',
    timezone TEXT NOT NULL DEFAULT 'Africa/Abidjan',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (cash_discrepancy_threshold >= 0),
    CHECK (stock_alert_threshold >= 0),
    CHECK (max_orders_per_driver > 0)
);

ALTER TABLE public.tenant_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_settings" ON public.tenant_settings
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()));

-- Auto-créer les settings pour les tenants existants
INSERT INTO public.tenant_settings (tenant_id)
SELECT id FROM public.tenants
ON CONFLICT (tenant_id) DO NOTHING;

COMMENT ON TABLE public.ledger_entries IS 'Ledger IMMUABLE — aucun UPDATE ni DELETE autorisé. Corrections uniquement par contre-écriture (type=COUNTER_ENTRY).';
COMMENT ON FUNCTION public.verify_and_ledger_deposit IS 'Vérification dépôt + écriture ledger. Seulement pour FINANCE/CEO.';
