-- migration: 0003_rpc_create_order.sql
-- Description: Fonction atomique pour la création de commande avec vérification de stock
-- Author: Antigravity

CREATE OR REPLACE FUNCTION public.create_order_with_stock_check(
    p_tenant_id UUID,
    p_customer_id UUID,
    p_zone_id UUID,
    p_sav_agent_id UUID,
    p_delivery_address TEXT,
    p_cod_amount NUMERIC(15,2),
    p_delivery_fee NUMERIC(15,2),
    p_items JSONB -- [{product_id: UUID, quantity: INT, unit_price: NUMERIC}, ...]
)
RETURNS UUID AS $$
DECLARE
    v_order_id UUID;
    v_item JSONB;
    v_product_id UUID;
    v_quantity INTEGER;
    v_available_stock INTEGER;
    v_hub_id UUID;
    v_total_amount NUMERIC(15,2) := 0;
BEGIN
    -- 1. Récupérer le Hub par défaut pour ce tenant/zone (On prend le premier hub trouvé pour simplifier le MVP)
    SELECT id INTO v_hub_id FROM public.hubs WHERE tenant_id = p_tenant_id LIMIT 1;
    
    IF v_hub_id IS NULL THEN
        RAISE EXCEPTION 'Aucun Hub de distribution configuré pour ce tenant.';
    END IF;

    -- 2. Vérification de la disponibilité du stock pour TOUS les articles
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_product_id := (v_item->>'product_id')::UUID;
        v_quantity := (v_item->>'quantity')::INTEGER;
        v_total_amount := v_total_amount + ((v_item->>'unit_price')::NUMERIC * v_quantity);

        -- Vérifier le stock disponible au Hub
        SELECT available_stock INTO v_available_stock 
        FROM public.stock_levels 
        WHERE product_id = v_product_id AND hub_id = v_hub_id;

        IF v_available_stock IS NULL OR v_available_stock < v_quantity THEN
            RAISE EXCEPTION 'Stock insuffisant pour le produit % (Disponible: %, Demandé: %)', 
                (SELECT name FROM public.products WHERE id = v_product_id), 
                COALESCE(v_available_stock, 0), 
                v_quantity;
        END IF;
    END LOOP;

    -- 3. Création de la commande
    INSERT INTO public.orders (
        tenant_id, 
        customer_id, 
        zone_id, 
        sav_agent_id, 
        delivery_address, 
        cod_amount, 
        delivery_fee,
        total_amount,
        status,
        confirmed_at
    )
    VALUES (
        p_tenant_id, 
        p_customer_id, 
        p_zone_id, 
        p_sav_agent_id, 
        p_delivery_address, 
        p_cod_amount, 
        p_delivery_fee,
        v_total_amount,
        'CONFIRMÉE',
        now()
    )
    RETURNING id INTO v_order_id;

    -- 4. Insertion des articles et réservation du stock
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_product_id := (v_item->>'product_id')::UUID;
        v_quantity := (v_item->>'quantity')::INTEGER;

        -- Insérer l'item
        INSERT INTO public.order_items (order_id, product_id, quantity, unit_price)
        VALUES (v_order_id, v_product_id, v_quantity, (v_item->>'unit_price')::NUMERIC);

        -- Réserver le stock (diminue quantity_available implicitement via trigger ou manuellement ici)
        -- Dans notre schéma migration 0001 : available_stock est générée depuis (total_stock - reserved_stock)
        -- Donc on doit augmenter reserved_stock
        UPDATE public.stock_levels 
        SET reserved_stock = reserved_stock + v_quantity
        WHERE product_id = v_product_id AND hub_id = v_hub_id;
    END LOOP;

    -- 5. Création de l'événement initial
    INSERT INTO public.order_events (order_id, event_type, to_status, operator_id, metadata)
    VALUES (v_order_id, 'ORDER_CREATED', 'CONFIRMÉE', p_sav_agent_id, jsonb_build_object('items_count', jsonb_array_length(p_items)));

    RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
