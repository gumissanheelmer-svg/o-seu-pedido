-- Create affiliates_orders table
CREATE TABLE public.affiliates_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  fixed_commission NUMERIC NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.affiliates_orders ENABLE ROW LEVEL SECURITY;

-- Only super admins can manage affiliates
CREATE POLICY "Super admins can manage affiliates"
ON public.affiliates_orders
FOR ALL
USING (is_super_admin(auth.uid()));

-- Create affiliate_sales_orders table
CREATE TABLE public.affiliate_sales_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliates_orders(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  sale_value NUMERIC NOT NULL DEFAULT 0,
  commission_value NUMERIC NOT NULL DEFAULT 0,
  platform_profit NUMERIC GENERATED ALWAYS AS (sale_value - commission_value) STORED,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.affiliate_sales_orders ENABLE ROW LEVEL SECURITY;

-- Only super admins can manage affiliate sales
CREATE POLICY "Super admins can manage affiliate sales"
ON public.affiliate_sales_orders
FOR ALL
USING (is_super_admin(auth.uid()));

-- Add affiliate_id to businesses table to track which affiliate brought the business
ALTER TABLE public.businesses
ADD COLUMN affiliate_id UUID REFERENCES public.affiliates_orders(id) ON DELETE SET NULL;

-- Trigger for updated_at
CREATE TRIGGER update_affiliates_orders_updated_at
BEFORE UPDATE ON public.affiliates_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();