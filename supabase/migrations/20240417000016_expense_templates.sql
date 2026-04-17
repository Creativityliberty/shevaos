-- Table pour les modèles de dépenses récurrentes (loyer, fibre, etc.)
CREATE TABLE public.expense_templates (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id uuid NOT NULL REFERENCES public.tenants(id),
    name text NOT NULL,
    amount numeric NOT NULL,
    category expense_category NOT NULL DEFAULT 'divers',
    frequency text NOT NULL DEFAULT 'MONTHLY' CHECK (frequency IN ('MONTHLY', 'WEEKLY', 'YEARLY')),
    day_of_period integer NOT NULL DEFAULT 1, -- Jour du mois ou de la semaine
    is_active boolean DEFAULT true,
    last_generated_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);

-- Activation de la RLS
ALTER TABLE public.expense_templates ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "view_tenant_expense_templates" ON public.expense_templates
    FOR SELECT USING (tenant_id = get_auth_tenant_id());

CREATE POLICY "manage_tenant_expense_templates" ON public.expense_templates
    FOR ALL USING (tenant_id = get_auth_tenant_id());

-- Grant privileges
GRANT ALL ON public.expense_templates TO authenticated;
GRANT ALL ON public.expense_templates TO service_role;

-- Fonction pour générer les dépenses à partir des modèles (Batch)
CREATE OR REPLACE FUNCTION generate_expenses_from_templates(p_tenant_id uuid, p_operator_id uuid)
RETURNS integer AS $$
DECLARE
    v_count integer := 0;
    v_template RECORD;
    v_today date := CURRENT_DATE;
BEGIN
    FOR v_template IN 
        SELECT * FROM public.expense_templates 
        WHERE tenant_id = p_tenant_id 
        AND is_active = true
        AND (last_generated_at IS NULL OR date_trunc('month', last_generated_at) < date_trunc('month', v_today))
        AND v_today >= (date_trunc('month', v_today) + (day_of_period - 1 || ' days')::interval)::date
    LOOP
        -- Insérer dans la table des dépenses réelles
        INSERT INTO public.expenses (
            tenant_id,
            amount,
            category,
            description,
            expense_date,
            operator_id,
            notes
        ) VALUES (
            p_tenant_id,
            v_template.amount,
            v_template.category,
            v_template.name || ' (Auto-généré)',
            v_today,
            p_operator_id,
            'Généré automatiquement à partir du modèle : ' || v_template.name
        );

        -- Mettre à jour la date de dernière génération
        UPDATE public.expense_templates 
        SET last_generated_at = now()
        WHERE id = v_template.id;

        v_count := v_count + 1;
    END LOOP;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
