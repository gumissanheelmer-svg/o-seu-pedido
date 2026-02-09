import { useState } from 'react';
import { motion } from 'framer-motion';
import { Store, Image, Play, Plus, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ProductWithOptions } from '@/hooks/useProducts';
import { formatCurrency } from '@/lib/whatsapp';
import { staggerItem } from './animations/MotionComponents';

interface CatalogProductCardProps {
  product: ProductWithOptions;
  onClick: () => void;
  primaryColor?: string;
}

// Helper to get display media for product
function getProductDisplayMedia(product: ProductWithOptions): { url: string; type: 'image' | 'video' } | null {
  const mainImage = product.main_image_url || product.image_url;
  if (mainImage) return { url: mainImage, type: 'image' };
  
  const imageUrls = Array.isArray(product.image_urls) ? product.image_urls : [];
  if (imageUrls.length > 0) return { url: imageUrls[0], type: 'image' };
  
  const videoUrls = Array.isArray(product.video_urls) ? product.video_urls : [];
  if (videoUrls.length > 0) return { url: videoUrls[0], type: 'video' };
  
  return null;
}

// Get media count
function getMediaCount(product: ProductWithOptions): number {
  const images = Array.isArray(product.image_urls) ? product.image_urls.length : (product.image_url ? 1 : 0);
  const videos = Array.isArray(product.video_urls) ? product.video_urls.length : 0;
  return images + videos;
}

export function CatalogProductCard({ product, onClick, primaryColor = '#C9A24D' }: CatalogProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const displayMedia = getProductDisplayMedia(product);
  const mediaCount = getMediaCount(product);
  const hasOptions = product.options && product.options.length > 0;
  
  return (
    <motion.div
      variants={staggerItem}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        whileHover={{ y: -6 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <Card 
          className="overflow-hidden cursor-pointer h-full glass-card border-white/5 hover:border-white/20 transition-colors duration-300 group"
          onClick={onClick}
        >
          {/* Hover glow effect */}
          <motion.div
            className="absolute -inset-px rounded-2xl pointer-events-none"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}30, transparent 50%)`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Image Container */}
          <div className="aspect-square bg-muted/30 relative overflow-hidden">
            {/* Shimmer loading state */}
            {displayMedia && !imageLoaded && (
              <div className="absolute inset-0 shimmer" />
            )}
            
            {displayMedia ? (
              <>
                {displayMedia.type === 'video' ? (
                  <>
                    <video
                      src={displayMedia.url}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                      loop
                      onMouseEnter={(e) => e.currentTarget.play()}
                      onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                    />
                    {/* Video indicator */}
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Play className="w-3 h-3" fill="white" />
                    </div>
                  </>
                ) : (
                  <motion.img
                    src={displayMedia.url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onLoad={() => setImageLoaded(true)}
                    animate={{
                      scale: isHovered ? 1.08 : 1,
                    }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                )}
                
                {/* Media count badge */}
                {mediaCount > 1 && (
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    <Image className="w-3 h-3" />
                    <span>{mediaCount}</span>
                  </div>
                )}
                
                {/* Hover overlay gradient */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHovered ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted/30">
                <Store className="w-12 h-12 text-muted-foreground/30" />
              </div>
            )}
          </div>

          {/* Content */}
          <CardContent className="p-4 relative">
            {/* Product Name */}
            <h3 className="font-semibold text-base line-clamp-2 text-foreground mb-1 group-hover:text-white transition-colors">
              {product.name}
            </h3>
            
            {/* Description */}
            {product.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                {product.description}
              </p>
            )}

            {/* Price & Options */}
            <div className="flex items-center justify-between gap-2">
              <div>
                <p 
                  className="text-lg font-bold"
                  style={{ color: primaryColor }}
                >
                  {formatCurrency(product.price)}
                </p>
                {hasOptions && (
                  <p className="text-xs text-muted-foreground">
                    + opções disponíveis
                  </p>
                )}
              </div>
              
              {/* CTA Button with glow */}
              <motion.button
                className="relative px-4 py-2 rounded-xl text-xs font-semibold overflow-hidden ripple"
                style={{ 
                  backgroundColor: '#25D366',
                  color: 'white',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
              >
                {/* Button glow */}
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  style={{
                    boxShadow: `0 0 20px #25D36660`,
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHovered ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                />
                <span className="relative z-10">Encomendar</span>
              </motion.button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
