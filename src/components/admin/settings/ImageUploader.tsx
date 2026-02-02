import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Loader2, Camera, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  label: string;
  description?: string;
  currentUrl?: string | null;
  onUpload: (file: File) => Promise<string | null>;
  onRemove?: () => Promise<void>;
  uploading?: boolean;
  aspectRatio?: 'square' | 'cover';
  className?: string;
}

export function ImageUploader({
  label,
  description,
  currentUrl,
  onUpload,
  onRemove,
  uploading = false,
  aspectRatio = 'square',
  className,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = async (file: File) => {
    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    
    // Upload file
    const uploadedUrl = await onUpload(file);
    
    if (uploadedUrl) {
      setPreviewUrl(null); // Clear local preview, use server URL
    } else {
      setPreviewUrl(null); // Clear preview on error
    }
    
    // Cleanup
    URL.revokeObjectURL(localUrl);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    }
  };

  const displayUrl = previewUrl || currentUrl;
  const isSquare = aspectRatio === 'square';

  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium text-foreground">{label}</label>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      
      <div
        className={cn(
          'relative border-2 border-dashed rounded-xl overflow-hidden transition-colors',
          dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50',
          isSquare ? 'aspect-square max-w-[200px]' : 'aspect-[3/1] max-w-full'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleInputChange}
          className="hidden"
        />
        
        <AnimatePresence mode="wait">
          {displayUrl ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <img
                src={displayUrl}
                alt={label}
                className="w-full h-full object-cover"
              />
              {/* Overlay with actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => inputRef.current?.click()}
                  disabled={uploading}
                >
                  <Camera className="w-4 h-4 mr-1" />
                  Alterar
                </Button>
                {onRemove && (
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={onRemove}
                    disabled={uploading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {uploading && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              )}
            </motion.div>
          ) : (
            <motion.button
              key="empty"
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {uploading ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <>
                  {isSquare ? (
                    <ImageIcon className="w-8 h-8" />
                  ) : (
                    <Upload className="w-8 h-8" />
                  )}
                  <span className="text-xs text-center px-4">
                    Clique ou arraste uma imagem
                  </span>
                </>
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      
      <p className="text-xs text-muted-foreground">
        PNG, JPG ou WebP • Máximo 5MB
      </p>
    </div>
  );
}
