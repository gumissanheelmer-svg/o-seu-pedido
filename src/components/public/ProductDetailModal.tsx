import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingCart, Check, ChevronLeft, ChevronRight, Play } from 'lucide-react';
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

export function ProductDetailModal({ product, open, onClose }: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, SelectedOption>>({});
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const { addItem } = useCartContext();

  if (!product) return null;

  const options = product.options || [];
  const media = getProductMedia(product);
  
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
    toast.success('Adicionado ao carrinho!');
    
    // Reset and close
    setQuantity(1);
    setSelectedOptions({});
    setCurrentMediaIndex(0);
    onClose();
  };

  const handleClose = () => {
    setQuantity(1);
    setSelectedOptions({});
    setCurrentMediaIndex(0);
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
      <DialogContent className="max-w-lg max-h-[90vh] p-0 overflow-hidden">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6">
            {/* Media Gallery */}
            {media.length > 0 && (
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden -mx-6 -mt-6 mb-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentMediaIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
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
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8"
                      onClick={() => navigateMedia('prev')}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8"
                      onClick={() => navigateMedia('next')}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </>
                )}

                {/* Thumbnails / Dots */}
                {media.length > 1 && (
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 px-4">
                    {media.length <= 6 ? (
                      // Show thumbnails for small galleries
                      media.map((m, index) => (
                        <button
                          key={index}
                          type="button"
                          className={cn(
                            "w-10 h-10 rounded-lg overflow-hidden border-2 transition-all",
                            index === currentMediaIndex 
                              ? "border-white shadow-lg scale-110" 
                              : "border-transparent opacity-70 hover:opacity-100"
                          )}
                          onClick={() => setCurrentMediaIndex(index)}
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
                        </button>
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
              <DialogTitle className="text-xl">{product.name}</DialogTitle>
            </DialogHeader>

            {product.description && (
              <p className="text-muted-foreground text-sm mt-2">{product.description}</p>
            )}

            <p className="text-2xl font-bold text-primary mt-3">
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
                          <div
                            key={value.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                            onClick={() => handleOptionChange(option, value.id)}
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
                          </div>
                        ))}
                      </RadioGroup>
                    )}

                    {option.type === 'checkbox' && (
                      <div className="space-y-2">
                        {option.values?.map((value) => (
                          <div
                            key={value.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
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
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <Separator className="my-4" />

            {/* Quantity */}
            <div className="flex items-center justify-between">
              <Label>Quantidade</Label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-lg font-medium w-8 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(q => q + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Add to Cart */}
            <Button className="w-full h-12 text-base mt-4" onClick={handleAddToCart}>
              <ShoppingCart className="w-5 h-5 mr-2" />
              Adicionar • {formatCurrency(calculateTotalPrice())}
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
