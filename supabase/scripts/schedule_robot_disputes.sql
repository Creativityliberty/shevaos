-- ACTIVATION DU ROBOT LITIGES (SHEVA OS AUTOMATION)
-- Nécessite l'extension pg_cron sur Supabase

-- 1. Activation de l'extension (si pas déjà fait)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Programmation du job : Passage du robot tous les jours à 02:00 UTC
-- Le robot ouvrira un litige pour tout colis en livraison depuis > 24h sans clôture.
SELECT cron.schedule(
    'sheva-robot-litiges-nightly', -- nom du job
    '0 2 * * *',                   -- cron: 2h du matin
    'SELECT public.fn_robot_open_stale_disputes()'
);

-- 3. Rappel des permissions
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- NOTE : Si vous n'avez pas pg_cron, vous pouvez appeler la fonction via une 
-- GitHub Action ou une Edge Function Supabase avec un HTTP Cron.
