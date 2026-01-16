-- Fix the order_items INSERT policy to be more restrictive
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;

CREATE POLICY "Order items can be created with valid order" ON public.order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders o
            JOIN public.businesses b ON b.id = o.business_id
            WHERE o.id = order_id 
            AND b.approval_status = 'approved' 
            AND b.active = true
        )
    );