import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UploadOptions {
  maxSizeMB?: number;
  allowedTypes?: string[];
}

const DEFAULT_OPTIONS: UploadOptions = {
  maxSizeMB: 5,
  allowedTypes: ['image/png', 'image/jpeg', 'image/webp'],
};

export function useBusinessStorage() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File, options: UploadOptions = DEFAULT_OPTIONS): string | null => {
    const { maxSizeMB = 5, allowedTypes = DEFAULT_OPTIONS.allowedTypes } = options;
    
    // Check file type
    if (!allowedTypes?.includes(file.type)) {
      return `Tipo de ficheiro não permitido. Use: ${allowedTypes?.join(', ')}`;
    }
    
    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `Ficheiro muito grande. Máximo: ${maxSizeMB}MB`;
    }
    
    return null;
  };

  const uploadLogo = async (businessId: string, file: File): Promise<string | null> => {
    setError(null);
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return null;
    }
    
    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${businessId}/logo.${fileExt}`;
      
      // Delete existing logo if exists
      await supabase.storage
        .from('business_logos')
        .remove([`${businessId}/logo.png`, `${businessId}/logo.jpg`, `${businessId}/logo.jpeg`, `${businessId}/logo.webp`]);
      
      // Upload new logo
      const { error: uploadError } = await supabase.storage
        .from('business_logos')
        .upload(fileName, file, { 
          upsert: true,
          cacheControl: '3600',
        });
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('business_logos')
        .getPublicUrl(fileName);
      
      // Add cache buster to force refresh
      return `${publicUrl}?t=${Date.now()}`;
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer upload');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const uploadCover = async (businessId: string, file: File): Promise<string | null> => {
    setError(null);
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return null;
    }
    
    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${businessId}/cover.${fileExt}`;
      
      // Delete existing cover if exists
      await supabase.storage
        .from('business_covers')
        .remove([`${businessId}/cover.png`, `${businessId}/cover.jpg`, `${businessId}/cover.jpeg`, `${businessId}/cover.webp`]);
      
      // Upload new cover
      const { error: uploadError } = await supabase.storage
        .from('business_covers')
        .upload(fileName, file, { 
          upsert: true,
          cacheControl: '3600',
        });
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('business_covers')
        .getPublicUrl(fileName);
      
      // Add cache buster to force refresh
      return `${publicUrl}?t=${Date.now()}`;
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer upload');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteLogo = async (businessId: string): Promise<boolean> => {
    try {
      await supabase.storage
        .from('business_logos')
        .remove([`${businessId}/logo.png`, `${businessId}/logo.jpg`, `${businessId}/logo.jpeg`, `${businessId}/logo.webp`]);
      return true;
    } catch {
      return false;
    }
  };

  const deleteCover = async (businessId: string): Promise<boolean> => {
    try {
      await supabase.storage
        .from('business_covers')
        .remove([`${businessId}/cover.png`, `${businessId}/cover.jpg`, `${businessId}/cover.jpeg`, `${businessId}/cover.webp`]);
      return true;
    } catch {
      return false;
    }
  };

  return {
    uploadLogo,
    uploadCover,
    deleteLogo,
    deleteCover,
    uploading,
    error,
    clearError: () => setError(null),
  };
}
