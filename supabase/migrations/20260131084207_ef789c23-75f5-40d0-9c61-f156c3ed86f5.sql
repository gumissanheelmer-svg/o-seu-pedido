
-- Phase 1: Database Schema Updates for Agenda Smart - Encomendas

-- 1. Add new business types to the enum
ALTER TYPE public.business_type ADD VALUE IF NOT EXISTS 'presente';
ALTER TYPE public.business_type ADD VALUE IF NOT EXISTS 'decoracao';
ALTER TYPE public.business_type ADD VALUE IF NOT EXISTS 'personalizado';

-- 2. Add payment configuration columns to businesses table
ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS mpesa_number text,
ADD COLUMN IF NOT EXISTS emola_number text,
ADD COLUMN IF NOT EXISTS payment_required boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS signal_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS confirmation_message text DEFAULT 'Obrigado pela sua encomenda! Entraremos em contacto em breve para confirmar.';

-- 3. Add order tracking columns to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS payment_method text,
ADD COLUMN IF NOT EXISTS transaction_code text,
ADD COLUMN IF NOT EXISTS amount_paid numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_confirmed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS order_description text,
ADD COLUMN IF NOT EXISTS quantity integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS order_type text;

-- 4. Create used_transaction_codes table for unique transaction validation
CREATE TABLE IF NOT EXISTS public.used_transaction_codes (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    transaction_code text NOT NULL,
    order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(business_id, transaction_code)
);

-- 5. Enable RLS on used_transaction_codes
ALTER TABLE public.used_transaction_codes ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for used_transaction_codes

-- Anyone can insert (for order creation) - validated in application logic
CREATE POLICY "Anyone can insert transaction codes for approved businesses"
ON public.used_transaction_codes
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.businesses
        WHERE businesses.id = used_transaction_codes.business_id
        AND businesses.approval_status = 'approved'
        AND businesses.active = true
    )
);

-- Business owners can view their transaction codes
CREATE POLICY "Business owners can view transaction codes"
ON public.used_transaction_codes
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.businesses
        WHERE businesses.id = used_transaction_codes.business_id
        AND businesses.owner_id = auth.uid()
    )
);

-- Super admins can manage all transaction codes
CREATE POLICY "Super admins can manage all transaction codes"
ON public.used_transaction_codes
FOR ALL
USING (is_super_admin(auth.uid()));

-- 7. Create index for faster transaction code lookups
CREATE INDEX IF NOT EXISTS idx_used_transaction_codes_lookup 
ON public.used_transaction_codes(business_id, transaction_code);

-- 8. Create index for order type queries
CREATE INDEX IF NOT EXISTS idx_orders_order_type 
ON public.orders(order_type);
