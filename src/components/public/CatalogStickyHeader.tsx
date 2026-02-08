import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Plus, Minus, Trash2, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Business } from '@/types/database';
import { CartItemWithOptions } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/whatsapp';

interface CatalogStickyHeaderProps {
  business: Business;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  items: CartItemWithOptions[];
  totalItems: number;
  totalAmount: number;
  removeItem: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  onCheckout: () => void;
}

// Helper to get initials from business name
function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(word => word[0])
    .join('')
    .toUpperCase();
}

export function CatalogStickyHeader({
  business,
  cartOpen,
  setCartOpen,
  items,
  totalItems,
  totalAmount,
  removeItem,
  updateQuantity,
  onCheckout,
}: CatalogStickyHeaderProps) {
  const primaryColor = business.primary_color || '#C9A24D';

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/10">
      <div className="container max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {business.logo_url ? (
              <motion.img
                src={business.logo_url}
                alt={business.name}
                className="w-9 h-9 rounded-xl object-cover shadow-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              />
            ) : (
              <motion.div 
                className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shadow-lg"
                style={{ 
                  backgroundColor: primaryColor,
                  color: 'hsl(225 25% 6%)',
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                {getInitials(business.name)}
              </motion.div>
            )}
            <span className="font-semibold text-foreground text-sm truncate max-w-[150px] sm:max-w-none">
              {business.name}
            </span>
          </div>

          {/* Cart Button */}
          <Sheet open={cartOpen} onOpenChange={setCartOpen}>
            <SheetTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="relative rounded-xl border-white/10 bg-white/5 hover:bg-white/10"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <AnimatePresence>
                    {totalItems > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-2 -right-2"
                      >
                        <Badge 
                          className="h-5 min-w-5 flex items-center justify-center p-0 text-xs border-0"
                          style={{ 
                            backgroundColor: primaryColor,
                            color: 'hsl(225 25% 6%)',
                          }}
                        >
                          {totalItems}
                        </Badge>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md glass-strong border-l border-white/10">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-foreground">
                  <ShoppingCart className="w-5 h-5" />
                  Carrinho ({totalItems})
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col h-[calc(100vh-180px)]">
                {items.length === 0 ? (
                  <motion.div 
                    className="flex-1 flex items-center justify-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="text-center">
                      <div 
                        className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center glass"
                        style={{ borderColor: `${primaryColor}30` }}
                      >
                        <ShoppingCart className="w-8 h-8" style={{ color: primaryColor }} />
                      </div>
                      <p className="text-muted-foreground font-medium">Carrinho vazio</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Adicione produtos para continuar
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    <div className="flex-1 overflow-auto space-y-3">
                      {items.map((item, index) => (
                        <motion.div 
                          key={index} 
                          className="flex gap-3 p-3 glass rounded-xl"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <div className="w-16 h-16 bg-muted/30 rounded-lg overflow-hidden shrink-0">
                            {item.product.image_url ? (
                              <img
                                src={item.product.image_url}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Store className="w-6 h-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{item.product.name}</h4>
                            {item.selectedOptions.length > 0 && (
                              <p className="text-xs text-muted-foreground truncate">
                                {item.selectedOptions.map(o => o.valueName).join(', ')}
                              </p>
                            )}
                            <p 
                              className="text-sm font-semibold mt-1"
                              style={{ color: primaryColor }}
                            >
                              {formatCurrency(item.unitPrice)}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 rounded-lg border-white/10 bg-white/5 hover:bg-white/10"
                                onClick={() => updateQuantity(index, item.quantity - 1)}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 rounded-lg border-white/10 bg-white/5 hover:bg-white/10"
                                onClick={() => updateQuantity(index, item.quantity + 1)}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 ml-auto text-destructive rounded-lg hover:bg-destructive/10"
                                onClick={() => removeItem(index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    <Separator className="my-4 bg-white/10" />
                    <motion.div 
                      className="space-y-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="flex items-center justify-between text-lg font-bold">
                        <span>Total</span>
                        <span style={{ color: primaryColor }}>{formatCurrency(totalAmount)}</span>
                      </div>
                      <motion.button 
                        className="w-full h-12 rounded-xl font-semibold text-base ripple relative overflow-hidden"
                        style={{ 
                          backgroundColor: primaryColor,
                          color: 'hsl(225 25% 6%)',
                          boxShadow: `0 0 30px -5px ${primaryColor}60`,
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onCheckout}
                      >
                        {/* Shimmer */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                          animate={{ x: ['-200%', '200%'] }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            repeatDelay: 3,
                          }}
                        />
                        <span className="relative">Finalizar Encomenda</span>
                      </motion.button>
                    </motion.div>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
