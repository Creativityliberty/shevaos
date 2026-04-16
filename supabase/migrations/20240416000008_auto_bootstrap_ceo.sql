-- migration: 20240416000008_auto_bootstrap_ceo.sql
-- Description: Ajoute une logique d'auto-amorçage pour le tout premier compte

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_tenant_id UUID;
  v_user_count INT;
BEGIN
  -- 1. Compter les utilisateurs existants
  SELECT COUNT(*) INTO v_user_count FROM public.user_profiles;

  -- 2. Garantir l'existence d'un Espace de travail (Tenant) parent
  SELECT id INTO v_tenant_id FROM public.tenants LIMIT 1;
  IF v_tenant_id IS NULL THEN
     INSERT INTO public.tenants (name, slug) VALUES ('SHEVA OS Enterprise', 'sheva-os-enterprise') RETURNING id INTO v_tenant_id;
  END IF;

  -- 3. Inscription VIP pour le premier utilisateur OU selon le choix du formulaire
  -- Si c'est le tout premier utilisateur, on le force en CEO et Actif (Bootstrap)
  IF v_user_count = 0 THEN
      INSERT INTO public.user_profiles (id, full_name, email, role, is_active, tenant_id)
      VALUES (
        new.id,
        new.raw_user_meta_data->>'full_name',
        new.email,
        'ceo',
        TRUE,
        v_tenant_id
      );
  ELSE
  -- 4. Pour tous les autres, on applique le rôle demandé dans l'interface (défaut sav_agent)
      INSERT INTO public.user_profiles (id, full_name, email, role, is_active, tenant_id)
      VALUES (
        new.id,
        new.raw_user_meta_data->>'full_name',
        new.email,
        COALESCE(new.raw_user_meta_data->>'requested_role', 'sav_agent')::user_role,
        TRUE, -- On les active par défaut pour que tu puisses faire tes tests sans blocage !
        v_tenant_id
      );
  END IF;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
