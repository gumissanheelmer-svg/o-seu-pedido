import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, ShoppingCart, ChevronLeft, ChevronRight, Play, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ProductWithOptions, ProductOption } from '@/hooks/useProducts';
import { useCartContext, SelectedOption } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/whatsapp';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MediaItem {
  url: string;
  type: 'image' | 'video';
}

interface ProductDetailModalProps {
  product: ProductWithOptions | null;
  open: boolean;
  onClose: () => void;
  onItemAdded?: (product: ProductWithOptions, startX: number, startY: number) => void;
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

export function ProductDetailModal({ 
  product, 
  open, 
  onClose,
  onItemAdded,
  primaryColor: propPrimaryColor,
}: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, SelectedOption>>({});
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  const { addItem } = useCartContext();
  const addButtonRef = React.useRef<HTMLButtonElement>(null);

  if (!product) return null;

  const options = product.options || [];
  const media = getProductMedia(product);
  const primaryColor = propPrimaryColor || '#C9A24D';
  
  const calculateTotalPrice = () => {
    const basePrice = product.price;
    const optionsTotal = Object.values(selectedOptions).reduce(
      (sum, opt) => sum + opt.priceAdjustment,
      0
    );
    return (basePrice + optionsTotal) * quantity;
  };

  const handleOptionChange = (option: ProductOption, valueId: string) => {
    const selectedValue = option.values?.find(v => v.id === valueId);
    if (!selectedValue) return;

    setSelectedOptions(prev => ({
      ...prev,
      [option.id]: {
        optionId: option.id,
        optionName: option.name,
        valueId: selectedValue.id,
        valueName: selectedValue.value,
        priceAdjustment: selectedValue.price_adjustment,
      },
    }));
  };

  const handleAddToCart = () => {
    // Check required options
    const requiredOptions = options.filter(o => o.required);
    const missingRequired = requiredOptions.filter(o => !selectedOptions[o.id]);
    
    if (missingRequired.length > 0) {
      toast.error(`Selecione: ${missingRequired.map(o => o.name).join(', ')}`);
      return;
    }

    addItem(product, Object.values(selectedOptions), quantity);
    
    // Trigger fly animation if callback provided
    if (onItemAdded && addButtonRef.current) {
      const rect = addButtonRef.current.getBoundingClientRect();
      onItemAdded(product, rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
    
    // Show success animation
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      // Reset and close
      setQuantity(1);
      setSelectedOptions({});
      setCurrentMediaIndex(0);
      onClose();
    }, 800);
    
    toast.success('Adicionado ao carrinho!');
  };

  const handleClose = () => {
    setQuantity(1);
    setSelectedOptions({});
    setCurrentMediaIndex(0);
    setIsAdded(false);
    onClose();
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
                      // Show thumbnails for small galleries
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
                      // Show dots for larger galleries
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

            {/* Options */}
            {options.length > 0 && (
              <div className="space-y-6 mt-4">
                {options.map((option) => (
                  <div key={option.id} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">{option.name}</Label>
                      {option.required && (
                        <span className="text-xs text-destructive">*Obrigatório</span>
                      )}
                    </div>

                    {(option.type === 'radio' || option.type === 'select') && (
                      <RadioGroup
                        value={selectedOptions[option.id]?.valueId || ''}
                        onValueChange={(value) => handleOptionChange(option, value)}
                        className="space-y-2"
                      >
                        {option.values?.map((value) => (
                          <motion.div
                            key={value.id}
                            className="flex items-center justify-between p-3 border border-white/10 rounded-xl glass hover:bg-white/5 cursor-pointer"
                            onClick={() => handleOptionChange(option, value.id)}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                          >
                            <div className="flex items-center gap-3">
                              <RadioGroupItem value={value.id} id={value.id} />
                              <Label htmlFor={value.id} className="cursor-pointer">
                                {value.value}
                              </Label>
                            </div>
                            {value.price_adjustment !== 0 && (
                              <span className="text-sm text-muted-foreground">
                                {value.price_adjustment > 0 ? '+' : ''}
                                {formatCurrency(value.price_adjustment)}
                              </span>
                            )}
                          </motion.div>
                        ))}
                      </RadioGroup>
                    )}

                    {option.type === 'checkbox' && (
                      <div className="space-y-2">
                        {option.values?.map((value) => (
                          <motion.div
                            key={value.id}
                            className="flex items-center justify-between p-3 border border-white/10 rounded-xl glass hover:bg-white/5"
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                          >
                            <div className="flex items-center gap-3">
                              <Checkbox
                                id={value.id}
                                checked={selectedOptions[value.id]?.valueId === value.id}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    handleOptionChange(option, value.id);
                                  } else {
                                    setSelectedOptions(prev => {
                                      const updated = { ...prev };
                                      delete updated[value.id];
                                      return updated;
                                    });
                                  }
                                }}
                              />
                              <Label htmlFor={value.id} className="cursor-pointer">
                                {value.value}
                              </Label>
                            </div>
                            {value.price_adjustment !== 0 && (
                              <span className="text-sm text-muted-foreground">
                                +{formatCurrency(value.price_adjustment)}
                              </span>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <Separator className="my-4 bg-white/10" />

            {/* Quantity */}
            <div className="flex items-center justify-between">
              <Label>Quantidade</Label>
              <div className="flex items-center gap-3">
                <motion.button
                  className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center"
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
                  className="text-lg font-medium w-8 text-center"
                >
                  {quantity}
                </motion.span>
                <motion.button
                  className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center"
                  onClick={() => setQuantity(q => q + 1)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Add to Cart */}
            <motion.button 
              ref={addButtonRef}
              className="w-full h-12 text-base mt-4 rounded-xl font-semibold ripple relative overflow-hidden flex items-center justify-center gap-2"
              style={{ 
                backgroundColor: isAdded ? 'hsl(145 60% 42%)' : primaryColor,
                color: 'hsl(225 25% 6%)',
                boxShadow: `0 0 30px -5px ${isAdded ? 'hsl(145 60% 42%)' : primaryColor}60`,
              }}
              onClick={handleAddToCart}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <AnimatePresence mode="wait">
                {isAdded ? (
                  <motion.span
                    key="check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Adicionado!
                  </motion.span>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Adicionar • {formatCurrency(calculateTotalPrice())}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
