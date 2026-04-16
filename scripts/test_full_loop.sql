-- TEST DE LA BOUCLE COMPLÈTE SHEVA OS (Workflow Strict)
DO $$
DECLARE
  v_tenant_id uuid;
  v_driver_id uuid;
  v_customer_id uuid;
  v_order_id uuid;
  v_zone_id uuid;
  v_order_num text;
BEGIN
  -- 1. Initialisation
  SELECT id INTO v_tenant_id FROM public.tenants LIMIT 1;
  SELECT id INTO v_driver_id FROM public.user_profiles WHERE role = 'driver' AND tenant_id = v_tenant_id LIMIT 1;
  SELECT id INTO v_zone_id FROM public.zones WHERE tenant_id = v_tenant_id LIMIT 1;
  IF v_zone_id IS NULL THEN
    INSERT INTO public.zones (tenant_id, name) VALUES (v_tenant_id, 'Abidjan Sud') RETURNING id INTO v_zone_id;
  END IF;

  v_order_num := 'LOOP-' || floor(random()*9999)::text;

  -- 2. Client & Commande
  INSERT INTO public.customers (tenant_id, full_name, phone) VALUES (v_tenant_id, 'User Loop', '01020304') RETURNING id INTO v_customer_id;
  INSERT INTO public.orders (tenant_id, customer_id, zone_id, order_number, status, total_amount, cod_amount, delivery_address)
  VALUES (v_tenant_id, v_customer_id, v_zone_id, v_order_num, 'CONFIRMÉE', 20000, 20000, 'Test Street')
  RETURNING id INTO v_order_id;

  -- 3. Transition ASSIGNÉE
  UPDATE public.orders SET status = 'ASSIGNÉE' WHERE id = v_order_id;
  INSERT INTO public.deliveries (tenant_id, order_id, driver_id, status) VALUES (v_tenant_id, v_order_id, v_driver_id, 'ASSIGNÉE');

  -- 4. Transition EN_LIVRAISON
  UPDATE public.orders SET status = 'EN_LIVRAISON' WHERE id = v_order_id;
  UPDATE public.deliveries SET status = 'EN_LIVRAISON' WHERE order_id = v_order_id;

  -- 5. Transition LIVRÉE
  UPDATE public.orders SET status = 'LIVRÉE' WHERE id = v_order_id;
  UPDATE public.deliveries SET status = 'LIVRÉE' WHERE order_id = v_order_id;

  -- 6. Transition VÉRIFIÉE (Finance)
  UPDATE public.orders SET status = 'VÉRIFIÉE', verified_at = now() WHERE id = v_order_id;

  -- 7. Ajout CAC Marketing
  INSERT INTO public.ads_campaigns (tenant_id, name, platform, actual_spend)
  VALUES (v_tenant_id, 'FB_TEST_' || v_order_num, 'Facebook', 1500);

  RAISE NOTICE 'Succès : Boucle complète validée pour %', v_order_num;
END $$;
