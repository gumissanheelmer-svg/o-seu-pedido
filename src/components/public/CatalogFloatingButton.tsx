import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, MessageCircle, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/lib/whatsapp';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CatalogFloatingButtonProps {
  totalItems: number;
  totalAmount: number;
  primaryColor?: string;
  onCartClick: () => void;
  onWhatsAppClick?: () => void;
  showWhatsApp?: boolean;
  hasWhatsApp?: boolean;
}

export function CatalogFloatingButton({
  totalItems,
  totalAmount,
  primaryColor = '#C9A24D',
  onCartClick,
  onWhatsAppClick,
  showWhatsApp = false,
  hasWhatsApp = true,
}: CatalogFloatingButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Show tooltip on first load for 3 seconds
  useEffect(() => {
    const hasSeenTooltip = sessionStorage.getItem('fab-tooltip-seen');
    if (!hasSeenTooltip) {
      const timer = setTimeout(() => {
        setShowTooltip(true);
        setTimeout(() => {
          setShowTooltip(false);
          sessionStorage.setItem('fab-tooltip-seen', 'true');
        }, 3000);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClick = () => {
    setHasInteracted(true);
    if (totalItems > 0) {
      onCartClick();
    } else if (onWhatsAppClick) {
      onWhatsAppClick();
    }
  };

  // Hide if no WhatsApp configured and no items
  if (!hasWhatsApp && totalItems === 0) {
    return null;
  }

  const isCartMode = totalItems > 0;
  const buttonLabel = isCartMode 
    ? `Ver Carrinho (${totalItems})` 
    : 'Encomendar agora';

  return (
    <TooltipProvider>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 safe-area-inset-bottom">
        {/* Floating pill button when cart has items */}
        <AnimatePresence mode="wait">
          {isCartMode ? (
            <motion.div
              key="cart-pill"
              initial={{ scale: 0, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="relative"
            >
              {/* Glow effect background */}
              <motion.div
                className="absolute inset-0 rounded-full blur-xl opacity-40"
                style={{ backgroundColor: primaryColor }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              
              {/* Main pill button */}
              <motion.button
                onClick={handleClick}
                className="relative flex items-center gap-3 px-6 py-4 rounded-full text-white font-semibold shadow-2xl overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -20)} 100%)`,
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Glassmorphism overlay */}
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                  animate={{ x: ['-200%', '200%'] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    repeatDelay: 2,
                  }}
                />
                
                {/* Content */}
                <div className="relative flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </motion.div>
                  <span className="text-base">
                    Ver Carrinho ({totalItems})
                  </span>
                  <span className="text-sm opacity-90">
                    • {formatCurrency(totalAmount)}
                  </span>
                </div>
              </motion.button>
            </motion.div>
          ) : (
            /* Circular FAB for WhatsApp/Order */
            <Tooltip open={showTooltip}>
              <TooltipTrigger asChild>
                <motion.div
                  key="fab-circle"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="relative"
                >
                  {/* Floating animation wrapper */}
                  <motion.div
                    animate={{
                      y: [0, -6, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    {/* Outer glow ring */}
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `radial-gradient(circle, ${primaryColor}40 0%, transparent 70%)`,
                      }}
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.6, 0.2, 0.6],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                    
                    {/* Pulse ring */}
                    <motion.div
                      className="absolute inset-0 rounded-full border-2"
                      style={{ borderColor: primaryColor }}
                      animate={{
                        scale: [1, 1.8],
                        opacity: [0.8, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeOut',
                      }}
                    />

                    {/* Main FAB button */}
                    <motion.button
                      onClick={handleClick}
                      className="relative w-16 h-16 rounded-full shadow-2xl overflow-hidden"
                      style={{
                        background: showWhatsApp 
                          ? 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)'
                          : `linear-gradient(135deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -30)} 100%)`,
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {/* Glassmorphism layer */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-black/10" />
                      
                      {/* Inner glow */}
                      <div 
                        className="absolute inset-1 rounded-full opacity-50"
                        style={{
                          background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 60%)',
                        }}
                      />

                      {/* Sparkle accent */}
                      <motion.div
                        className="absolute top-2 right-2"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.8, 1, 0.8],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      >
                        <Sparkles className="w-3 h-3 text-white/80" />
                      </motion.div>

                      {/* Icon */}
                      <div className="relative flex items-center justify-center w-full h-full">
                        {showWhatsApp ? (
                          <MessageCircle className="w-7 h-7 text-white" fill="white" />
                        ) : (
                          <ShoppingCart className="w-7 h-7 text-white" />
                        )}
                      </div>

                      {/* Ripple effect on click */}
                      <AnimatePresence>
                        {hasInteracted && (
                          <motion.div
                            className="absolute inset-0 rounded-full bg-white/30"
                            initial={{ scale: 0, opacity: 1 }}
                            animate={{ scale: 2, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                          />
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </motion.div>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent 
                side="left" 
                className="bg-foreground text-background px-4 py-2 rounded-xl font-medium shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <span>Encomendar agora</span>
                  <span>💬</span>
                </div>
              </TooltipContent>
            </Tooltip>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
}

// Helper function to adjust color brightness
function adjustColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}
