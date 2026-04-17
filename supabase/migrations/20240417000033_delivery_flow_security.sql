-- Migration SHEVA OS v2.5 : Sécurité Terrain (Start/Arrival)
-- Description: RPC pour forcer le flux Chargement -> Démarrage -> Arrivée.

-- 1. RPC : Démarrer la livraison
CREATE OR REPLACE FUNCTION public.start_delivery(p_delivery_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_status TEXT;
    v_driver_id UUID;
BEGIN
    SELECT status, driver_id INTO v_status, v_driver_id FROM public.deliveries WHERE id = p_delivery_id;
    
    IF v_driver_id != auth.uid() THEN
        RAISE EXCEPTION 'Non autorisé';
    END IF;

    IF v_status != 'CHARGÉE_PAR_HUB' THEN
        RAISE EXCEPTION 'Vous devez faire valider votre chargement au Hub avant de démarrer.';
    END IF;

    UPDATE public.deliveries SET status = 'EN_LIVRAISON', updated_at = now() WHERE id = p_delivery_id;
    
    -- Sync commande
    UPDATE public.orders SET status = 'EN_LIVRAISON' WHERE id = (SELECT order_id FROM public.deliveries WHERE id = p_delivery_id);

    RETURN jsonb_build_object('success', true);
END;
$$;

-- 2. RPC : Marquer l'arrivée sur zone
CREATE OR REPLACE FUNCTION public.mark_arrived(p_delivery_id UUID, p_location_gps TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_status TEXT;
    v_driver_id UUID;
BEGIN
    SELECT status, driver_id INTO v_status, v_driver_id FROM public.deliveries WHERE id = p_delivery_id;

    IF v_driver_id != auth.uid() THEN
        RAISE EXCEPTION 'Non autorisé';
    END IF;

    IF v_status != 'EN_LIVRAISON' THEN
        RAISE EXCEPTION 'La livraison doit être en cours pour marquer l''arrivée.';
    END IF;

    UPDATE public.deliveries SET 
        arrived_at = now(),
        location_gps = p_location_gps,
        updated_at = now()
    WHERE id = p_delivery_id;

    RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.start_delivery TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_arrived TO authenticated;
