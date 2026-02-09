import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, X, ZoomIn } from 'lucide-react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/utils';

interface MediaItem {
  url: string;
  type: 'image' | 'video';
}

interface ProductMediaGalleryProps {
  media: MediaItem[];
  productName: string;
  onClose?: () => void;
  isFullscreen?: boolean;
}

export function ProductMediaGallery({ 
  media, 
  productName, 
  onClose,
  isFullscreen = false 
}: ProductMediaGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef<number>(0);
  const reducedMotion = usePrefersReducedMotion();

  // Drag handling for swipe
  const dragX = useMotionValue(0);
  const dragProgress = useTransform(dragX, [-200, 0, 200], [-1, 0, 1]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 50;
    const velocity = 0.5;
    
    if (info.offset.x < -threshold || info.velocity.x < -velocity) {
      // Swipe left - next
      if (currentIndex < media.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
    } else if (info.offset.x > threshold || info.velocity.x > velocity) {
      // Swipe right - prev
      if (currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    }
    
    dragX.set(0);
  };

  // Double tap to zoom
  const handleTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;
    
    if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
      // Double tap detected
      if (isZoomed) {
        setIsZoomed(false);
        setZoomScale(1);
        setZoomPosition({ x: 0, y: 0 });
      } else {
        setIsZoomed(true);
        setZoomScale(2);
        
        // Get tap position for zoom center
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
          const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
          const x = ((clientX - rect.left) / rect.width - 0.5) * -100;
          const y = ((clientY - rect.top) / rect.height - 0.5) * -100;
          setZoomPosition({ x, y });
        }
      }
    }
    
    lastTapRef.current = now;
  }, [isZoomed]);

  const navigateMedia = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else if (direction === 'next' && currentIndex < media.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
    
    // Reset zoom when navigating
    if (isZoomed) {
      setIsZoomed(false);
      setZoomScale(1);
      setZoomPosition({ x: 0, y: 0 });
    }
  };

  const currentMedia = media[currentIndex];

  if (media.length === 0) return null;

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative w-full overflow-hidden select-none",
        isFullscreen ? "h-full" : "aspect-video"
      )}
    >
      {/* Close button for fullscreen */}
      {isFullscreen && onClose && (
        <motion.button
          className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full glass flex items-center justify-center"
          onClick={onClose}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="w-5 h-5" />
        </motion.button>
      )}

      {/* Main media area with swipe */}
      <motion.div
        className="w-full h-full"
        drag={media.length > 1 && !isZoomed && !reducedMotion ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ x: dragX }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentIndex}
            initial={reducedMotion ? {} : { opacity: 0, x: 50 }}
            animate={reducedMotion ? {} : { opacity: 1, x: 0 }}
            exit={reducedMotion ? {} : { opacity: 0, x: -50 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full"
            onClick={currentMedia?.type === 'image' ? handleTap : undefined}
          >
            {currentMedia?.type === 'video' ? (
              <div className="relative w-full h-full bg-black">
                <video
                  src={currentMedia.url}
                  className="w-full h-full object-contain"
                  controls
                  playsInline
                  preload="metadata"
                />
                {/* Play overlay for videos */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Play className="w-8 h-8 text-white ml-1" fill="white" />
                  </div>
                </div>
              </div>
            ) : currentMedia?.url ? (
              <motion.div
                className="w-full h-full overflow-hidden"
                animate={{
                  scale: zoomScale,
                  x: isZoomed ? zoomPosition.x : 0,
                  y: isZoomed ? zoomPosition.y : 0,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <img
                  src={currentMedia.url}
                  alt={productName}
                  className="w-full h-full object-cover"
                  draggable={false}
                  loading="lazy"
                />
              </motion.div>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Zoom indicator */}
      {currentMedia?.type === 'image' && !isZoomed && (
        <div className="absolute bottom-3 left-3 glass px-2 py-1 rounded-lg text-xs flex items-center gap-1.5 opacity-70 pointer-events-none">
          <ZoomIn className="w-3 h-3" />
          <span>2x toque para zoom</span>
        </div>
      )}

      {/* Navigation Arrows */}
      {media.length > 1 && !isZoomed && (
        <>
          <motion.button
            type="button"
            className={cn(
              "absolute left-2 top-1/2 -translate-y-1/2 glass rounded-full w-9 h-9 flex items-center justify-center z-20",
              currentIndex === 0 && "opacity-30 cursor-not-allowed"
            )}
            onClick={() => navigateMedia('prev')}
            whileHover={currentIndex > 0 ? { scale: 1.1 } : {}}
            whileTap={currentIndex > 0 ? { scale: 0.9 } : {}}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          
          <motion.button
            type="button"
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 glass rounded-full w-9 h-9 flex items-center justify-center z-20",
              currentIndex === media.length - 1 && "opacity-30 cursor-not-allowed"
            )}
            onClick={() => navigateMedia('next')}
            whileHover={currentIndex < media.length - 1 ? { scale: 1.1 } : {}}
            whileTap={currentIndex < media.length - 1 ? { scale: 0.9 } : {}}
            disabled={currentIndex === media.length - 1}
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </>
      )}

      {/* Dots indicator */}
      {media.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20 px-4">
          {media.map((item, index) => (
            <motion.button
              key={index}
              type="button"
              className={cn(
                "rounded-full transition-all relative",
                index === currentIndex 
                  ? "w-6 h-2 bg-white" 
                  : "w-2 h-2 bg-white/40 hover:bg-white/60"
              )}
              onClick={() => {
                setCurrentIndex(index);
                if (isZoomed) {
                  setIsZoomed(false);
                  setZoomScale(1);
                }
              }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              {item.type === 'video' && index !== currentIndex && (
                <Play className="absolute inset-0 w-full h-full p-0.5" fill="white" />
              )}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
