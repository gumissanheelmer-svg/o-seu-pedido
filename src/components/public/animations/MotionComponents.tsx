import { motion, HTMLMotionProps, Variants } from 'framer-motion';
import { ReactNode, forwardRef } from 'react';

// Stagger container for list animations
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

// Stagger item animation
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
};

// Fade up animation
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 20,
    },
  },
};

// Scale in animation
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },
  },
};

// Slide horizontal for step transitions
export const slideHorizontal = (direction: 'left' | 'right'): Variants => ({
  hidden: {
    opacity: 0,
    x: direction === 'left' ? -40 : 40,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    x: direction === 'left' ? 40 : -40,
    transition: {
      duration: 0.2,
    },
  },
});

// Magnetic button effect
interface MagneticButtonProps extends HTMLMotionProps<'button'> {
  children: ReactNode;
}

export const MagneticButton = forwardRef<HTMLButtonElement, MagneticButtonProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        className={className}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
MagneticButton.displayName = 'MagneticButton';

// Animated check mark (SVG draw)
interface AnimatedCheckProps {
  size?: number;
  color?: string;
  delay?: number;
}

export function AnimatedCheck({ size = 80, color = 'currentColor', delay = 0 }: AnimatedCheckProps) {
  const pathVariants: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: {
          type: 'spring',
          stiffness: 100,
          damping: 15,
          delay,
        },
        opacity: { duration: 0.2, delay },
      },
    },
  };

  const circleVariants: Variants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 15,
        delay: delay - 0.1,
      },
    },
  };

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      initial="hidden"
      animate="visible"
    >
      <motion.circle
        cx="40"
        cy="40"
        r="36"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeOpacity="0.2"
        variants={circleVariants}
      />
      <motion.circle
        cx="40"
        cy="40"
        r="36"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        variants={pathVariants}
        style={{ rotate: -90, originX: '50%', originY: '50%' }}
      />
      <motion.path
        d="M25 42 L35 52 L55 32"
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={pathVariants}
        custom={0.3}
      />
    </motion.svg>
  );
}

// Ping animation for notifications
export function PingIndicator({ color = 'hsl(43 74% 49%)' }: { color?: string }) {
  return (
    <span className="relative flex h-3 w-3">
      <motion.span
        className="absolute inline-flex h-full w-full rounded-full opacity-75"
        style={{ backgroundColor: color }}
        animate={{ scale: [1, 1.5, 1.5], opacity: [0.75, 0, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <span
        className="relative inline-flex rounded-full h-3 w-3"
        style={{ backgroundColor: color }}
      />
    </span>
  );
}

// Shake animation for validation errors
export const shakeAnimation = {
  shake: {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.5 },
  },
};

// Confetti-like celebration particles (lightweight)
export function CelebrationParticles({ count = 12 }: { count?: number }) {
  const particles = Array.from({ length: count }, (_, i) => i);
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((i) => {
        const angle = (i / count) * 360;
        const delay = Math.random() * 0.3;
        const size = 4 + Math.random() * 4;
        const colors = ['#C9A24D', '#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4'];
        const color = colors[i % colors.length];
        
        return (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2 rounded-full"
            style={{
              width: size,
              height: size,
              backgroundColor: color,
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
            animate={{
              x: Math.cos((angle * Math.PI) / 180) * (80 + Math.random() * 40),
              y: Math.sin((angle * Math.PI) / 180) * (80 + Math.random() * 40) - 30,
              opacity: [1, 1, 0],
              scale: [0, 1, 0.5],
              rotate: Math.random() * 360,
            }}
            transition={{
              duration: 0.8,
              delay,
              ease: 'easeOut',
            }}
          />
        );
      })}
    </div>
  );
}
