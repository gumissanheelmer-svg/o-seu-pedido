import { useState, useEffect, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Sparkles } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CatalogFloatingButtonProps {
  primaryColor?: string;
  onWhatsAppClick: () => void;
  hasWhatsApp?: boolean;
}

export const CatalogFloatingButton = forwardRef<HTMLButtonElement, CatalogFloatingButtonProps>(({
  primaryColor = '#C9A24D',
  onWhatsAppClick,
  hasWhatsApp = true,
}, ref) => {
  const [showTooltip, setShowTooltip] = useState(false);

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

  // Hide if no WhatsApp configured
  if (!hasWhatsApp) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 safe-area-inset-bottom">
        <Tooltip open={showTooltip}>
          <TooltipTrigger asChild>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="relative"
            >
              {/* Floating animation wrapper */}
              <motion.div
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                {/* Outer glow ring */}
                <motion.div
                  className="absolute -inset-4 rounded-full"
                  style={{
                    background: `radial-gradient(circle, #25D36630 0%, transparent 70%)`,
                  }}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 0.2, 0.5],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                
                {/* Pulse ring */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-[#25D366]"
                  animate={{
                    scale: [1, 2],
                    opacity: [0.6, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                />

                {/* Main FAB button */}
                <motion.button
                  ref={ref}
                  onClick={onWhatsAppClick}
                  className="relative w-16 h-16 rounded-full shadow-2xl overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
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
                      scale: [1, 1.3, 1],
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <Sparkles className="w-3 h-3 text-white/80" />
                  </motion.div>

                  {/* Icon */}
                  <div className="relative flex items-center justify-center w-full h-full">
                    <MessageCircle className="w-7 h-7 text-white" fill="white" />
                  </div>
                </motion.button>
              </motion.div>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent 
            side="left" 
            className="glass-strong text-white px-4 py-2 rounded-xl font-medium shadow-xl border-white/10"
          >
            <div className="flex items-center gap-2">
              <span>Fale connosco</span>
              <span>💬</span>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
});

CatalogFloatingButton.displayName = 'CatalogFloatingButton';
