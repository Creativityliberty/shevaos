-- RPC pour la gestion des livraisons - Bloc 3
-- Migration: 20240415000006_delivery_rpc.sql

-- RPC 1: Assigner une livraison à un livreur
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
  v_driver_role TEXT;
  v_result JSONB;
BEGIN
  -- Vérifier que l'utilisateur est un dispatcher ou CEO
  SELECT role INTO v_driver_role
  FROM user_profiles 
  WHERE id = auth.uid();
  
  IF v_driver_role NOT IN ('DISPATCHER', 'CEO', 'SUPER_ADMIN') THEN
    RAISE EXCEPTION 'Seuls les dispatchers et CEO peuvent assigner des livraisons';
  END IF;
  
  -- Vérifier le statut de la commande
  SELECT status INTO v_order_status
  FROM orders 
  WHERE id = p_order_id;
  
  IF v_order_status != 'CONFIRMÉE' THEN
    RAISE EXCEPTION 'Seules les commandes CONFIRMÉES peuvent être assignées';
  END IF;
  
  -- Vérifier que le livreur existe et est actif
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = p_driver_id AND role = 'DRIVER' AND active = true
  ) THEN
    RAISE EXCEPTION 'Livreur non trouvé ou inactif';
  END IF;
  
  -- Vérifier que la commande n'est pas déjà assignée
  IF EXISTS (
    SELECT 1 FROM deliveries 
    WHERE order_id = p_order_id AND status != 'ECHEC_LIVRAISON'
  ) THEN
    RAISE EXCEPTION 'Cette commande est déjà assignée à un livreur';
  END IF;
  
  -- Créer la livraison
  INSERT INTO deliveries (order_id, driver_id, status)
  VALUES (p_order_id, p_driver_id, 'ASSIGNÉE')
  RETURNING id INTO v_delivery_id;
  
  -- Mettre à jour le statut de la commande via le trigger
  UPDATE orders SET status = 'ASSIGNÉE' WHERE id = p_order_id;
  
  -- Retourner le résultat
  v_result := jsonb_build_object(
    'success', true,
    'delivery_id', v_delivery_id,
    'message', 'Livraison assignée avec succès'
  );
  
  RETURN v_result;
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'message', 'Erreur lors de l''assignation de la livraison'
  );
END;
$$;

-- RPC 2: Confirmer une livraison réussie
CREATE OR REPLACE FUNCTION confirm_delivery(
  p_delivery_id UUID,
  p_collected_amount NUMERIC(15,2)
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_delivery RECORD;
  v_expected_amount NUMERIC(15,2);
  v_result JSONB;
BEGIN
  -- Récupérer les infos de la livraison
  SELECT d.*, o.cod_amount INTO v_delivery
  FROM deliveries d
  JOIN orders o ON o.id = d.order_id
  WHERE d.id = p_delivery_id AND d.driver_id = auth.uid();
  
  IF v_delivery.id IS NULL THEN
    RAISE EXCEPTION 'Livraison non trouvée ou non autorisée';
  END IF;
  
  -- Vérifier le statut
  IF v_delivery.status != 'EN_LIVRAISON' THEN
    RAISE EXCEPTION 'Seules les livraisons EN_LIVRAISON peuvent être confirmées';
  END IF;
  
  v_expected_amount := v_delivery.cod_amount;
  
  -- Mettre à jour la livraison
  UPDATE deliveries 
  SET status = 'LIVRÉE', delivered_at = now()
  WHERE id = p_delivery_id;
  
  -- Créer l'enregistrement de collecte cash
  INSERT INTO cash_collections (
    delivery_id, driver_id, expected_amount, collected_amount
  ) VALUES (
    p_delivery_id, auth.uid(), v_expected_amount, p_collected_amount
  );
  
  -- Retourner le résultat
  v_result := jsonb_build_object(
    'success', true,
    'message', 'Livraison confirmée avec succès',
    'expected_amount', v_expected_amount,
    'collected_amount', p_collected_amount,
    'difference', p_collected_amount - v_expected_amount
  );
  
  RETURN v_result;
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'message', 'Erreur lors de la confirmation de la livraison'
  );
END;
$$;

-- RPC 3: Reporter un échec de livraison
CREATE OR REPLACE FUNCTION report_failure(
  p_delivery_id UUID,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_delivery RECORD;
  v_result JSONB;
BEGIN
  -- Récupérer les infos de la livraison
  SELECT * INTO v_delivery
  FROM deliveries 
  WHERE id = p_delivery_id AND driver_id = auth.uid();
  
  IF v_delivery.id IS NULL THEN
    RAISE EXCEPTION 'Livraison non trouvée ou non autorisée';
  END IF;
  
  -- Vérifier le statut
  IF v_delivery.status != 'EN_LIVRAISON' THEN
    RAISE EXCEPTION 'Seules les livraisons EN_LIVRAISON peuvent être reportées en échec';
  END IF;
  
  -- Valider le motif
  IF p_reason IS NULL OR LENGTH(TRIM(p_reason)) = 0 THEN
    RAISE EXCEPTION 'Un motif d''échec est obligatoire';
  END IF;
  
  -- Mettre à jour la livraison
  UPDATE deliveries 
  SET 
    status = 'ECHEC_LIVRAISON',
    failed_reason = p_reason,
    delivered_at = now()
  WHERE id = p_delivery_id;
  
  -- Remettre la commande en statut CONFIRMÉE pour reprogrammation
  UPDATE orders 
  SET status = 'CONFIRMÉE' 
  WHERE id = v_delivery.order_id;
  
  -- Retourner le résultat
  v_result := jsonb_build_object(
    'success', true,
    'message', 'Échec de livraison reporté avec succès',
    'reason', p_reason
  );
  
  RETURN v_result;
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'message', 'Erreur lors du report d''échec de livraison'
  );
END;
$$;

-- Commentaires pour documentation
COMMENT ON FUNCTION assign_delivery IS 'Assigner une commande CONFIRMÉE à un livreur. Seulement pour DISPATCHER/CEO.';
COMMENT ON FUNCTION confirm_delivery IS 'Confirmer une livraison réussie et enregistrer la collecte cash. Seulement pour le livreur assigné.';
COMMENT ON FUNCTION report_failure IS 'Reporter un échec de livraison avec motif obligatoire. Seulement pour le livreur assigné.';

-- Grant des permissions
GRANT EXECUTE ON FUNCTION assign_delivery TO authenticated;
GRANT EXECUTE ON FUNCTION confirm_delivery TO authenticated;
GRANT EXECUTE ON FUNCTION report_failure TO authenticated;