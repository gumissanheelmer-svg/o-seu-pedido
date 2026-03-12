import { useState } from 'react';
import { motion } from 'framer-motion';
import { Store, Image, Play, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ProductWithOptions } from '@/hooks/useProducts';
import { formatCurrency } from '@/lib/whatsapp';
import { staggerItem } from './animations/MotionComponents';

interface CatalogProductCardProps {
  product: ProductWithOptions;
  onClick: () => void;
  primaryColor?: string;
}

function getProductDisplayMedia(product: ProductWithOptions): { url: string; type: 'image' | 'video' } | null {
  const mainImage = product.main_image_url || product.image_url;
  if (mainImage) return { url: mainImage, type: 'image' };
  const imageUrls = Array.isArray(product.image_urls) ? product.image_urls : [];
  if (imageUrls.length > 0) return { url: imageUrls[0], type: 'image' };
  const videoUrls = Array.isArray(product.video_urls) ? product.video_urls : [];
  if (videoUrls.length > 0) return { url: videoUrls[0], type: 'video' };
  return null;
}

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
        whileHover={{ y: -8 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <Card 
          className="overflow-hidden cursor-pointer h-full border-white/5 hover:border-white/20 transition-all duration-300 group rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(20px)',
            boxShadow: isHovered 
              ? `0 20px 60px -15px rgba(0,0,0,0.5), 0 0 30px -10px ${primaryColor}20` 
              : '0 4px 20px -5px rgba(0,0,0,0.3)',
          }}
          onClick={onClick}
        >
          {/* Image Container */}
          <div className="aspect-[4/3] bg-muted/30 relative overflow-hidden">
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
                      muted playsInline loop
                      onMouseEnter={(e) => e.currentTarget.play()}
                      onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                    />
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
                    animate={{ scale: isHovered ? 1.08 : 1 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                )}
                
                {mediaCount > 1 && (
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    <Image className="w-3 h-3" />
                    <span>{mediaCount}</span>
                  </div>
                )}
                
                {/* Hover overlay with quick action */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end justify-center pb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHovered ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.span
                    className="px-4 py-2 rounded-xl text-xs font-semibold glass text-white flex items-center gap-1.5"
                    initial={{ y: 10 }}
                    animate={{ y: isHovered ? 0 : 10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Ver detalhes
                  </motion.span>
                </motion.div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted/30">
                <Store className="w-12 h-12 text-muted-foreground/30" />
              </div>
            )}
          </div>

          {/* Content */}
          <CardContent className="p-4 relative">
            <h3 className="font-bold text-base line-clamp-2 text-foreground mb-1 group-hover:text-white transition-colors">
              {product.name}
            </h3>
            
            {product.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                {product.description}
              </p>
            )}

            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-lg font-bold" style={{ color: primaryColor }}>
                  {formatCurrency(product.price)}
                </p>
                {hasOptions && (
                  <p className="text-xs text-muted-foreground">+ opções disponíveis</p>
                )}
              </div>
              
              <motion.button
                className="relative px-4 py-2.5 rounded-xl text-xs font-bold overflow-hidden ripple"
                style={{ backgroundColor: '#25D366', color: 'white' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => { e.stopPropagation(); onClick(); }}
              >
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  style={{ boxShadow: `0 0 20px #25D36660` }}
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
