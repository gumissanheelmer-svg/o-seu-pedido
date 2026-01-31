-- =============================================
-- SUPER ADMIN CONFIGURATION
-- =============================================

-- Create table for super admin email allowlist
CREATE TABLE IF NOT EXISTS public.super_admin_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Insert the super admin email
INSERT INTO public.super_admin_emails (email) 
VALUES ('gumissanheelmerdiamantino@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- Enable RLS on super_admin_emails
ALTER TABLE public.super_admin_emails ENABLE ROW LEVEL SECURITY;

-- Only super admins can read this table
CREATE POLICY "Super admins can view allowed emails"
ON public.super_admin_emails
FOR SELECT
USING (is_super_admin(auth.uid()));

-- Function to check if an email is a super admin email
CREATE OR REPLACE FUNCTION public.is_super_admin_email(_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.super_admin_emails
    WHERE LOWER(email) = LOWER(_email)
  )
$$;

-- Function to auto-assign super admin role (called after user signup)
CREATE OR REPLACE FUNCTION public.assign_super_admin_if_allowed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the user's email is in the super admin allowlist
  IF public.is_super_admin_email(NEW.email) THEN
    -- Insert super_admin role (or update if exists)
    INSERT INTO public.user_roles (user_id, role, business_id)
    VALUES (NEW.id, 'super_admin', NULL)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- =============================================
-- CATEGORIES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  sort_order integer DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners can manage own categories"
ON public.categories FOR ALL
USING (EXISTS (
  SELECT 1 FROM businesses
  WHERE businesses.id = categories.business_id
  AND businesses.owner_id = auth.uid()
));

CREATE POLICY "Public can view active categories of approved businesses"
ON public.categories FOR SELECT
USING (
  active = true AND EXISTS (
    SELECT 1 FROM businesses
    WHERE businesses.id = categories.business_id
    AND businesses.approval_status = 'approved'
    AND businesses.active = true
  )
);

CREATE POLICY "Super admins can manage all categories"
ON public.categories FOR ALL
USING (is_super_admin(auth.uid()));

-- Add category_id to products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL;

-- Add prep_hours to products (preparation time in hours)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS prep_hours integer DEFAULT 24;

-- =============================================
-- PRODUCT OPTIONS/VARIATIONS
-- =============================================

CREATE TABLE IF NOT EXISTS public.product_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name text NOT NULL, -- e.g., "Tamanho", "Sabor", "Cor"
  type text NOT NULL DEFAULT 'select', -- 'select', 'radio', 'checkbox', 'text'
  required boolean NOT NULL DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_option_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  option_id uuid NOT NULL REFERENCES public.product_options(id) ON DELETE CASCADE,
  value text NOT NULL, -- e.g., "Pequeno", "Médio", "Grande"
  price_adjustment numeric DEFAULT 0, -- additional price for this option
  sort_order integer DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_option_values ENABLE ROW LEVEL SECURITY;

-- RLS for product_options
CREATE POLICY "Business owners can manage product options"
ON public.product_options FOR ALL
USING (EXISTS (
  SELECT 1 FROM products p
  JOIN businesses b ON b.id = p.business_id
  WHERE p.id = product_options.product_id
  AND b.owner_id = auth.uid()
));

CREATE POLICY "Public can view options of active products"
ON public.product_options FOR SELECT
USING (EXISTS (
  SELECT 1 FROM products p
  JOIN businesses b ON b.id = p.business_id
  WHERE p.id = product_options.product_id
  AND p.active = true
  AND b.approval_status = 'approved'
  AND b.active = true
));

CREATE POLICY "Super admins can manage all product options"
ON public.product_options FOR ALL
USING (is_super_admin(auth.uid()));

-- RLS for product_option_values
CREATE POLICY "Business owners can manage option values"
ON public.product_option_values FOR ALL
USING (EXISTS (
  SELECT 1 FROM product_options po
  JOIN products p ON p.id = po.product_id
  JOIN businesses b ON b.id = p.business_id
  WHERE po.id = product_option_values.option_id
  AND b.owner_id = auth.uid()
));

CREATE POLICY "Public can view active option values"
ON public.product_option_values FOR SELECT
USING (
  active = true AND EXISTS (
    SELECT 1 FROM product_options po
    JOIN products p ON p.id = po.product_id
    JOIN businesses b ON b.id = p.business_id
    WHERE po.id = product_option_values.option_id
    AND p.active = true
    AND b.approval_status = 'approved'
    AND b.active = true
  )
);

CREATE POLICY "Super admins can manage all option values"
ON public.product_option_values FOR ALL
USING (is_super_admin(auth.uid()));

-- =============================================
-- CUSTOMERS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(business_id, phone)
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners can manage own customers"
ON public.customers FOR ALL
USING (EXISTS (
  SELECT 1 FROM businesses
  WHERE businesses.id = customers.business_id
  AND businesses.owner_id = auth.uid()
));

CREATE POLICY "Public can create customers for approved businesses"
ON public.customers FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM businesses
  WHERE businesses.id = customers.business_id
  AND businesses.approval_status = 'approved'
  AND businesses.active = true
));

CREATE POLICY "Super admins can manage all customers"
ON public.customers FOR ALL
USING (is_super_admin(auth.uid()));

-- Add customer_id to orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL;

-- Add selected_options to order_items (JSON with selected option values)
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS selected_options jsonb DEFAULT '[]'::jsonb;

-- =============================================
-- AUDIT LOGS
-- =============================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE,
  action text NOT NULL, -- e.g., 'business.approved', 'order.status_changed', 'impersonate.start'
  entity_type text, -- e.g., 'business', 'order', 'product'
  entity_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view all audit logs"
ON public.audit_logs FOR SELECT
USING (is_super_admin(auth.uid()));

CREATE POLICY "Business owners can view own audit logs"
ON public.audit_logs FOR SELECT
USING (EXISTS (
  SELECT 1 FROM businesses
  WHERE businesses.id = audit_logs.business_id
  AND businesses.owner_id = auth.uid()
));

CREATE POLICY "Super admins can insert audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (is_super_admin(auth.uid()));

-- Allow system to insert audit logs
CREATE POLICY "System can insert audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================
-- SUBSCRIPTION PAYMENTS TRACKING
-- =============================================

CREATE TABLE IF NOT EXISTS public.subscription_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'MZN',
  reference text,
  notes text,
  paid_at timestamptz NOT NULL DEFAULT now(),
  recorded_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage all payments"
ON public.subscription_payments FOR ALL
USING (is_super_admin(auth.uid()));

CREATE POLICY "Business owners can view own payments"
ON public.subscription_payments FOR SELECT
USING (EXISTS (
  SELECT 1 FROM businesses
  WHERE businesses.id = subscription_payments.business_id
  AND businesses.owner_id = auth.uid()
));

-- =============================================
-- IMPERSONATE SESSIONS
-- =============================================

CREATE TABLE IF NOT EXISTS public.impersonate_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  super_admin_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  active boolean NOT NULL DEFAULT true
);

ALTER TABLE public.impersonate_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage impersonate sessions"
ON public.impersonate_sessions FOR ALL
USING (is_super_admin(auth.uid()));

-- =============================================
-- UPDATE TRIGGERS
-- =============================================

CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON public.customers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_categories_business_id ON public.categories(business_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_product_options_product_id ON public.product_options(product_id);
CREATE INDEX IF NOT EXISTS idx_product_option_values_option_id ON public.product_option_values(option_id);
CREATE INDEX IF NOT EXISTS idx_customers_business_id ON public.customers(business_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_audit_logs_business_id ON public.audit_logs(business_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_user_id ON public.audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_business_id ON public.subscription_payments(business_id);