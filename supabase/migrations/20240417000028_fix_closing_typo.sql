-- Migration: 20240417000028_fix_closing_typo.sql
-- Description: Correction du typo VALIIDÉ -> VALIDÉ dans la table daily_closings.

-- 1. Désactiver temporairement la contrainte
ALTER TABLE public.daily_closings DROP CONSTRAINT IF EXISTS daily_closings_status_check;

-- 2. Mettre à jour les données existantes
UPDATE public.daily_closings SET status = 'VALIDÉ' WHERE status = 'VALIIDÉ';

-- 3. Remettre la contrainte avec le bon orthographe
ALTER TABLE public.daily_closings ADD CONSTRAINT daily_closings_status_check CHECK (status IN ('SESSION_OUVERTE', 'VALIDÉ', 'ÉCART_SIGNALÉ'));
