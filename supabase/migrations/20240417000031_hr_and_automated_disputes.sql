-- Migration SHEVA OS v2.5 : Automatisation RH & Robot Litiges
-- Description: Robot d'ouverture de litiges auto et fonctions de calcul de paie.

-- 1. FOCTION : ROBOT DE DÉTECTION DES LITIGES (Colis perdus/oubliés > 24h)
-- Cette fonction peut être appelée par un cron job (pg_cron) chaque nuit.
CREATE OR REPLACE FUNCTION public.fn_robot_open_stale_disputes()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_item RECORD;
    v_count INTEGER := 0;
BEGIN
    -- On cherche les livraisons en cours depuis plus de 24h
    FOR v_item IN 
        SELECT d.*, o.tenant_id 
        FROM deliveries d
        JOIN orders o ON o.id = d.order_id
        WHERE d.status = 'EN_LIVRAISON'
        AND d.arrived_at < (now() - interval '24 hours')
        AND NOT EXISTS (SELECT 1 FROM disputes WHERE mission_id = d.id) -- Pas de litige déjà ouvert
    LOOP
        INSERT INTO disputes (
            tenant_id,
            mission_id,
            livreur_id,
            type,
            status,
            justification,
            deadline
        ) VALUES (
            v_item.tenant_id,
            v_item.id,
            v_item.driver_id,
            'ÉCART_STOCK',
            'LITIGE_OUVERT',
            'Robot: Colis en livraison depuis plus de 24h sans retour ni clôture.',
            (now() + interval '48 hours')::date
        );
        v_count := v_count + 1;
    END LOOP;

    RETURN v_count;
END;
$$;

-- 2. FONCTION : CALCUL AUTO DES COMMISSIONS DU MOIS
CREATE OR REPLACE FUNCTION public.calculate_monthly_commissions(
    p_user_id UUID,
    p_month INTEGER,
    p_year INTEGER
)
RETURNS NUMERIC(15,2)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_commission_rate NUMERIC(15,2);
    v_total_commissions NUMERIC(15,2) := 0;
    v_delivery_count INTEGER;
BEGIN
    -- 1. Récupérer le taux de commission du contrat actif
    SELECT commission_per_delivery INTO v_commission_rate
    FROM hr_contracts
    WHERE user_id = p_user_id AND is_active = true;

    IF v_commission_rate IS NULL THEN RETURN 0; END IF;

    -- 2. Compter les livraisons réussies sur le mois concerné
    SELECT COUNT(*) INTO v_delivery_count
    FROM deliveries
    WHERE driver_id = p_user_id
    AND status = 'LIVRÉE'
    AND EXTRACT(MONTH FROM delivered_at) = p_month
    AND EXTRACT(YEAR FROM delivered_at) = p_year;

    v_total_commissions := v_delivery_count * v_commission_rate;

    RETURN v_total_commissions;
END;
$$;

COMMENT ON FUNCTION fn_robot_open_stale_disputes IS 'Robot de surveillance : ouvre un dossier de litige pour tout colis EN_LIVRAISON depuis > 24h.';
COMMENT ON FUNCTION calculate_monthly_commissions IS 'Calculateur de paie : agrège les commissions de livraison selon les contrats RH.';
