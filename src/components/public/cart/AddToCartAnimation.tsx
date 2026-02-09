import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export interface FlyingItem {
  id: string;
  startX: number;
  startY: number;
  color: string;
  image?: string;
}

interface AddToCartAnimationProps {
  flyingItem: FlyingItem | null;
  fabPosition: { x: number; y: number };
  onComplete: () => void;
}

export function AddToCartAnimation({ flyingItem, fabPosition, onComplete }: AddToCartAnimationProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (flyingItem) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        onComplete();
      }, reducedMotion ? 0 : 500);
      
      return () => clearTimeout(timer);
    }
  }, [flyingItem, onComplete, reducedMotion]);

  if (reducedMotion || !flyingItem) return null;

  const deltaX = fabPosition.x - flyingItem.startX;
  const deltaY = fabPosition.y - flyingItem.startY;

  return (
    <AnimatePresence>
      {isAnimating && (
        <motion.div
          initial={{
            position: 'fixed',
            left: flyingItem.startX,
            top: flyingItem.startY,
            opacity: 1,
            scale: 1,
            zIndex: 9999,
          }}
          animate={{
            left: flyingItem.startX + deltaX,
            top: flyingItem.startY + deltaY,
            opacity: 0,
            scale: 0.3,
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.45,
            ease: [0.32, 0.72, 0, 1], // Custom easing for arc effect
          }}
          className="pointer-events-none"
        >
          <div 
            className="w-12 h-12 rounded-xl overflow-hidden shadow-2xl flex items-center justify-center"
            style={{ 
              backgroundColor: flyingItem.color,
              boxShadow: `0 0 30px ${flyingItem.color}80`,
            }}
          >
            {flyingItem.image ? (
              <img 
                src={flyingItem.image} 
                alt="" 
                className="w-full h-full object-cover"
              />
            ) : (
              <ShoppingCart className="w-5 h-5 text-white" />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
