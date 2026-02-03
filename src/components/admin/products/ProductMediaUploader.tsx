import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Star, Image as ImageIcon, Video, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface MediaItem {
  url: string;
  type: 'image' | 'video';
  isMain?: boolean;
}

interface ProductMediaUploaderProps {
  images: string[];
  videos: string[];
  mainImageUrl: string | null;
  onImagesChange: (urls: string[]) => void;
  onVideosChange: (urls: string[]) => void;
  onMainImageChange: (url: string | null) => void;
  onUploadImages: (files: File[]) => Promise<string[]>;
  onUploadVideos: (files: File[]) => Promise<string[]>;
  uploading?: boolean;
  progress?: number;
  error?: string | null;
  maxImages?: number;
  maxVideos?: number;
}

export function ProductMediaUploader({
  images,
  videos,
  mainImageUrl,
  onImagesChange,
  onVideosChange,
  onMainImageChange,
  onUploadImages,
  onUploadVideos,
  uploading = false,
  progress = 0,
  error,
  maxImages = 10,
  maxVideos = 10,
}: ProductMediaUploaderProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState<'image' | 'video' | null>(null);

  const handleImageUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const remainingSlots = maxImages - images.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    
    if (filesToUpload.length === 0) return;
    
    const newUrls = await onUploadImages(filesToUpload);
    if (newUrls.length > 0) {
      const updatedImages = [...images, ...newUrls];
      onImagesChange(updatedImages);
      
      // Set first image as main if no main exists
      if (!mainImageUrl && updatedImages.length > 0) {
        onMainImageChange(updatedImages[0]);
      }
    }
  }, [images, maxImages, mainImageUrl, onUploadImages, onImagesChange, onMainImageChange]);

  const handleVideoUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const remainingSlots = maxVideos - videos.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    
    if (filesToUpload.length === 0) return;
    
    const newUrls = await onUploadVideos(filesToUpload);
    if (newUrls.length > 0) {
      onVideosChange([...videos, ...newUrls]);
    }
  }, [videos, maxVideos, onUploadVideos, onVideosChange]);

  const handleDrop = useCallback((e: React.DragEvent, type: 'image' | 'video') => {
    e.preventDefault();
    setDragOver(null);
    
    const files = e.dataTransfer.files;
    if (type === 'image') {
      handleImageUpload(files);
    } else {
      handleVideoUpload(files);
    }
  }, [handleImageUpload, handleVideoUpload]);

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    onImagesChange(updatedImages);
    
    // Update main image if removed
    if (images[index] === mainImageUrl) {
      onMainImageChange(updatedImages[0] || null);
    }
  };

  const removeVideo = (index: number) => {
    onVideosChange(videos.filter((_, i) => i !== index));
  };

  const setAsMainImage = (url: string) => {
    onMainImageChange(url);
  };

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Fazendo upload... {progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Images Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-primary" />
            <span className="font-medium text-sm">Fotos do Produto</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {images.length}/{maxImages}
          </span>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-4 gap-2">
          <AnimatePresence mode="popLayout">
            {images.map((url, index) => (
              <motion.div
                key={url}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative aspect-square group"
              >
                <img
                  src={url}
                  alt={`Produto ${index + 1}`}
                  className={cn(
                    "w-full h-full object-cover rounded-lg border-2",
                    url === mainImageUrl ? "border-primary" : "border-transparent"
                  )}
                />
                {url === mainImageUrl && (
                  <div className="absolute top-1 left-1 bg-primary text-primary-foreground rounded-full p-1">
                    <Star className="w-3 h-3 fill-current" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                  {url !== mainImageUrl && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="w-7 h-7 text-white hover:text-primary"
                      onClick={() => setAsMainImage(url)}
                      title="Definir como principal"
                    >
                      <Star className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="w-7 h-7 text-white hover:text-destructive"
                    onClick={() => removeImage(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Upload Button */}
          {images.length < maxImages && (
            <div
              className={cn(
                "aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors",
                dragOver === 'image'
                  ? "border-primary bg-primary/10"
                  : "border-muted-foreground/30 hover:border-primary/50"
              )}
              onClick={() => imageInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver('image'); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => handleDrop(e, 'image')}
            >
              <Upload className="w-5 h-5 text-muted-foreground mb-1" />
              <span className="text-xs text-muted-foreground">Adicionar</span>
            </div>
          )}
        </div>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          className="hidden"
          onChange={(e) => handleImageUpload(e.target.files)}
          disabled={uploading}
        />

        <p className="text-xs text-muted-foreground">
          PNG, JPG ou WebP. Máx 10MB cada. Clique na ⭐ para definir a foto principal.
        </p>
      </div>

      {/* Videos Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-primary" />
            <span className="font-medium text-sm">Vídeos do Produto</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {videos.length}/{maxVideos}
          </span>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-3 gap-2">
          <AnimatePresence mode="popLayout">
            {videos.map((url, index) => (
              <motion.div
                key={url}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative aspect-video group"
              >
                <video
                  src={url}
                  className="w-full h-full object-cover rounded-lg"
                  muted
                  playsInline
                  onMouseEnter={(e) => e.currentTarget.play()}
                  onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="w-7 h-7 text-white hover:text-destructive"
                    onClick={() => removeVideo(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Upload Button */}
          {videos.length < maxVideos && (
            <div
              className={cn(
                "aspect-video border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors",
                dragOver === 'video'
                  ? "border-primary bg-primary/10"
                  : "border-muted-foreground/30 hover:border-primary/50"
              )}
              onClick={() => videoInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver('video'); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => handleDrop(e, 'video')}
            >
              <Upload className="w-5 h-5 text-muted-foreground mb-1" />
              <span className="text-xs text-muted-foreground">Adicionar</span>
            </div>
          )}
        </div>

        <input
          ref={videoInputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          multiple
          className="hidden"
          onChange={(e) => handleVideoUpload(e.target.files)}
          disabled={uploading}
        />

        <p className="text-xs text-muted-foreground">
          MP4, WebM ou MOV. Máx 100MB cada. 30-60 segundos recomendado.
        </p>
      </div>

      {/* Validation Message */}
      {images.length === 0 && videos.length === 0 && (
        <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg text-warning text-sm">
          ⚠️ Adicione pelo menos 1 foto ou vídeo do produto
        </div>
      )}
    </div>
  );
}
