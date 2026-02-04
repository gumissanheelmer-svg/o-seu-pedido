-- Drop the incorrect policy
DROP POLICY IF EXISTS "Business owners can upload product media" ON storage.objects;

-- Create the correct policy using the file path (name column)
CREATE POLICY "Business owners can upload product media"
ON storage.objects FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'product-media'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM businesses WHERE owner_id = auth.uid()
  )
);

-- Also fix UPDATE policy if it has the same issue
DROP POLICY IF EXISTS "Business owners can update product media" ON storage.objects;

CREATE POLICY "Business owners can update product media"
ON storage.objects FOR UPDATE
TO public
USING (
  bucket_id = 'product-media'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM businesses WHERE owner_id = auth.uid()
  )
);

-- Fix DELETE policy too
DROP POLICY IF EXISTS "Business owners can delete product media" ON storage.objects;

CREATE POLICY "Business owners can delete product media"
ON storage.objects FOR DELETE
TO public
USING (
  bucket_id = 'product-media'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM businesses WHERE owner_id = auth.uid()
  )
);