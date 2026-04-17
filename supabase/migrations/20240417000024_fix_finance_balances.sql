-- Migration: 20260417000022_fix_finance_balances.sql
-- Description: Mise à jour automatique des soldes pour les transferts et dépôts
-- Author: Antigravity (SHEVA OS Manager)

-- 1. Mise à jour de verify_and_ledger_deposit pour inclure le compte de destination
CREATE OR REPLACE FUNCTION public.verify_and_ledger_deposit(
    p_deposit_id UUID,
    p_verified_amount NUMERIC(15,2),
    p_account_id UUID, -- NOUVEAU : Compte de trésorerie cible
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_deposit RECORD;
    v_role TEXT;
    v_tenant_id UUID;
    v_discrepancy NUMERIC(15,2);
BEGIN
    -- Vérification du rôle
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
        RAISE EXCEPTION 'Le dépôt doit être VALIDÉ_HUB avant vérification Finance';
    END IF;

    -- Vérifier que le compte appartient au bon tenant
    IF NOT EXISTS (SELECT 1 FROM finance_accounts WHERE id = p_account_id AND tenant_id = v_tenant_id) THEN
        RAISE EXCEPTION 'Compte de trésorerie invalide ou introuvable';
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

    -- Mise à jour du solde du compte (Trésorerie)
    UPDATE public.finance_accounts 
    SET balance = balance + p_verified_amount,
        updated_at = now()
    WHERE id = p_account_id;

    -- Écrire dans le ledger (append-only)
    INSERT INTO public.ledger_entries (
        tenant_id, type, amount, reference_id, reference_table, description, operator_id
    ) VALUES (
        v_deposit.tenant_id,
        'CASH_VERIFIED',
        p_verified_amount,
        p_deposit_id,
        'deposits',
        'Dépôt vérifié Finance -> Vers compte: ' || (SELECT name FROM finance_accounts WHERE id = p_account_id),
        auth.uid()
    );

    RETURN jsonb_build_object(
        'success', true,
        'deposit_id', p_deposit_id,
        'verified_amount', p_verified_amount,
        'message', 'Dépôt vérifié, solde compte mis à jour et enregistré au ledger'
    );
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 2. Trigger pour update les balances sur les transferts internes
CREATE OR REPLACE FUNCTION public.after_internal_transfer_completed()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    IF NEW.status = 'COMPLETED' AND (OLD.status IS NULL OR OLD.status != 'COMPLETED') THEN
        -- Débiter le compte source
        UPDATE public.finance_accounts
        SET balance = balance - NEW.amount,
            updated_at = now()
        WHERE id = NEW.from_account_id;

        -- Créditer le compte destination
        UPDATE public.finance_accounts
        SET balance = balance + NEW.amount,
            updated_at = now()
        WHERE id = NEW.to_account_id;
        
        -- Ajouter au ledger (Double écriture)
        INSERT INTO public.ledger_entries (tenant_id, type, amount, reference_id, reference_table, description, operator_id)
        VALUES 
        (NEW.tenant_id, 'ADJUSTMENT', -NEW.amount, NEW.id, 'internal_transfers', 'Transfert INTERNE (Sortie): ' || NEW.description, NEW.operator_id),
        (NEW.tenant_id, 'ADJUSTMENT', NEW.amount, NEW.id, 'internal_transfers', 'Transfert INTERNE (Entrée): ' || NEW.description, NEW.operator_id);
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_after_internal_transfer_completed ON public.internal_transfers;
CREATE TRIGGER trg_after_internal_transfer_completed
    AFTER INSERT OR UPDATE OF status ON public.internal_transfers
    FOR EACH ROW EXECUTE FUNCTION public.after_internal_transfer_completed();

-- 3. Ajout de la colonne pour suivre le compte dans les dépôts (Optionnel mais propre)
ALTER TABLE public.deposits ADD COLUMN IF NOT EXISTS target_account_id UUID REFERENCES public.finance_accounts(id);
