import { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X, Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCartContext, CartItemWithOptions } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/whatsapp';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface CartSheetProps {
  open: boolean;
  onClose: () => void;
  onCheckout: () => void;
  primaryColor?: string;
}

interface CartItemRowProps {
  item: CartItemWithOptions;
  index: number;
  onRemove: (index: number) => void;
  onUpdateQuantity: (index: number, quantity: number) => void;
  primaryColor: string;
  reducedMotion: boolean;
}

function CartItemRow({ item, index, onRemove, onUpdateQuantity, primaryColor, reducedMotion }: CartItemRowProps) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const swipeThreshold = -80;

  const handleDragEnd = (_: any, info: PanInfo) => {
    setIsDragging(false);
    if (info.offset.x < swipeThreshold) {
      // Remove item
      onRemove(index);
    } else {
      setSwipeOffset(0);
    }
  };

  const handleDrag = (_: any, info: PanInfo) => {
    if (info.offset.x < 0) {
      setSwipeOffset(Math.max(info.offset.x, -100));
    }
  };

  const mainImage = item.product.main_image_url || item.product.image_url || '';
  
  return (
    <div className="relative overflow-hidden rounded-xl mb-3">
      {/* Delete background */}
      <div 
        className="absolute inset-y-0 right-0 w-24 bg-destructive/90 flex items-center justify-center rounded-r-xl"
        style={{ opacity: Math.min(1, Math.abs(swipeOffset) / 80) }}
      >
        <Trash2 className="w-5 h-5 text-white" />
      </div>

      {/* Main content */}
      <motion.div
        className="relative glass-card p-3 flex gap-3 cursor-grab active:cursor-grabbing"
        drag={reducedMotion ? false : "x"}
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.1}
        onDrag={handleDrag}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        animate={{ x: isDragging ? swipeOffset : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        {/* Image */}
        {mainImage && (
          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted/30">
            <img src={mainImage} alt={item.product.name} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm line-clamp-1">{item.product.name}</h4>
          
          {item.selectedOptions.length > 0 && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {item.selectedOptions.map(o => o.valueName).join(', ')}
            </p>
          )}
          
          <p className="text-sm font-bold mt-1" style={{ color: primaryColor }}>
            {formatCurrency(item.lineTotal)}
          </p>
        </div>

        {/* Quantity controls */}
        <div className="flex flex-col items-center justify-center gap-1">
          <motion.button
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/10"
            onClick={() => onUpdateQuantity(index, item.quantity + 1)}
            whileTap={{ scale: 0.9 }}
          >
            <Plus className="w-3 h-3" />
          </motion.button>
          
          <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
          
          <motion.button
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/10"
            onClick={() => onUpdateQuantity(index, item.quantity - 1)}
            whileTap={{ scale: 0.9 }}
          >
            <Minus className="w-3 h-3" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

export function CartSheet({ open, onClose, onCheckout, primaryColor = '#C9A24D' }: CartSheetProps) {
  const { items, removeItem, updateQuantity, totalAmount, clearCart } = useCartContext();
  const reducedMotion = usePrefersReducedMotion();

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent 
        side="bottom" 
        className="h-[85vh] max-h-[85vh] rounded-t-3xl border-t border-white/10 glass-strong p-0 flex flex-col"
      >
        {/* Header */}
        <SheetHeader className="flex-shrink-0 p-4 pb-2 border-b border-white/10">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-semibold flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" style={{ color: primaryColor }} />
              Carrinho
              {items.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  ({items.length} {items.length === 1 ? 'item' : 'itens'})
                </span>
              )}
            </SheetTitle>
            
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={clearCart}
              >
                Limpar
              </Button>
            )}
          </div>
        </SheetHeader>

        {/* Items list */}
        <ScrollArea className="flex-1 px-4 py-3">
          <AnimatePresence mode="popLayout">
            {items.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <motion.div
                  className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mb-4"
                  animate={reducedMotion ? {} : { y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <ShoppingBag className="w-10 h-10 text-muted-foreground" />
                </motion.div>
                <p className="text-muted-foreground">O carrinho está vazio</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Adicione produtos para começar
                </p>
              </motion.div>
            ) : (
              items.map((item, index) => (
                <motion.div
                  key={`${item.product.id}-${index}`}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100, height: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  <CartItemRow
                    item={item}
                    index={index}
                    onRemove={removeItem}
                    onUpdateQuantity={updateQuantity}
                    primaryColor={primaryColor}
                    reducedMotion={reducedMotion}
                  />
                </motion.div>
              ))
            )}
          </AnimatePresence>
          
          {/* Hint for swipe */}
          {items.length > 0 && (
            <p className="text-xs text-muted-foreground/60 text-center mt-2">
              Arraste para a esquerda para remover
            </p>
          )}
        </ScrollArea>

        {/* Sticky footer */}
        {items.length > 0 && (
          <div className="flex-shrink-0 p-4 border-t border-white/10 bg-background/80 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-xl font-bold" style={{ color: primaryColor }}>
                {formatCurrency(totalAmount)}
              </span>
            </div>
            
            <motion.button
              className="w-full h-12 rounded-xl font-semibold text-base relative overflow-hidden ripple"
              style={{ 
                backgroundColor: primaryColor,
                color: 'hsl(225 25% 6%)',
              }}
              onClick={onCheckout}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 4,
                  ease: 'easeInOut',
                }}
              />
              <span className="relative z-10">Finalizar Encomenda</span>
            </motion.button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
