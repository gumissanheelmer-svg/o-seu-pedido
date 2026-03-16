import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, ChevronLeft, ChevronRight, Play, MessageCircle, Check, Paperclip } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ProductWithOptions } from '@/hooks/useProducts';
import { formatCurrency } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';
import { OrderMediaUploader } from '@/components/public/OrderMediaUploader';

interface MediaItem {
  url: string;
  type: 'image' | 'video';
}

interface MediaFile {
  file: File;
  preview: string;
}

interface ProductDetailModalProps {
  product: ProductWithOptions | null;
  open: boolean;
  onClose: () => void;
  businessName: string;
  whatsappNumber: string;
  primaryColor?: string;
  orderRulesMessage?: string | null;
}

const MAX_DESCRIPTION = 5000;
const WARN_THRESHOLD = 4500;

function getProductMedia(product: ProductWithOptions): MediaItem[] {
  const media: MediaItem[] = [];
  const mainUrl = product.main_image_url || product.image_url;
  if (mainUrl) media.push({ url: mainUrl, type: 'image' });
  const imageUrls = Array.isArray(product.image_urls) ? product.image_urls : [];
  imageUrls.forEach(url => {
    if (url !== mainUrl && !media.some(m => m.url === url)) media.push({ url, type: 'image' });
  });
  const videoUrls = Array.isArray(product.video_urls) ? product.video_urls : [];
  videoUrls.forEach(url => media.push({ url, type: 'video' }));
  return media;
}

function generateWhatsAppMessage(
  productName: string,
  quantity: number,
  description: string,
  businessName: string,
  unitPrice: number,
  photoCount: number,
  videoCount: number
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

  if (description.trim()) {
    lines.push(``, `📝 *Detalhes do pedido:*`, description.trim());
  }

  const attachments: string[] = [];
  if (photoCount > 0) attachments.push(`${photoCount} foto${photoCount > 1 ? 's' : ''}`);
  if (videoCount > 0) attachments.push(`${videoCount} vídeo${videoCount > 1 ? 's' : ''}`);
  if (attachments.length > 0) {
    lines.push(``, `📎 *Anexos:* ${attachments.join(' e ')} de referência (enviarei a seguir nesta conversa)`);
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
  const [description, setDescription] = useState('');
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isOrdering, setIsOrdering] = useState(false);
  const [photos, setPhotos] = useState<MediaFile[]>([]);
  const [videos, setVideos] = useState<MediaFile[]>([]);
  const [showAttachHint, setShowAttachHint] = useState(false);

  if (!product) return null;

  const media = getProductMedia(product);
  const totalPrice = product.price * quantity;
  const charCount = description.length;
  const isOverLimit = charCount > MAX_DESCRIPTION;
  const isNearLimit = charCount > WARN_THRESHOLD;
  const hasAttachments = photos.length > 0 || videos.length > 0;

  const handleClose = () => {
    setQuantity(1);
    setDescription('');
    setCurrentMediaIndex(0);
    setIsOrdering(false);
    photos.forEach(p => URL.revokeObjectURL(p.preview));
    videos.forEach(v => URL.revokeObjectURL(v.preview));
    setPhotos([]);
    setVideos([]);
    setShowAttachHint(false);
    onClose();
  };

  const handleWhatsAppOrder = () => {
    if (isOverLimit) return;
    setIsOrdering(true);

    const message = generateWhatsAppMessage(
      product.name,
      quantity,
      description,
      businessName,
      product.price,
      photos.length,
      videos.length
    );

    let phone = whatsappNumber.replace(/\D/g, '');
    if (!phone.startsWith('258') && phone.length === 9) phone = '258' + phone;

    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
      if (hasAttachments) {
        setShowAttachHint(true);
        setIsOrdering(false);
      } else {
        handleClose();
      }
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
                      <video src={currentMedia.url} className="w-full h-full object-cover" controls playsInline />
                    ) : currentMedia?.url ? (
                      <img src={currentMedia.url} alt={product.name} className="w-full h-full object-cover" />
                    ) : null}
                  </motion.div>
                </AnimatePresence>

                {media.length > 1 && (
                  <>
                    <motion.button type="button" className="absolute left-2 top-1/2 -translate-y-1/2 glass rounded-full w-8 h-8 flex items-center justify-center" onClick={() => navigateMedia('prev')} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <ChevronLeft className="w-5 h-5" />
                    </motion.button>
                    <motion.button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 glass rounded-full w-8 h-8 flex items-center justify-center" onClick={() => navigateMedia('next')} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <ChevronRight className="w-5 h-5" />
                    </motion.button>
                  </>
                )}

                {media.length > 1 && (
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 px-4">
                    {media.length <= 6 ? (
                      media.map((m, index) => (
                        <motion.button key={index} type="button" className={cn("w-10 h-10 rounded-lg overflow-hidden border-2 transition-all", index === currentMediaIndex ? "border-white shadow-lg" : "border-transparent opacity-70 hover:opacity-100")} onClick={() => setCurrentMediaIndex(index)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          {m.type === 'video' ? (
                            <div className="w-full h-full bg-black/80 flex items-center justify-center"><Play className="w-4 h-4 text-white" /></div>
                          ) : (
                            <img src={m.url} alt="" className="w-full h-full object-cover" />
                          )}
                        </motion.button>
                      ))
                    ) : (
                      media.map((_, index) => (
                        <button key={index} type="button" className={cn("w-2 h-2 rounded-full transition-all", index === currentMediaIndex ? "bg-white scale-125" : "bg-white/50 hover:bg-white/80")} onClick={() => setCurrentMediaIndex(index)} />
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            <DialogHeader>
              <DialogTitle className="text-xl font-bold" style={{ color: '#FFFFFF', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>{product.name}</DialogTitle>
            </DialogHeader>

            {product.description && (
              <p className="text-sm mt-2" style={{ color: '#EAEAEA', lineHeight: '1.6' }}>{product.description}</p>
            )}

            <p className="text-2xl font-bold mt-3" style={{ color: primaryColor }}>
              {formatCurrency(product.price)}
            </p>

            <Separator className="my-4 bg-white/10" />

            {/* Quantity */}
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium" style={{ color: '#F5F5F5' }}>Quantidade</Label>
              <div className="flex items-center gap-3">
                <motion.button className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center" onClick={() => setQuantity(q => Math.max(1, q - 1))} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Minus className="w-4 h-4" />
                </motion.button>
                <motion.span key={quantity} initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-xl font-bold w-10 text-center">
                  {quantity}
                </motion.span>
                <motion.button className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center" onClick={() => setQuantity(q => q + 1)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Plus className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            <Separator className="my-4 bg-white/10" />

            {/* Order Details Section */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold flex items-center gap-2" style={{ color: '#FFFFFF' }}>
                <Paperclip className="w-4 h-4" style={{ color: primaryColor }} />
                Detalhes do Pedido
              </h3>

              {/* Advanced Description */}
              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-sm font-medium" style={{ color: '#F5F5F5' }}>
                  Descrição <span style={{ color: '#AAAAAA', fontSize: '0.75rem' }}>(opcional)</span>
                </Label>
                <textarea
                  id="description"
                  placeholder="Descreva todos os detalhes do seu pedido. Pode incluir cores, tamanhos, referências, horário de entrega, etc."
                  value={description}
                  onChange={(e) => {
                    if (e.target.value.length <= MAX_DESCRIPTION) {
                      setDescription(e.target.value);
                    }
                  }}
                  rows={4}
                  className={cn(
                    "w-full min-h-[100px] max-h-[200px] resize-y rounded-xl px-4 py-3 text-sm",
                    "bg-white/[0.04] border border-white/10 text-foreground placeholder:text-white/25",
                    "focus:outline-none focus:border-white/25 transition-all duration-300",
                    isOverLimit && "border-red-500/50 focus:border-red-500/70",
                    !isOverLimit && "focus:shadow-[0_0_20px_-6px_rgba(201,162,77,0.15)]"
                  )}
                />
                <div className="flex justify-end">
                  <span
                    className="text-[11px] tabular-nums transition-colors duration-200 font-medium"
                    style={{
                      color: isOverLimit ? '#FF3B3B' : isNearLimit ? '#FFA500' : '#FFFFFF'
                    }}
                  >
                    {charCount} / {MAX_DESCRIPTION} caracteres
                  </span>
                </div>
              </div>

              {/* Photo Upload */}
              <OrderMediaUploader
                type="image"
                files={photos}
                onChange={setPhotos}
                maxFiles={10}
              />

              {/* Video Upload */}
              <OrderMediaUploader
                type="video"
                files={videos}
                onChange={setVideos}
                maxFiles={10}
                maxSizeMB={30}
              />
            </div>

            {/* Total */}
            <div className="mt-4 p-4 rounded-xl glass">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total</span>
                <motion.span key={totalPrice} initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-2xl font-bold" style={{ color: primaryColor }}>
                  {formatCurrency(totalPrice)}
                </motion.span>
              </div>
            </div>

            {/* Attach Hint (shown after redirect with attachments) */}
            <AnimatePresence>
              {showAttachHint && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mt-3 p-3 rounded-xl border border-orange-400/20 bg-orange-400/5 text-center"
                >
                  <p className="text-xs text-orange-300/90 font-medium">
                    📎 Envie as {photos.length > 0 ? 'fotos' : ''}{photos.length > 0 && videos.length > 0 ? ' e ' : ''}{videos.length > 0 ? 'vídeos' : ''} de referência na conversa do WhatsApp.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* WhatsApp Order Button */}
            <motion.button
              className="w-full h-14 text-base mt-4 rounded-xl font-bold ripple relative overflow-hidden flex items-center justify-center gap-3"
              style={{
                backgroundColor: isOrdering ? 'hsl(145 60% 42%)' : '#25D366',
                color: '#FFFFFF',
                boxShadow: !isOverLimit ? `0 0 30px -5px ${isOrdering ? 'hsl(145 60% 42%)' : '#25D366'}60, ${!isOrdering ? '0 0 20px rgba(37,211,102,0.4)' : ''}` : 'none',
                opacity: isOverLimit ? 0.5 : 1,
              }}
              onClick={handleWhatsAppOrder}
              whileHover={!isOverLimit ? { scale: 1.02, boxShadow: '0 0 40px rgba(37,211,102,0.6), 0 0 20px rgba(37,211,102,0.4)' } : {}}
              whileTap={!isOverLimit ? { scale: 0.98 } : {}}
              disabled={isOrdering || isOverLimit}
            >
              {!isOrdering && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                  animate={{ x: ['-200%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 4 }}
                />
              )}

              <AnimatePresence mode="wait">
                {isOrdering ? (
                  <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    A abrir WhatsApp...
                  </motion.span>
                ) : (
                  <motion.span key="order" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 relative z-10">
                    <MessageCircle className="w-5 h-5" fill="white" />
                    Encomendar pelo WhatsApp
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <p className="text-xs text-center mt-3" style={{ color: '#AAAAAA' }}>
              Será redirecionado para o WhatsApp com os detalhes da encomenda
            </p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
