-- Storage policies for business_logos bucket
CREATE POLICY "Users can upload their business logo"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'business_logos' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.businesses WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can update their business logo"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'business_logos' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.businesses WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their business logo"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'business_logos' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.businesses WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view business logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'business_logos');

-- Storage policies for business_covers bucket
CREATE POLICY "Users can upload their business cover"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'business_covers' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.businesses WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can update their business cover"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'business_covers' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.businesses WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their business cover"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'business_covers' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.businesses WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view business covers"
ON storage.objects FOR SELECT
USING (bucket_id = 'business_covers');