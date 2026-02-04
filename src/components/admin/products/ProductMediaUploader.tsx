import { useState, useRef, useCallback, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Star, Image as ImageIcon, Video, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PendingMedia {
  localUrl: string;
  file: File;
  uploading: boolean;
  uploaded: boolean;
  finalUrl?: string;
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

function ProductMediaUploaderComponent({
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
  const [pendingImages, setPendingImages] = useState<PendingMedia[]>([]);
  const [pendingVideos, setPendingVideos] = useState<PendingMedia[]>([]);

  // Cleanup object URLs on unmount - use ref to avoid re-renders
  const pendingImagesRef = useRef(pendingImages);
  const pendingVideosRef = useRef(pendingVideos);
  pendingImagesRef.current = pendingImages;
  pendingVideosRef.current = pendingVideos;

  useEffect(() => {
    return () => {
      pendingImagesRef.current.forEach(p => URL.revokeObjectURL(p.localUrl));
      pendingVideosRef.current.forEach(p => URL.revokeObjectURL(p.localUrl));
    };
  }, []);

  const handleImageUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const remainingSlots = maxImages - images.length - pendingImages.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    
    if (filesToUpload.length === 0) return;

    // Create instant previews
    const newPending: PendingMedia[] = filesToUpload.map(file => ({
      localUrl: URL.createObjectURL(file),
      file,
      uploading: true,
      uploaded: false,
    }));
    
    setPendingImages(prev => [...prev, ...newPending]);

    // Set first as main if needed
    if (!mainImageUrl && images.length === 0 && pendingImages.length === 0) {
      onMainImageChange(newPending[0].localUrl);
    }
    
    // Upload in background
    const newUrls = await onUploadImages(filesToUpload);
    
    if (newUrls.length > 0) {
      // Update pending with final URLs
      setPendingImages(prev => {
        const updated = [...prev];
        newPending.forEach((pending, i) => {
          const idx = updated.findIndex(p => p.localUrl === pending.localUrl);
          if (idx !== -1 && newUrls[i]) {
            updated[idx] = { ...updated[idx], uploading: false, uploaded: true, finalUrl: newUrls[i] };
          }
        });
        return updated;
      });

      // Move to permanent images
      const updatedImages = [...images, ...newUrls];
      onImagesChange(updatedImages);
      
      // Update main image if it was a local URL
      if (mainImageUrl === newPending[0]?.localUrl && newUrls[0]) {
        onMainImageChange(newUrls[0]);
      }

      // Clean up pending after short delay
      setTimeout(() => {
        setPendingImages(prev => prev.filter(p => !newPending.some(np => np.localUrl === p.localUrl)));
        newPending.forEach(p => URL.revokeObjectURL(p.localUrl));
      }, 500);
    }
  }, [images, maxImages, mainImageUrl, pendingImages.length, onUploadImages, onImagesChange, onMainImageChange]);

  const handleVideoUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const remainingSlots = maxVideos - videos.length - pendingVideos.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    
    if (filesToUpload.length === 0) return;

    // Create instant previews
    const newPending: PendingMedia[] = filesToUpload.map(file => ({
      localUrl: URL.createObjectURL(file),
      file,
      uploading: true,
      uploaded: false,
    }));
    
    setPendingVideos(prev => [...prev, ...newPending]);
    
    // Upload in background
    const newUrls = await onUploadVideos(filesToUpload);
    
    if (newUrls.length > 0) {
      setPendingVideos(prev => {
        const updated = [...prev];
        newPending.forEach((pending, i) => {
          const idx = updated.findIndex(p => p.localUrl === pending.localUrl);
          if (idx !== -1 && newUrls[i]) {
            updated[idx] = { ...updated[idx], uploading: false, uploaded: true, finalUrl: newUrls[i] };
          }
        });
        return updated;
      });

      onVideosChange([...videos, ...newUrls]);

      setTimeout(() => {
        setPendingVideos(prev => prev.filter(p => !newPending.some(np => np.localUrl === p.localUrl)));
        newPending.forEach(p => URL.revokeObjectURL(p.localUrl));
      }, 500);
    }
  }, [videos, maxVideos, pendingVideos.length, onUploadVideos, onVideosChange]);

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

  // Only show pending items that are still uploading (not yet in the final images array)
  const pendingImageUrls = pendingImages.filter(p => p.uploading && !p.uploaded).map(p => p.localUrl);
  const pendingVideoUrls = pendingVideos.filter(p => p.uploading && !p.uploaded).map(p => p.localUrl);
  const allImages = [...images, ...pendingImageUrls];
  const allVideos = [...videos, ...pendingVideoUrls];
  const isImagePending = (url: string) => pendingImageUrls.includes(url);
  const isVideoPending = (url: string) => pendingVideoUrls.includes(url);

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
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
            {allImages.length}/{maxImages}
          </span>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-4 gap-2">
          <AnimatePresence mode="popLayout">
            {allImages.map((url, index) => {
              const isPending = isImagePending(url);
              const isActualImage = images.includes(url);
              
              return (
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
                      url === mainImageUrl ? "border-primary" : "border-transparent",
                      isPending && "opacity-70"
                    )}
                  />
                  {/* Upload indicator */}
                  {isPending && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    </div>
                  )}
                  {url === mainImageUrl && !isPending && (
                    <div className="absolute top-1 left-1 bg-primary text-primary-foreground rounded-full p-1">
                      <Star className="w-3 h-3 fill-current" />
                    </div>
                  )}
                  {!isPending && isActualImage && (
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
                        onClick={() => removeImage(images.indexOf(url))}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Upload Button */}
          {allImages.length < maxImages && (
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
          onChange={(e) => { handleImageUpload(e.target.files); e.target.value = ''; }}
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
            {allVideos.length}/{maxVideos}
          </span>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-3 gap-2">
          <AnimatePresence mode="popLayout">
            {allVideos.map((url, index) => {
              const isPending = isVideoPending(url);
              const isActualVideo = videos.includes(url);
              
              return (
                <motion.div
                  key={url}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative aspect-video group"
                >
                  <video
                    src={url}
                    className={cn(
                      "w-full h-full object-cover rounded-lg",
                      isPending && "opacity-70"
                    )}
                    muted
                    playsInline
                    onMouseEnter={(e) => !isPending && e.currentTarget.play()}
                    onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                  />
                  {isPending && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    </div>
                  )}
                  {!isPending && isActualVideo && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="w-7 h-7 text-white hover:text-destructive"
                        onClick={() => removeVideo(videos.indexOf(url))}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Upload Button */}
          {allVideos.length < maxVideos && (
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
          onChange={(e) => { handleVideoUpload(e.target.files); e.target.value = ''; }}
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

// Memoize to prevent re-renders from parent state changes
export const ProductMediaUploader = memo(ProductMediaUploaderComponent);
