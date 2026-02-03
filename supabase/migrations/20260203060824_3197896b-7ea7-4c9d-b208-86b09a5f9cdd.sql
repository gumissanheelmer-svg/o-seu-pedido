-- Create product-media bucket for product images and videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-media', 
  'product-media', 
  true,
  26214400, -- 25MB for videos
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'video/mp4', 'video/webm']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 26214400,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp', 'video/mp4', 'video/webm'];

-- Add video support to business covers bucket
UPDATE storage.buckets 
SET 
  file_size_limit = 26214400,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp', 'video/mp4', 'video/webm']
WHERE id = 'business_covers';

-- Add new columns to products table for media galleries
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS image_urls jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS video_urls jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS main_image_url text;

-- Add cover video support to businesses
ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS cover_video_url text;

-- Storage policies for product-media bucket
-- Public read access
CREATE POLICY "Public can view product media"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-media');

-- Business owners can upload product media
CREATE POLICY "Business owners can upload product media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-media' AND
  EXISTS (
    SELECT 1 FROM public.businesses
    WHERE businesses.id::text = (storage.foldername(name))[1]
    AND businesses.owner_id = auth.uid()
  )
);

-- Business owners can update product media
CREATE POLICY "Business owners can update product media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-media' AND
  EXISTS (
    SELECT 1 FROM public.businesses
    WHERE businesses.id::text = (storage.foldername(name))[1]
    AND businesses.owner_id = auth.uid()
  )
);

-- Business owners can delete product media
CREATE POLICY "Business owners can delete product media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-media' AND
  EXISTS (
    SELECT 1 FROM public.businesses
    WHERE businesses.id::text = (storage.foldername(name))[1]
    AND businesses.owner_id = auth.uid()
  )
);

-- Super admins can manage all product media
CREATE POLICY "Super admins can manage product media"
ON storage.objects FOR ALL
USING (
  bucket_id = 'product-media' AND
  public.is_super_admin(auth.uid())
);