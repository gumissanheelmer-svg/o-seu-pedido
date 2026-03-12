
-- Add image_url to categories table
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS image_url text;

-- Create customer reviews table
CREATE TABLE public.customer_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  rating integer NOT NULL DEFAULT 5,
  comment text,
  approved boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customer_reviews ENABLE ROW LEVEL SECURITY;

-- Public can view approved reviews of active businesses
CREATE POLICY "Public can view approved reviews"
  ON public.customer_reviews
  FOR SELECT
  TO public
  USING (approved = true AND EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE businesses.id = customer_reviews.business_id 
    AND businesses.approval_status = 'approved' 
    AND businesses.active = true
  ));

-- Business owners can manage own reviews
CREATE POLICY "Business owners can manage own reviews"
  ON public.customer_reviews
  FOR ALL
  TO public
  USING (EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE businesses.id = customer_reviews.business_id 
    AND businesses.owner_id = auth.uid()
  ));

-- Anyone can submit reviews for approved businesses
CREATE POLICY "Anyone can submit reviews"
  ON public.customer_reviews
  FOR INSERT
  TO public
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE businesses.id = customer_reviews.business_id 
    AND businesses.approval_status = 'approved' 
    AND businesses.active = true
  ));

-- Super admins can manage all reviews
CREATE POLICY "Super admins can manage all reviews"
  ON public.customer_reviews
  FOR ALL
  TO public
  USING (is_super_admin(auth.uid()));

-- Create validation trigger for rating
CREATE OR REPLACE FUNCTION public.validate_review_rating()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.rating < 1 OR NEW.rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_review_rating_trigger
  BEFORE INSERT OR UPDATE ON public.customer_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_review_rating();

-- Index for performance
CREATE INDEX idx_customer_reviews_business ON public.customer_reviews(business_id, approved);
