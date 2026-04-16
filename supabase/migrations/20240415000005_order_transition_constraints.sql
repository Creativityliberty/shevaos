-- migration: 0005_order_transition_constraints.sql
-- Description: Contraintes de transition d'état pour les commandes
-- Author: SHEVA OS Team
-- Date: 2024-04-15

-- Fonction de validation des transitions d'état des commandes
CREATE OR REPLACE FUNCTION public.validate_order_transition()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    -- Si c'est une nouvelle insertion, on laisse passer
    IF (TG_OP = 'INSERT') THEN
        RETURN NEW;
    END IF;
    
    -- Si le statut n'a pas changé, on laisse passer
    IF (OLD.status IS NOT DISTINCT FROM NEW.status) THEN
        RETURN NEW;
    END IF;
    
    -- Règles de transition basées sur state-machines.md
    
    -- 1. Transition BROUILLON → CONFIRMÉE (seulement par SAV)
    IF OLD.status = 'BROUILLON' AND NEW.status = 'CONFIRMÉE' THEN
        -- Vérifier que l'utilisateur a le rôle SAV
        IF NOT EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role IN ('SAV_AGENT', 'SAV_MANAGER', 'CEO', 'SUPER_ADMIN')
        ) THEN
            RAISE EXCEPTION 'Seul le SAV peut confirmer une commande';
        END IF;
        RETURN NEW;
    END IF;
    
    -- 2. Transition CONFIRMÉE → ASSIGNÉE (seulement par DISPATCHER)
    IF OLD.status = 'CONFIRMÉE' AND NEW.status = 'ASSIGNÉE' THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role IN ('DISPATCHER', 'CEO', 'SUPER_ADMIN')
        ) THEN
            RAISE EXCEPTION 'Seul le dispatcher peut assigner une commande';
        END IF;
        RETURN NEW;
    END IF;
    
    -- 3. Transition ASSIGNÉE → EN_LIVRAISON (seulement par LIVREUR assigné)
    IF OLD.status = 'ASSIGNÉE' AND NEW.status = 'EN_LIVRAISON' THEN
        -- Vérifier que c'est le livreur assigné qui fait la transition
        IF NOT EXISTS (
            SELECT 1 FROM public.deliveries d
            WHERE d.order_id = NEW.id AND d.driver_id = auth.uid()
        ) THEN
            RAISE EXCEPTION 'Seul le livreur assigné peut démarrer la livraison';
        END IF;
        RETURN NEW;
    END IF;
    
    -- 4. Transition EN_LIVRAISON → LIVRÉE (seulement par LIVREUR avec encaissement)
    IF OLD.status = 'EN_LIVRAISON' AND NEW.status = 'LIVRÉE' THEN
        -- Vérifier que c'est le livreur assigné
        IF NOT EXISTS (
            SELECT 1 FROM public.deliveries d
            WHERE d.order_id = NEW.id AND d.driver_id = auth.uid()
        ) THEN
            RAISE EXCEPTION 'Seul le livreur assigné peut confirmer la livraison';
        END IF;
        
        -- Vérifier qu'il y a une collecte de cash associée
        IF NOT EXISTS (
            SELECT 1 FROM public.deliveries d
            JOIN public.cash_collections cc ON cc.delivery_id = d.id
            WHERE d.order_id = NEW.id
        ) THEN
            RAISE EXCEPTION 'La livraison nécessite une collecte de cash';
        END IF;
        RETURN NEW;
    END IF;
    
    -- 5. Transition vers ANNULÉE (seulement par SAV_MANAGER+)
    IF NEW.status = 'ANNULÉE' THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role IN ('SAV_MANAGER', 'CEO', 'SUPER_ADMIN')
        ) THEN
            RAISE EXCEPTION 'Seul un manager SAV peut annuler une commande';
        END IF;
        
        -- Vérifier que la commande n'est pas déjà livrée ou vérifiée
        IF OLD.status IN ('LIVRÉE', 'ENCAISSÉE', 'DÉPOSÉE', 'VÉRIFIÉE') THEN
            RAISE EXCEPTION 'Impossible d''annuler une commande déjà livrée';
        END IF;
        RETURN NEW;
    END IF;
    
    -- 6. Transition vers VÉRIFIÉE (seulement par FINANCE)
    IF NEW.status = 'VÉRIFIÉE' THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role IN ('FINANCE', 'CEO', 'SUPER_ADMIN')
        ) THEN
            RAISE EXCEPTION 'Seul la finance peut vérifier une commande';
        END IF;
        
        -- Vérifier que le dépôt a été validé
        IF NOT EXISTS (
            SELECT 1 FROM public.deliveries d
            JOIN public.cash_collections cc ON cc.delivery_id = d.id
            JOIN public.deposits dep ON dep.id = cc.deposit_id
            WHERE d.order_id = NEW.id AND dep.status = 'VALIDÉ_HUB'
        ) THEN
            RAISE EXCEPTION 'Le dépôt doit être validé avant vérification';
        END IF;
        RETURN NEW;
    END IF;
    
    -- 7. Transitions interdites (état terminal)
    IF OLD.status = 'ANNULÉE' THEN
        RAISE EXCEPTION 'Impossible de modifier une commande annulée';
    END IF;
    
    IF OLD.status = 'VÉRIFIÉE' THEN
        RAISE EXCEPTION 'Impossible de modifier une commande vérifiée';
    END IF;
    
    -- 8. Transitions interdites (saut d'étapes)
    IF OLD.status = 'CONFIRMÉE' AND NEW.status = 'LIVRÉE' THEN
        RAISE EXCEPTION 'Transition interdite: CONFIRMÉE → LIVRÉE (doit passer par ASSIGNÉE + EN_LIVRAISON)';
    END IF;
    
    IF OLD.status = 'ASSIGNÉE' AND NEW.status = 'VÉRIFIÉE' THEN
        RAISE EXCEPTION 'Transition interdite: ASSIGNÉE → VÉRIFIÉE';
    END IF;
    
    -- Pour les autres transitions, on accepte
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        -- Log l'erreur dans order_events
        INSERT INTO public.order_events (order_id, event_type, from_status, to_status, operator_id, metadata)
        VALUES (
            NEW.id,
            'TRANSITION_ERROR',
            OLD.status,
            NEW.status,
            auth.uid(),
            jsonb_build_object('error', SQLERRM)
        );
        RAISE;
END;
$$;

-- Trigger pour valider les transitions
CREATE TRIGGER trg_validate_order_transition
    BEFORE UPDATE OF status ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_order_transition();

-- Fonction pour annuler une commande avec motif
CREATE OR REPLACE FUNCTION public.cancel_order_with_reason(
    p_order_id UUID,
    p_reason TEXT,
    p_operator_id UUID
)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_order_status TEXT;
    v_cancellation_reasons TEXT[] := ARRAY[
        'Doublon', 'Client injoignable', 'Client a annulé',
        'Produit indisponible', 'Adresse incorrecte', 'Hors zone', 'Autre'
    ];
BEGIN
    -- Vérifier que le motif est valide
    IF p_reason NOT IN (SELECT unnest(v_cancellation_reasons)) THEN
        RAISE EXCEPTION 'Motif d''annulation invalide. Doit être parmi: %, %, %, %, %, %, %',
            v_cancellation_reasons[1], v_cancellation_reasons[2], v_cancellation_reasons[3],
            v_cancellation_reasons[4], v_cancellation_reasons[5], v_cancellation_reasons[6],
            v_cancellation_reasons[7];
    END IF;
    
    -- Récupérer le statut actuel
    SELECT status INTO v_order_status
    FROM public.orders WHERE id = p_order_id;
    
    -- Vérifier que la commande peut être annulée
    IF v_order_status IN ('LIVRÉE', 'ENCAISSÉE', 'DÉPOSÉE', 'VÉRIFIÉE') THEN
        RAISE EXCEPTION 'Impossible d''annuler une commande déjà livrée ou vérifiée';
    END IF;
    
    -- Annuler la commande
    UPDATE public.orders
    SET status = 'ANNULÉE',
        updated_at = now()
    WHERE id = p_order_id
    RETURNING id;
    
    -- Logger l'événement avec le motif
    INSERT INTO public.order_events (order_id, event_type, from_status, to_status, operator_id, metadata)
    VALUES (
        p_order_id,
        'ORDER_CANCELLED',
        v_order_status,
        'ANNULÉE',
        p_operator_id,
        jsonb_build_object('reason', p_reason)
    );
    
    -- Libérer le stock réservé si la commande était confirmée
    IF v_order_status = 'CONFIRMÉE' THEN
        PERFORM public.release_reserved_stock(p_order_id);
    END IF;
    
    RETURN p_order_id;
END;
$$;

-- Fonction pour libérer le stock réservé (à implémenter plus tard)
CREATE OR REPLACE FUNCTION public.release_reserved_stock(p_order_id UUID)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
    -- Cette fonction sera implémentée dans une migration future
    -- pour gérer la libération du stock lors de l'annulation
    NULL;
END;
$$;