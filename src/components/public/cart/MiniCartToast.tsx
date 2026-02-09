import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X } from 'lucide-react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export interface ToastData {
  id: string;
  productName: string;
  productImage?: string;
  timestamp: number;
}

interface MiniCartToastProps {
  toast: ToastData | null;
  onDismiss: () => void;
  onViewCart: () => void;
  primaryColor?: string;
}

export function MiniCartToast({ toast, onDismiss, onViewCart, primaryColor = '#C9A24D' }: MiniCartToastProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (toast) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onDismiss, 300);
      }, 2500);
      
      return () => clearTimeout(timer);
    }
  }, [toast, onDismiss]);

  return (
    <AnimatePresence>
      {isVisible && toast && (
        <motion.div
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 50, scale: 0.9 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="fixed bottom-24 left-4 right-4 z-40 sm:left-auto sm:right-4 sm:max-w-sm"
        >
          <div className="glass-strong rounded-2xl p-3 border border-white/10 shadow-2xl">
            <div className="flex items-center gap-3">
              {/* Product image or icon */}
              <div 
                className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                {toast.productImage ? (
                  <img 
                    src={toast.productImage} 
                    alt="" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ShoppingCart className="w-5 h-5" style={{ color: primaryColor }} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-1">{toast.productName}</p>
                <p className="text-xs text-muted-foreground">Adicionado ao carrinho</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <motion.button
                  className="px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ 
                    backgroundColor: primaryColor,
                    color: 'hsl(225 25% 6%)',
                  }}
                  onClick={() => {
                    setIsVisible(false);
                    setTimeout(onViewCart, 150);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Ver
                </motion.button>
                
                <motion.button
                  className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center"
                  onClick={() => {
                    setIsVisible(false);
                    onDismiss();
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
