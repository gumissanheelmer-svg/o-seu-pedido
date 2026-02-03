import { motion } from 'framer-motion';
import { Store, Image, Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProductWithOptions } from '@/hooks/useProducts';
import { formatCurrency } from '@/lib/whatsapp';

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
  const displayMedia = getProductDisplayMedia(product);
  const mediaCount = getMediaCount(product);
  const hasOptions = product.options && product.options.length > 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="overflow-hidden cursor-pointer h-full bg-card border-0 shadow-md hover:shadow-xl transition-shadow duration-300"
        onClick={onClick}
      >
        {/* Image Container */}
        <div className="aspect-square bg-muted relative overflow-hidden">
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
                  <div className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Play className="w-3 h-3" fill="white" />
                  </div>
                </>
              ) : (
                <img
                  src={displayMedia.url}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              )}
              {/* Media count badge */}
              {mediaCount > 1 && (
                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <Image className="w-3 h-3" />
                  <span>{mediaCount}</span>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <Store className="w-12 h-12 text-muted-foreground/50" />
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-4">
          {/* Product Name */}
          <h3 className="font-semibold text-base line-clamp-2 text-foreground mb-1">
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
            
            {/* CTA Button */}
            <Button
              size="sm"
              className="text-white text-xs px-3 shrink-0"
              style={{ backgroundColor: primaryColor }}
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              Ver mais
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
