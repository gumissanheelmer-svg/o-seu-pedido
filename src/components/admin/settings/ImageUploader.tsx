import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Camera, Image as ImageIcon, Check } from 'lucide-react';
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
  aspectRatio = 'square',
  className,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileSelect = async (file: File) => {
    // Show local preview IMMEDIATELY - no loading state visible
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setIsUploading(true);
    setUploadSuccess(false);
    
    // Upload in background - user sees preview instantly
    const uploadedUrl = await onUpload(file);
    
    setIsUploading(false);
    
    if (uploadedUrl) {
      // Show success briefly
      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
        setPreviewUrl(null); // Now use server URL
      }, 800);
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
              {/* Overlay with actions - only on hover, no blocking loader */}
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => inputRef.current?.click()}
                  disabled={isUploading}
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
                    disabled={isUploading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              {/* Success indicator - subtle and quick */}
              <AnimatePresence>
                {uploadSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute bottom-2 right-2 bg-green-500 text-white rounded-full p-1.5 shadow-lg"
                  >
                    <Check className="w-4 h-4" />
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Subtle upload progress bar at bottom */}
              {isUploading && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2, ease: 'easeOut' }}
                    className="h-full bg-primary"
                  />
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
              disabled={isUploading}
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {isSquare ? (
                <ImageIcon className="w-8 h-8" />
              ) : (
                <Upload className="w-8 h-8" />
              )}
              <span className="text-xs text-center px-4">
                Clique ou arraste uma imagem
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      
      <p className="text-xs text-muted-foreground">
        PNG, JPG ou WebP • Máximo 10MB
      </p>
    </div>
  );
}
