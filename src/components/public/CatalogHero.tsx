import { motion } from 'framer-motion';
import { Business } from '@/types/database';
import { fadeUp } from './animations/MotionComponents';

interface CatalogHeroProps {
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

export function CatalogHero({ business }: CatalogHeroProps) {
  const primaryColor = business.primary_color || '#C9A24D';
  const businessTypeLabel = getBusinessTypeLabel(business.business_type);
  const hasCoverMedia = business.cover_video_url || business.cover_image_url;

  return (
    <div className="relative overflow-hidden min-h-[280px] sm:min-h-[320px]">
      {/* Background Layer with Gradient Noise Effect */}
      <div className="absolute inset-0">
        {/* Base dark gradient */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, hsl(225 25% 6%) 0%, hsl(225 25% 10%) 50%, hsl(225 25% 8%) 100%)',
          }}
        />
        
        {/* Animated radial glow */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 80% 50% at 50% 100%, ${primaryColor}25 0%, transparent 70%)`,
          }}
          animate={{
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
          animate={{
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

        {/* Cover image/video if exists */}
        {(business as any).cover_video_url ? (
          <video
            src={(business as any).cover_video_url}
            className="absolute inset-0 w-full h-full object-cover opacity-40"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : business.cover_image_url ? (
          <img
            src={business.cover_image_url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-40"
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
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 py-10 sm:py-14">
        <motion.div 
          className="max-w-4xl mx-auto flex flex-col items-center text-center"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.15, delayChildren: 0.2 },
            },
          }}
        >
          {/* Logo with glow */}
          <motion.div 
            className="mb-5 relative"
            variants={fadeUp}
          >
            {/* Glow behind logo */}
            <motion.div
              className="absolute inset-0 rounded-2xl blur-2xl opacity-50"
              style={{ backgroundColor: primaryColor }}
              animate={{
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

          {/* Business Name */}
          <motion.h1 
            className="text-2xl sm:text-3xl font-bold mb-2 text-white drop-shadow-lg"
            variants={fadeUp}
          >
            {business.name}
          </motion.h1>

          {/* Subtitle / Business Type */}
          {businessTypeLabel && (
            <motion.p 
              className="text-sm sm:text-base font-medium mb-3"
              style={{ color: `${primaryColor}cc` }}
              variants={fadeUp}
            >
              {businessTypeLabel}
            </motion.p>
          )}

          {/* Description */}
          {business.description && (
            <motion.p 
              className="text-sm max-w-md leading-relaxed text-white/60"
              variants={fadeUp}
            >
              {business.description}
            </motion.p>
          )}
        </motion.div>
      </div>
      
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
