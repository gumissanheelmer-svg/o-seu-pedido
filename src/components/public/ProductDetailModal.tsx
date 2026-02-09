import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, ChevronLeft, ChevronRight, Play, MessageCircle, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ProductWithOptions } from '@/hooks/useProducts';
import { formatCurrency } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';

interface MediaItem {
  url: string;
  type: 'image' | 'video';
}

interface ProductDetailModalProps {
  product: ProductWithOptions | null;
  open: boolean;
  onClose: () => void;
  businessName: string;
  whatsappNumber: string;
  primaryColor?: string;
}

// Get all media items from product
function getProductMedia(product: ProductWithOptions): MediaItem[] {
  const media: MediaItem[] = [];
  
  // Add main image first
  const mainUrl = product.main_image_url || product.image_url;
  if (mainUrl) {
    media.push({ url: mainUrl, type: 'image' });
  }
  
  // Add other images
  const imageUrls = Array.isArray(product.image_urls) ? product.image_urls : [];
  imageUrls.forEach(url => {
    if (url !== mainUrl && !media.some(m => m.url === url)) {
      media.push({ url, type: 'image' });
    }
  });
  
  // Add videos
  const videoUrls = Array.isArray(product.video_urls) ? product.video_urls : [];
  videoUrls.forEach(url => {
    media.push({ url, type: 'video' });
  });
  
  return media;
}

// Generate WhatsApp message
function generateWhatsAppMessage(
  productName: string,
  quantity: number,
  observations: string,
  businessName: string,
  unitPrice: number
): string {
  const lines = [
    `Olá! 👋`,
    ``,
    `Gostaria de fazer uma encomenda:`,
    ``,
    `📦 *Produto:* ${productName}`,
    `🔢 *Quantidade:* ${quantity}`,
    `💰 *Valor unitário:* ${formatCurrency(unitPrice)}`,
    `💵 *Total:* ${formatCurrency(unitPrice * quantity)}`,
  ];

  if (observations.trim()) {
    lines.push(``, `📝 *Observações:* ${observations.trim()}`);
  }

  lines.push(``, `Aguardo confirmação. Obrigado! 🙏`);

  return lines.join('\n');
}

export function ProductDetailModal({ 
  product, 
  open, 
  onClose,
  businessName,
  whatsappNumber,
  primaryColor = '#C9A24D',
}: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [observations, setObservations] = useState('');
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isOrdering, setIsOrdering] = useState(false);

  if (!product) return null;

  const media = getProductMedia(product);
  const totalPrice = product.price * quantity;

  const handleClose = () => {
    setQuantity(1);
    setObservations('');
    setCurrentMediaIndex(0);
    setIsOrdering(false);
    onClose();
  };

  const handleWhatsAppOrder = () => {
    setIsOrdering(true);
    
    const message = generateWhatsAppMessage(
      product.name,
      quantity,
      observations,
      businessName,
      product.price
    );
    
    // Format phone number (remove non-digits and ensure 258 prefix for Mozambique)
    let phone = whatsappNumber.replace(/\D/g, '');
    if (!phone.startsWith('258') && phone.length === 9) {
      phone = '258' + phone;
    }
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
    
    // Short delay for visual feedback
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
      handleClose();
    }, 600);
  };

  const navigateMedia = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentMediaIndex(i => (i === 0 ? media.length - 1 : i - 1));
    } else {
      setCurrentMediaIndex(i => (i === media.length - 1 ? 0 : i + 1));
    }
  };

  const currentMedia = media[currentMediaIndex];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0 overflow-hidden glass-strong border-white/10">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6">
            {/* Media Gallery */}
            {media.length > 0 && (
              <div className="relative aspect-video bg-muted/30 rounded-xl overflow-hidden -mx-6 -mt-6 mb-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentMediaIndex}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full"
                  >
                    {currentMedia?.type === 'video' ? (
                      <video
                        src={currentMedia.url}
                        className="w-full h-full object-cover"
                        controls
                        playsInline
                      />
                    ) : currentMedia?.url ? (
                      <img
                        src={currentMedia.url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Arrows */}
                {media.length > 1 && (
                  <>
                    <motion.button
                      type="button"
                      className="absolute left-2 top-1/2 -translate-y-1/2 glass rounded-full w-8 h-8 flex items-center justify-center"
                      onClick={() => navigateMedia('prev')}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 glass rounded-full w-8 h-8 flex items-center justify-center"
                      onClick={() => navigateMedia('next')}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </motion.button>
                  </>
                )}

                {/* Thumbnails / Dots */}
                {media.length > 1 && (
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 px-4">
                    {media.length <= 6 ? (
                      media.map((m, index) => (
                        <motion.button
                          key={index}
                          type="button"
                          className={cn(
                            "w-10 h-10 rounded-lg overflow-hidden border-2 transition-all",
                            index === currentMediaIndex 
                              ? "border-white shadow-lg" 
                              : "border-transparent opacity-70 hover:opacity-100"
                          )}
                          onClick={() => setCurrentMediaIndex(index)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {m.type === 'video' ? (
                            <div className="w-full h-full bg-black/80 flex items-center justify-center">
                              <Play className="w-4 h-4 text-white" />
                            </div>
                          ) : (
                            <img
                              src={m.url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          )}
                        </motion.button>
                      ))
                    ) : (
                      media.map((_, index) => (
                        <button
                          key={index}
                          type="button"
                          className={cn(
                            "w-2 h-2 rounded-full transition-all",
                            index === currentMediaIndex 
                              ? "bg-white scale-125" 
                              : "bg-white/50 hover:bg-white/80"
                          )}
                          onClick={() => setCurrentMediaIndex(index)}
                        />
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            <DialogHeader>
              <DialogTitle className="text-xl text-foreground">{product.name}</DialogTitle>
            </DialogHeader>

            {product.description && (
              <p className="text-muted-foreground text-sm mt-2">{product.description}</p>
            )}

            <p 
              className="text-2xl font-bold mt-3"
              style={{ color: primaryColor }}
            >
              {formatCurrency(product.price)}
            </p>

            <Separator className="my-4 bg-white/10" />

            {/* Quantity */}
            <div className="flex items-center justify-between">
              <Label className="text-base">Quantidade</Label>
              <div className="flex items-center gap-3">
                <motion.button
                  className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Minus className="w-4 h-4" />
                </motion.button>
                <motion.span 
                  key={quantity}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="text-xl font-bold w-10 text-center"
                >
                  {quantity}
                </motion.span>
                <motion.button
                  className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center"
                  onClick={() => setQuantity(q => q + 1)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Observations */}
            <div className="mt-4 space-y-2">
              <Label htmlFor="observations" className="text-base">
                Observações <span className="text-muted-foreground text-sm">(opcional)</span>
              </Label>
              <Textarea
                id="observations"
                placeholder="Ex: Sem cobertura, entregar às 15h, etc."
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                className="min-h-[80px] bg-white/5 border-white/10 focus:border-white/20 resize-none rounded-xl"
              />
            </div>

            {/* Total */}
            <div className="mt-4 p-4 rounded-xl glass">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total</span>
                <motion.span 
                  key={totalPrice}
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="text-2xl font-bold"
                  style={{ color: primaryColor }}
                >
                  {formatCurrency(totalPrice)}
                </motion.span>
              </div>
            </div>

            {/* WhatsApp Order Button */}
            <motion.button 
              className="w-full h-14 text-base mt-4 rounded-xl font-semibold ripple relative overflow-hidden flex items-center justify-center gap-3"
              style={{ 
                backgroundColor: isOrdering ? 'hsl(145 60% 42%)' : '#25D366',
                color: 'white',
                boxShadow: `0 0 30px -5px ${isOrdering ? 'hsl(145 60% 42%)' : '#25D366'}60`,
              }}
              onClick={handleWhatsAppOrder}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isOrdering}
            >
              {/* Shimmer effect */}
              {!isOrdering && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                  animate={{ x: ['-200%', '200%'] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    repeatDelay: 4,
                  }}
                />
              )}
              
              <AnimatePresence mode="wait">
                {isOrdering ? (
                  <motion.span
                    key="check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    A abrir WhatsApp...
                  </motion.span>
                ) : (
                  <motion.span
                    key="order"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 relative z-10"
                  >
                    <MessageCircle className="w-5 h-5" fill="white" />
                    Encomendar pelo WhatsApp
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <p className="text-xs text-muted-foreground text-center mt-3">
              Será redirecionado para o WhatsApp com os detalhes da encomenda
            </p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
