-- Migration SHEVA OS v2.6 : CRM SAV & Rappels
-- Description: Supports pour le suivi client et la planification des relances.

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS next_recall_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_call_at TIMESTAMPTZ;

-- Index pour la file d'attente SAV
CREATE INDEX IF NOT EXISTS idx_orders_recall ON public.orders(tenant_id, next_recall_at) 
WHERE status IN ('BROUILLON', 'REPROGRAMMÉE', 'ECHEC_LIVRAISON');

COMMENT ON COLUMN public.orders.next_recall_at IS 'Date programmée pour le prochain rappel client (SAV).';
COMMENT ON COLUMN public.orders.attempt_count IS 'Nombre de tentatives d''appel effectuées par le SAV.';
