import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MediaFile {
  url: string;
  type: 'image' | 'video';
  name: string;
}

interface UploadOptions {
  maxSizeMB?: number;
  maxFiles?: number;
  allowedImageTypes?: string[];
  allowedVideoTypes?: string[];
}

const DEFAULT_OPTIONS: UploadOptions = {
  maxSizeMB: 100, // 100MB for videos (iPhone compatibility)
  maxFiles: 10,
  allowedImageTypes: ['image/png', 'image/jpeg', 'image/webp'],
  allowedVideoTypes: ['video/mp4', 'video/webm', 'video/quicktime'], // Added MOV for iPhone
};

interface UseMediaUploadReturn {
  uploading: boolean;
  progress: number;
  error: string | null;
  uploadProductMedia: (
    businessId: string,
    productId: string,
    files: File[],
    mediaType: 'images' | 'videos'
  ) => Promise<string[]>;
  uploadBusinessCover: (
    businessId: string,
    file: File
  ) => Promise<{ url: string; type: 'image' | 'video' } | null>;
  deleteMedia: (bucket: string, paths: string[]) => Promise<boolean>;
  validateFile: (file: File, type: 'image' | 'video') => string | null;
  clearError: () => void;
}

export function useMediaUpload(): UseMediaUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback((
    file: File,
    type: 'image' | 'video',
    options: UploadOptions = DEFAULT_OPTIONS
  ): string | null => {
    const { maxSizeMB = 25, allowedImageTypes, allowedVideoTypes } = options;
    
    const allowedTypes = type === 'image' ? allowedImageTypes : allowedVideoTypes;
    
    if (!allowedTypes?.includes(file.type)) {
      return `Tipo de ficheiro não permitido. Use: ${allowedTypes?.join(', ')}`;
    }
    
    const maxImageSize = 10 * 1024 * 1024; // 10MB for images
    const maxVideoSize = maxSizeMB * 1024 * 1024; // 100MB for videos
    const maxSize = type === 'image' ? maxImageSize : maxVideoSize;
    
    if (file.size > maxSize) {
      const sizeMB = type === 'image' ? 10 : maxSizeMB;
      return `Ficheiro muito grande. Máximo: ${sizeMB}MB`;
    }
    
    return null;
  }, []);

  const uploadProductMedia = useCallback(async (
    businessId: string,
    productId: string,
    files: File[],
    mediaType: 'images' | 'videos'
  ): Promise<string[]> => {
    if (files.length === 0) return [];
    if (files.length > 10) {
      setError('Máximo de 10 ficheiros permitidos');
      return [];
    }

    setError(null);
    setUploading(true);
    setProgress(0);

    const type = mediaType === 'images' ? 'image' : 'video';
    const validFiles: { file: File; fileName: string }[] = [];

    // Validate all files first
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validationError = validateFile(file, type);
      if (validationError) {
        setError(validationError);
        continue;
      }
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const fileName = `${businessId}/${productId}/${mediaType}/${timestamp}_${i}.${fileExt}`;
      validFiles.push({ file, fileName });
    }

    if (validFiles.length === 0) {
      setUploading(false);
      return [];
    }

    try {
      // Upload all files in parallel for speed
      const uploadPromises = validFiles.map(async ({ file, fileName }) => {
        const { error: uploadError } = await supabase.storage
          .from('product-media')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('product-media')
          .getPublicUrl(fileName);

        return `${publicUrl}?t=${Date.now()}`;
      });

      // Track progress with Promise.allSettled for parallel uploads
      let completed = 0;
      const results = await Promise.all(
        uploadPromises.map(p => 
          p.then(url => {
            completed++;
            setProgress(Math.round((completed / validFiles.length) * 100));
            return url;
          }).catch(err => {
            completed++;
            setProgress(Math.round((completed / validFiles.length) * 100));
            setError(`Erro ao fazer upload: ${err.message}`);
            return null;
          })
        )
      );

      return results.filter((url): url is string => url !== null);
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer upload');
      return [];
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [validateFile]);

  const uploadBusinessCover = useCallback(async (
    businessId: string,
    file: File
  ): Promise<{ url: string; type: 'image' | 'video' } | null> => {
    setError(null);
    setUploading(true);

    const isVideo = file.type.startsWith('video/');
    const type = isVideo ? 'video' : 'image';

    const validationError = validateFile(file, type);
    if (validationError) {
      setError(validationError);
      setUploading(false);
      return null;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${businessId}/cover.${fileExt}`;

      // Delete existing covers
      const extensions = ['png', 'jpg', 'jpeg', 'webp', 'mp4', 'webm'];
      await supabase.storage
        .from('business_covers')
        .remove(extensions.map(ext => `${businessId}/cover.${ext}`));

      const { error: uploadError } = await supabase.storage
        .from('business_covers')
        .upload(fileName, file, {
          upsert: true,
          cacheControl: '3600',
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('business_covers')
        .getPublicUrl(fileName);

      return {
        url: `${publicUrl}?t=${Date.now()}`,
        type,
      };
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer upload');
      return null;
    } finally {
      setUploading(false);
    }
  }, [validateFile]);

  const deleteMedia = useCallback(async (
    bucket: string,
    paths: string[]
  ): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove(paths);
      
      if (error) throw error;
      return true;
    } catch (err: any) {
      setError(err.message || 'Erro ao remover mídia');
      return false;
    }
  }, []);

  return {
    uploading,
    progress,
    error,
    uploadProductMedia,
    uploadBusinessCover,
    deleteMedia,
    validateFile,
    clearError: () => setError(null),
  };
}
