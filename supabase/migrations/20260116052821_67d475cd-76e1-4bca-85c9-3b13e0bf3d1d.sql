-- Encomendas SaaS Multi-Tenant Schema

-- Enum for business types
CREATE TYPE public.business_type AS ENUM ('lanchonete', 'bolos', 'buques', 'restaurante', 'outro');

-- Enum for order status
CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled');

-- Enum for approval status
CREATE TYPE public.approval_status AS ENUM ('pending', 'approved', 'rejected', 'blocked');

-- Enum for subscription status
CREATE TYPE public.subscription_status AS ENUM ('active', 'pending', 'overdue', 'cancelled');

-- Enum for user roles
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin');

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL DEFAULT 'admin',
    business_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, role, business_id)
);

-- Businesses table
CREATE TABLE public.businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    business_type business_type NOT NULL DEFAULT 'outro',
    description TEXT,
    
    -- Visual settings
    logo_url TEXT,
    cover_image_url TEXT,
    primary_color TEXT DEFAULT '#E8642D',
    secondary_color TEXT DEFAULT '#F5E6D3',
    
    -- Contact
    whatsapp_number TEXT NOT NULL,
    address TEXT,
    
    -- Status
    approval_status approval_status NOT NULL DEFAULT 'pending',
    active BOOLEAN NOT NULL DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Products table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    category TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Orders table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    
    -- Client info (no account required)
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    
    -- Delivery
    delivery_date DATE NOT NULL,
    delivery_time TEXT,
    delivery_address TEXT,
    
    -- Status and notes
    status order_status NOT NULL DEFAULT 'pending',
    notes TEXT,
    
    -- Totals
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Order items table
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Subscriptions table
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE UNIQUE,
    amount DECIMAL(10,2) NOT NULL DEFAULT 500.00,
    currency TEXT NOT NULL DEFAULT 'MZN',
    due_date DATE NOT NULL,
    status subscription_status NOT NULL DEFAULT 'pending',
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = _user_id AND role = _role
    )
$$;

-- Function to get user's business_id
CREATE OR REPLACE FUNCTION public.get_user_business_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT business_id FROM public.user_roles
    WHERE user_id = _user_id AND role = 'admin'
    LIMIT 1
$$;

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = _user_id AND role = 'super_admin'
    )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all roles" ON public.user_roles
    FOR ALL USING (public.is_super_admin(auth.uid()));

-- RLS Policies for businesses
CREATE POLICY "Public can view approved active businesses" ON public.businesses
    FOR SELECT USING (approval_status = 'approved' AND active = true);

CREATE POLICY "Owners can view own business" ON public.businesses
    FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Owners can update own business" ON public.businesses
    FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Authenticated users can create business" ON public.businesses
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Super admins can manage all businesses" ON public.businesses
    FOR ALL USING (public.is_super_admin(auth.uid()));

-- RLS Policies for products
CREATE POLICY "Public can view active products of approved businesses" ON public.products
    FOR SELECT USING (
        active = true AND 
        EXISTS (
            SELECT 1 FROM public.businesses 
            WHERE id = business_id 
            AND approval_status = 'approved' 
            AND active = true
        )
    );

CREATE POLICY "Business owners can manage own products" ON public.products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.businesses 
            WHERE id = business_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Super admins can manage all products" ON public.products
    FOR ALL USING (public.is_super_admin(auth.uid()));

-- RLS Policies for orders
-- Anyone can INSERT (public ordering)
CREATE POLICY "Anyone can create orders" ON public.orders
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.businesses 
            WHERE id = business_id 
            AND approval_status = 'approved' 
            AND active = true
        )
    );

-- Only business owners can view/update
CREATE POLICY "Business owners can view own orders" ON public.orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.businesses 
            WHERE id = business_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Business owners can update own orders" ON public.orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.businesses 
            WHERE id = business_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Super admins can manage all orders" ON public.orders
    FOR ALL USING (public.is_super_admin(auth.uid()));

-- RLS Policies for order_items
CREATE POLICY "Anyone can create order items" ON public.order_items
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Business owners can view order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            JOIN public.businesses b ON b.id = o.business_id
            WHERE o.id = order_id AND b.owner_id = auth.uid()
        )
    );

CREATE POLICY "Super admins can manage all order items" ON public.order_items
    FOR ALL USING (public.is_super_admin(auth.uid()));

-- RLS Policies for subscriptions
CREATE POLICY "Business owners can view own subscription" ON public.subscriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.businesses 
            WHERE id = business_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Super admins can manage all subscriptions" ON public.subscriptions
    FOR ALL USING (public.is_super_admin(auth.uid()));

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_businesses_updated_at
    BEFORE UPDATE ON public.businesses
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to create admin role when business is created
CREATE OR REPLACE FUNCTION public.handle_new_business()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_roles (user_id, role, business_id)
    VALUES (NEW.owner_id, 'admin', NEW.id);
    
    -- Create initial subscription
    INSERT INTO public.subscriptions (business_id, due_date)
    VALUES (NEW.id, CURRENT_DATE + INTERVAL '30 days');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_business_created
    AFTER INSERT ON public.businesses
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_business();

-- Indexes for performance
CREATE INDEX idx_businesses_slug ON public.businesses(slug);
CREATE INDEX idx_businesses_owner ON public.businesses(owner_id);
CREATE INDEX idx_products_business ON public.products(business_id);
CREATE INDEX idx_orders_business ON public.orders(business_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);