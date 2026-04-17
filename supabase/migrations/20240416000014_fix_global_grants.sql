-- Fix Global Grants for Supabase
-- Description: Ensures all tables in public schema have the necessary GRANTS for authenticated and anon roles.

-- Grants for the schema public
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- Grants for ALL TABLES
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grants for ALL SEQUENCES
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Grants for ALL FUNCTIONS
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- Ensure future tables get the same grants
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, service_role, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, service_role, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON SEQUENCES TO anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres, service_role, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO anon;

-- Specific fix for deposits table permissions if needed (redundant now but safe)
GRANT ALL ON public.deposits TO authenticated;
GRANT SELECT ON public.deposits TO anon;
