-- LIVRAISONS
CREATE TABLE deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) UNIQUE NOT NULL,
  driver_id UUID REFERENCES user_profiles(id),
  hub_id UUID REFERENCES hubs(id),
  status TEXT NOT NULL DEFAULT 'ASSIGNÉE' CHECK (status IN (
    'ASSIGNÉE','EN_LIVRAISON','LIVRÉE','ECHEC_LIVRAISON','REPROGRAMMÉE'
  )),
  assigned_at TIMESTAMPTZ DEFAULT now(),
  delivered_at TIMESTAMPTZ,
  failed_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- COLLECTES DE CASH (Liées aux livraisons)
CREATE TABLE cash_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id UUID REFERENCES deliveries(id) UNIQUE NOT NULL,
  driver_id UUID REFERENCES user_profiles(id) NOT NULL,
  expected_amount NUMERIC(15,2) NOT NULL,
  collected_amount NUMERIC(15,2) NOT NULL,
  collected_at TIMESTAMPTZ DEFAULT now(),
  deposited BOOLEAN DEFAULT false,
  deposit_id UUID, -- Sera lié plus tard lors du dépôt hub
  created_at TIMESTAMPTZ DEFAULT now()
);

-- INDEX DE PERFORMANCE
CREATE INDEX idx_deliveries_driver ON deliveries(driver_id);
CREATE INDEX idx_deliveries_order ON deliveries(order_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_cash_collections_driver ON cash_collections(driver_id);
CREATE INDEX idx_cash_collections_deposited ON cash_collections(deposited);

-- RLS (ROW LEVEL SECURITY)
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_collections ENABLE ROW LEVEL SECURITY;

-- POLICIES : LIVREURS
CREATE POLICY "drivers_see_own_deliveries" ON deliveries
  FOR SELECT USING (driver_id = auth.uid());

CREATE POLICY "drivers_update_own_deliveries" ON deliveries
  FOR UPDATE USING (driver_id = auth.uid());

CREATE POLICY "drivers_see_own_collections" ON cash_collections
  FOR SELECT USING (driver_id = auth.uid());

-- POLICIES : DISPATCHERS & CEO (Gestion complète)
CREATE POLICY "dispatchers_manage_deliveries" ON deliveries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('dispatcher', 'ceo', 'super_admin')
    )
  );

CREATE POLICY "dispatchers_manage_collections" ON cash_collections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('dispatcher', 'ceo', 'finance', 'super_admin')
    )
  );

-- TRIGGER POUR HISTORIQUE (order_events)
-- On crée un trigger qui log chaque changement de statut de livraison dans order_events
CREATE OR REPLACE FUNCTION log_delivery_event()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) OR (TG_OP = 'INSERT') THEN
    INSERT INTO order_events (order_id, event_type, from_status, to_status, operator_id, metadata)
    VALUES (
      NEW.order_id,
      'DELIVERY_STATUS_CHANGE',
      CASE WHEN TG_OP = 'UPDATE' THEN OLD.status ELSE NULL END,
      NEW.status,
      auth.uid(),
      jsonb_build_object('delivery_id', NEW.id, 'failed_reason', NEW.failed_reason)
    );
    
    -- On synchronise le statut de la commande avec celui de la livraison
    UPDATE orders SET status = NEW.status WHERE id = NEW.order_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_delivery_event
AFTER INSERT OR UPDATE ON deliveries
FOR EACH ROW EXECUTE FUNCTION log_delivery_event();
