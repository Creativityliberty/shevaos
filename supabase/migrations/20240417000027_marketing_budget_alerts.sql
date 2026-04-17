-- Migration: 20260417000027_marketing_budget_alerts.sql
-- Description: Surveillance automatique des budgets publicitaires et génération d'alertes à 90% de consommation.

-- 1. Fonction de vérification du budget
CREATE OR REPLACE FUNCTION public.check_marketing_budget_overflow()
RETURNS TRIGGER AS $$
DECLARE
    v_total_spent NUMERIC(15,2);
    v_budget NUMERIC(15,2);
    v_campaign_name TEXT;
    v_tenant_id UUID;
BEGIN
    -- Récupérer les infos de la campagne
    SELECT name, total_budget, tenant_id 
    INTO v_campaign_name, v_budget, v_tenant_id
    FROM public.marketing_campaigns 
    WHERE id = NEW.campaign_id;

    -- Si pas de budget défini, on sort
    IF v_budget IS NULL OR v_budget <= 0 THEN
        RETURN NEW;
    END IF;

    -- Calculer le total dépensé pour cette campagne
    SELECT SUM(spend_amount) INTO v_total_spent
    FROM public.marketing_spend_logs
    WHERE campaign_id = NEW.campaign_id;

    -- Vérifier si on dépasse le seuil de 90%
    IF v_total_spent >= (v_budget * 0.9) THEN
        -- Insérer l'alerte (avec ON CONFLICT pour éviter les doublons ou simplement vérifier l'existence)
        -- On utilise un message clair incluant le pourcentage
        INSERT INTO public.alerts (
            tenant_id, 
            type, 
            severity, 
            title, 
            message, 
            reference_id, 
            reference_table
        )
        SELECT 
            v_tenant_id, 
            'BUDGET_ADS_90PCT', 
            CASE WHEN v_total_spent >= v_budget THEN 'CRITICAL' ELSE 'WARNING' END,
            'Budget Ads : ' || v_campaign_name,
            'La campagne a consommé ' || ROUND((v_total_spent / v_budget) * 100, 1) || '% de son budget total (' || v_total_spent || ' / ' || v_budget || ')',
            NEW.campaign_id,
            'marketing_campaigns'
        WHERE NOT EXISTS (
            -- Éviter de recréer l'alerte si une non-résolue existe déjà pour cette campagne
            SELECT 1 FROM public.alerts 
            WHERE reference_id = NEW.campaign_id 
            AND type = 'BUDGET_ADS_90PCT' 
            AND is_resolved = false
            AND created_at > now() - interval '24 hours' -- Repousser l'alerte toutes les 24h si toujours critique
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger sur les logs de dépenses
DROP TRIGGER IF EXISTS trg_check_marketing_budget_overflow ON public.marketing_spend_logs;
CREATE TRIGGER trg_check_marketing_budget_overflow
    AFTER INSERT OR UPDATE ON public.marketing_spend_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.check_marketing_budget_overflow();

COMMENT ON FUNCTION public.check_marketing_budget_overflow IS 'Surveille la consommation budgétaire des campagnes marketing et alerte le CEO/Manager à 90%.';
