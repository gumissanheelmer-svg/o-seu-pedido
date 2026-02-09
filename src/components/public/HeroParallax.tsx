import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Business } from '@/types/database';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface HeroParallaxProps {
  business: Business;
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

// Map business type to friendly label
function getBusinessTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    bolos: 'Bolos & Confeitaria',
    lanchonete: 'Lanchonete',
    buques: 'Buquês & Flores',
    restaurante: 'Restaurante',
    presente: 'Presentes',
    decoracao: 'Decoração',
    personalizado: 'Produtos Personalizados',
    outro: '',
  };
  return labels[type] || '';
}

export function HeroParallax({ business }: HeroParallaxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  
  const { scrollY } = useScroll();
  
  // Parallax transforms - only when motion is enabled
  const backgroundY = useTransform(scrollY, [0, 300], [0, reducedMotion ? 0 : 18]);
  const glowY = useTransform(scrollY, [0, 300], [0, reducedMotion ? 0 : -10]);
  const contentY = useTransform(scrollY, [0, 300], [0, reducedMotion ? 0 : 25]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.6]);

  const primaryColor = business.primary_color || '#C9A24D';
  const businessTypeLabel = getBusinessTypeLabel(business.business_type);
  const hasCoverMedia = (business as any).cover_video_url || business.cover_image_url;

  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden min-h-[280px] sm:min-h-[320px]"
    >
      {/* Background Layer with Parallax */}
      <motion.div 
        className="absolute inset-0"
        style={{ y: backgroundY }}
      >
        {/* Base dark gradient */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, hsl(225 25% 6%) 0%, hsl(225 25% 10%) 50%, hsl(225 25% 8%) 100%)',
          }}
        />
        
        {/* Cover image/video if exists */}
        {(business as any).cover_video_url ? (
          <video
            src={(business as any).cover_video_url}
            className="absolute inset-0 w-full h-full object-cover opacity-40 scale-110"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : business.cover_image_url ? (
          <motion.img
            src={business.cover_image_url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-40 scale-110"
          />
        ) : null}
        
        {/* Overlay gradient for text readability */}
        <div 
          className="absolute inset-0"
          style={{
            background: hasCoverMedia 
              ? 'linear-gradient(to bottom, rgba(11,13,18,0.6) 0%, rgba(11,13,18,0.9) 100%)'
              : 'transparent'
          }}
        />
        
        {/* Noise texture overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </motion.div>

      {/* Animated radial glow with inverse parallax */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ y: glowY }}
      >
        <motion.div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 80% 50% at 50% 100%, ${primaryColor}25 0%, transparent 70%)`,
          }}
          animate={reducedMotion ? {} : {
            opacity: [0.5, 0.8, 0.5],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Secondary floating glow */}
        <motion.div
          className="absolute -top-1/2 -right-1/4 w-full h-full"
          style={{
            background: `radial-gradient(circle at center, ${primaryColor}15 0%, transparent 50%)`,
          }}
          animate={reducedMotion ? {} : {
            x: [0, 30, 0],
            y: [0, -20, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>

      {/* Content with parallax */}
      <motion.div 
        className="relative z-10 px-4 py-10 sm:py-14"
        style={{ y: contentY, opacity }}
      >
        <motion.div 
          className="max-w-4xl mx-auto flex flex-col items-center text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, staggerChildren: 0.15 }}
        >
          {/* Logo with glow */}
          <motion.div 
            className="mb-5 relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Glow behind logo */}
            <motion.div
              className="absolute inset-0 rounded-2xl blur-2xl"
              style={{ backgroundColor: primaryColor }}
              animate={reducedMotion ? { opacity: 0.4 } : {
                opacity: [0.3, 0.5, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            
            {business.logo_url ? (
              <div 
                className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 shadow-2xl glass"
                style={{ borderColor: `${primaryColor}40` }}
              >
                <img
                  src={business.logo_url}
                  alt={business.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div 
                className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 shadow-2xl flex items-center justify-center text-3xl font-bold glass"
                style={{ 
                  borderColor: `${primaryColor}40`,
                  color: primaryColor,
                }}
              >
                {getInitials(business.name)}
              </div>
            )}
          </motion.div>

          {/* Business Name with slow float */}
          <motion.h1 
            className="text-2xl sm:text-3xl font-bold mb-2 text-white drop-shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1, 
              y: reducedMotion ? 0 : undefined,
            }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            <motion.span
              animate={reducedMotion ? {} : {
                y: [-2, 2, -2],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{ display: 'inline-block' }}
            >
              {business.name}
            </motion.span>
          </motion.h1>

          {/* Subtitle / Business Type */}
          {businessTypeLabel && (
            <motion.p 
              className="text-sm sm:text-base font-medium mb-3"
              style={{ color: `${primaryColor}cc` }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              {businessTypeLabel}
            </motion.p>
          )}

          {/* Description */}
          {business.description && (
            <motion.p 
              className="text-sm max-w-md leading-relaxed text-white/60"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.65 }}
            >
              {business.description}
            </motion.p>
          )}
        </motion.div>
      </motion.div>
      
      {/* Bottom fade to content */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, hsl(225 25% 6%), transparent)',
        }}
      />
    </div>
  );
}
