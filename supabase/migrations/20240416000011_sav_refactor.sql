-- Migration SAV v2.0 : Alignement sur la documentation AppSheet (Service Client)
-- Basé sur les colonnes 70 à 95 de la doc (GPS, Chrono, Relances, Confiance)

ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS delivery_lat DECIMAL(9,6),
  ADD COLUMN IF NOT EXISTS delivery_lng DECIMAL(9,6),
  ADD COLUMN IF NOT EXISTS secondary_phone TEXT,
  ADD COLUMN IF NOT EXISTS delivery_window TEXT, -- Morning, Afternoon, Evening
  ADD COLUMN IF NOT EXISTS last_callback_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS callback_notes TEXT,
  ADD COLUMN IF NOT EXISTS waiting_chrono_start TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS arrival_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS badge_relance TEXT;

-- Ajout d'une colonne de confiance sur les profils clients (si disponibles)
-- Pour l'instant on se base sur le customer_id ou le téléphone
CREATE OR REPLACE VIEW public.v_customer_scoring AS
SELECT 
  customer_id,
  COUNT(*) FILTER (WHERE status = 'delivered') as successful_deliveries,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_deliveries,
  CASE 
    WHEN COUNT(*) FILTER (WHERE status = 'failed') >= 3 THEN 'BLACKLISTÉ'
    WHEN COUNT(*) FILTER (WHERE status = 'delivered') > 5 THEN 'VIP'
    WHEN COUNT(*) FILTER (WHERE status = 'delivered') = 0 THEN 'NOUVEAU'
    ELSE 'HABITUÉ'
  END as trust_score
FROM public.orders
GROUP BY customer_id;

-- Commentaire pour documentation
COMMENT ON COLUMN public.orders.delivery_window IS 'Plage horaire de livraison (MATIN, MIDI, SOIR)';
