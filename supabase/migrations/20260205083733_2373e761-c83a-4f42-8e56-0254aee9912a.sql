-- Create enum for subscription plans
CREATE TYPE public.subscription_plan AS ENUM ('starter', 'pro', 'premium');

-- Add new columns to subscriptions table
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS plan public.subscription_plan DEFAULT 'starter',
ADD COLUMN IF NOT EXISTS start_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS next_billing_date DATE,
ADD COLUMN IF NOT EXISTS affiliate_id UUID REFERENCES public.affiliates_orders(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS internal_notes TEXT;

-- Update existing records to have start_date from created_at
UPDATE public.subscriptions 
SET start_date = created_at::date,
    next_billing_date = due_date
WHERE start_date IS NULL;

-- Add suspended status to existing enum (if not exists)
-- First check and alter the enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'suspended' AND enumtypid = 'public.subscription_status'::regtype) THEN
    ALTER TYPE public.subscription_status ADD VALUE 'suspended';
  END IF;
END$$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_business_status ON public.subscriptions(business_id, status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_affiliate ON public.subscriptions(affiliate_id);

-- Update the businesses table to check subscription status
-- Add a function to check if a business has active subscription
CREATE OR REPLACE FUNCTION public.is_subscription_active(business_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.subscriptions
    WHERE business_id = business_uuid
      AND status = 'active'
  )
$$;