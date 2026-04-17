-- Migration SHEVA OS v2.4 : Garde-fous Logistiques (GPS & Timer)
-- Description: Ajout des colonnes de sécurité pour le terrain et mise à jour des RPC de livraison.

-- 1. Mise à jour de la table deliveries
ALTER TABLE public.deliveries 
ADD COLUMN IF NOT EXISTS arrived_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS location_gps JSONB, -- {lat: number, lng: number, accuracy: number}
ADD COLUMN IF NOT EXISTS proof_photo_url TEXT;

-- 2. RPC pour marquer l'arrivée sur zone (déclenche le le timer de 10 min)
CREATE OR REPLACE FUNCTION mark_arrival(
  p_delivery_id UUID,
  p_gps_coords JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE deliveries 
  SET 
    arrived_at = now(),
    location_gps = p_gps_coords,
    status = 'EN_LIVRAISON'
  WHERE id = p_delivery_id AND driver_id = auth.uid();

  RETURN jsonb_build_object('success', true, 'arrived_at', now());
END;
$$;

-- 3. Mise à jour de report_failure avec garde-fou 10 minutes
CREATE OR REPLACE FUNCTION report_failure(
  p_delivery_id UUID,
  p_reason TEXT,
  p_gps_coords JSONB,
  p_proof_photo_url TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_delivery RECORD;
BEGIN
  SELECT * INTO v_delivery 
  FROM deliveries 
  WHERE id = p_delivery_id AND driver_id = auth.uid();

  IF v_delivery.arrived_at IS NULL THEN
    RAISE EXCEPTION 'Vous devez d''abord marquer votre arrivée sur zone.';
  END IF;

  -- GARDE-FOU : 10 minutes d'attente minimum
  IF v_delivery.arrived_at > (now() - interval '10 minutes') THEN
    RAISE EXCEPTION 'Vous devez attendre au moins 10 minutes sur zone avant de déclarer un échec.';
  END IF;

  UPDATE deliveries 
  SET 
    status = 'ECHEC_LIVRAISON',
    failed_reason = p_reason,
    location_gps = p_gps_coords,
    proof_photo_url = p_proof_photo_url,
    delivered_at = now()
  WHERE id = p_delivery_id;

  UPDATE orders SET status = 'CONFIRMÉE' WHERE id = v_delivery.order_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- 4. Mise à jour de confirm_delivery avec GPS et Photo
CREATE OR REPLACE FUNCTION confirm_delivery(
  p_delivery_id UUID,
  p_collected_amount NUMERIC(15,2),
  p_gps_coords JSONB,
  p_proof_photo_url TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_delivery RECORD;
BEGIN
  SELECT d.*, o.cod_amount INTO v_delivery
  FROM deliveries d
  JOIN orders o ON o.id = d.order_id
  WHERE d.id = p_delivery_id AND d.driver_id = auth.uid();

  UPDATE deliveries 
  SET 
    status = 'LIVRÉE', 
    delivered_at = now(),
    location_gps = p_gps_coords,
    proof_photo_url = p_proof_photo_url
  WHERE id = p_delivery_id;

  INSERT INTO cash_collections (
    delivery_id, driver_id, expected_amount, collected_amount
  ) VALUES (
    p_delivery_id, auth.uid(), v_delivery.cod_amount, p_collected_amount
  );

  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION mark_arrival TO authenticated;
GRANT EXECUTE ON FUNCTION report_failure TO authenticated;
GRANT EXECUTE ON FUNCTION confirm_delivery TO authenticated;
