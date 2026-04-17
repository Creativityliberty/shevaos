-- Migration SHEVA OS v2.4 : Conformité Opérationnelle Process 1 & 2
-- Description: Verrous de statuts pour le Hub et les retours soir.

-- 1. MISE À JOUR DES STATUTS DE COMMANDE
-- On ajoute 'CHARGÉE_PAR_HUB' pour respecter la règle P1-5.1
DO $$ BEGIN
    ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
    ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK (status IN (
      'BROUILLON', 'CONFIRMÉE', 'ASSIGNÉE', 'CHARGÉE_PAR_HUB', 'EN_LIVRAISON', 'LIVRÉE', 
      'ECHEC_LIVRAISON', 'REPROGRAMMÉE', 'ANNULÉE', 'ENCAISSÉE', 'DÉPOSÉE', 'VÉRIFIÉE'
    ));
EXCEPTION WHEN others THEN RAISE NOTICE 'Erreur lors de la mise à jour des statuts orders';
END $$;

-- 2. MISE À JOUR DES STATUTS DE LIVRAISON
DO $$ BEGIN
    ALTER TABLE public.deliveries DROP CONSTRAINT IF EXISTS deliveries_status_check;
    ALTER TABLE public.deliveries ADD CONSTRAINT deliveries_status_check CHECK (status IN (
      'ASSIGNÉE', 'CHARGÉE_PAR_HUB', 'EN_LIVRAISON', 'LIVRÉE', 'ECHEC_LIVRAISON', 'REPROGRAMMÉE'
    ));
EXCEPTION WHEN others THEN RAISE NOTICE 'Erreur lors de la mise à jour des statuts deliveries';
END $$;

-- 3. STRUCTURE DES MISSIONS (Assurance de conformité P1 & P2)
-- Si la table n'existe pas, on la crée. Si elle existe, on met à jour ses statuts.
CREATE TABLE IF NOT EXISTS public.missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) NOT NULL,
    driver_id UUID REFERENCES public.user_profiles(id) NOT NULL,
    hub_id UUID REFERENCES public.hubs(id) NOT NULL,
    status TEXT NOT NULL DEFAULT 'À_FAIRE' CHECK (status IN (
        'À_FAIRE', 'ASSIGNÉE', 'EN_ATTENTE_CHARGEMENT', 'CHARGÉE', 'EN_COURS', 'CLÔTURÉE'
    )),
    return_status TEXT NOT NULL DEFAULT 'EN_ATTENTE_RETOUR_SOIR' CHECK (return_status IN (
        'EN_ATTENTE_RETOUR_SOIR', 'RETOUR_REÇU_HUB', 'RETOUR_CONTRÔLÉ', 'RETOUR_CLOTURÉ'
    )),
    anomaly_status TEXT NOT NULL DEFAULT 'AUCUN_ÉCART' CHECK (anomaly_status IN (
        'AUCUN_ÉCART', 'ÉCART_STOCK', 'ÉCART_ARGENT', 'ÉCART_MIXTE', 'LITIGE_OUVERT', 'LITIGE_RÉSOLU'
    )),
    total_expected_amount NUMERIC(15,2) DEFAULT 0,
    total_collected_amount NUMERIC(15,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    closed_at TIMESTAMPTZ
);

-- Index pour la performance des clôtures
CREATE INDEX IF NOT EXISTS idx_missions_tenant_status ON public.missions(tenant_id, status, return_status);

-- 4. ENRICHISSEMENT DES MOUVEMENTS DE STOCK (P1-12.1)
DO $$ BEGIN
    ALTER TABLE public.stock_movements DROP CONSTRAINT IF EXISTS stock_movements_type_check;
    ALTER TABLE public.stock_movements ADD CONSTRAINT stock_movements_type_check CHECK (type IN (
        'ENTREE_FOURNISSEUR', 'SORTIE_LIVRAISON', 'AJUSTEMENT',
        'TRANSFERT_SORTIE', 'TRANSFERT_ENTREE', 'RETOUR',
        'RÉSERVÉ_HUB', 'CHARGÉ_LIVREUR', 'RÉAPPROVISIONNÉ', 
        'RETOUR_HUB', 'REMIS_EN_STOCK', 'ENDOMMAGÉ'
    ));
EXCEPTION WHEN others THEN RAISE NOTICE 'Erreur lors de la mise à jour des types de stock_movements';
END $$;

-- 5. SÉCURITÉ : RLS pour Missions
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "drivers_see_own_missions" ON public.missions;
CREATE POLICY "drivers_see_own_missions" ON public.missions
  FOR SELECT USING (driver_id = auth.uid());

DROP POLICY IF EXISTS "tenant_isolation_missions" ON public.missions;
CREATE POLICY "tenant_isolation_missions" ON public.missions
    FOR ALL USING (
        tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid())
        OR driver_id = auth.uid()
    );

COMMENT ON TABLE public.missions IS 'Gestion du cycle de vie des missions livreurs (Flux P1 et P2).';
