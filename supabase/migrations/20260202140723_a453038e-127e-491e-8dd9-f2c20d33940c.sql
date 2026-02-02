-- Create storage bucket for business logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('business_logos', 'business_logos', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for business covers
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('business_covers', 'business_covers', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- RLS policies for business_logos bucket
-- Allow public read access
CREATE POLICY "Public can view business logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'business_logos');

-- Allow business owners to upload their logo
CREATE POLICY "Business owners can upload logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'business_logos' AND
  EXISTS (
    SELECT 1 FROM public.businesses
    WHERE businesses.id::text = (storage.foldername(name))[1]
    AND businesses.owner_id = auth.uid()
  )
);

-- Allow business owners to update their logo
CREATE POLICY "Business owners can update logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'business_logos' AND
  EXISTS (
    SELECT 1 FROM public.businesses
    WHERE businesses.id::text = (storage.foldername(name))[1]
    AND businesses.owner_id = auth.uid()
  )
);

-- Allow business owners to delete their logo
CREATE POLICY "Business owners can delete logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'business_logos' AND
  EXISTS (
    SELECT 1 FROM public.businesses
    WHERE businesses.id::text = (storage.foldername(name))[1]
    AND businesses.owner_id = auth.uid()
  )
);

-- RLS policies for business_covers bucket
-- Allow public read access
CREATE POLICY "Public can view business covers"
ON storage.objects FOR SELECT
USING (bucket_id = 'business_covers');

-- Allow business owners to upload their cover
CREATE POLICY "Business owners can upload covers"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'business_covers' AND
  EXISTS (
    SELECT 1 FROM public.businesses
    WHERE businesses.id::text = (storage.foldername(name))[1]
    AND businesses.owner_id = auth.uid()
  )
);

-- Allow business owners to update their cover
CREATE POLICY "Business owners can update covers"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'business_covers' AND
  EXISTS (
    SELECT 1 FROM public.businesses
    WHERE businesses.id::text = (storage.foldername(name))[1]
    AND businesses.owner_id = auth.uid()
  )
);

-- Allow business owners to delete their cover
CREATE POLICY "Business owners can delete covers"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'business_covers' AND
  EXISTS (
    SELECT 1 FROM public.businesses
    WHERE businesses.id::text = (storage.foldername(name))[1]
    AND businesses.owner_id = auth.uid()
  )
);

-- Super admin policies for both buckets
CREATE POLICY "Super admins can manage all logos"
ON storage.objects FOR ALL
USING (
  bucket_id = 'business_logos' AND
  public.is_super_admin(auth.uid())
);

CREATE POLICY "Super admins can manage all covers"
ON storage.objects FOR ALL
USING (
  bucket_id = 'business_covers' AND
  public.is_super_admin(auth.uid())
);