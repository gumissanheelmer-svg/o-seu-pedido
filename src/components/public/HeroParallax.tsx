import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ShoppingBag, MessageCircle, ChevronDown } from 'lucide-react';
import { Business } from '@/types/database';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import bakeryHeroBg from '@/assets/bakery-hero.jpg';

interface HeroParallaxProps {
  business: Business;
  onViewMenu?: () => void;
  onOrder?: () => void;
  onWhatsApp?: () => void;
}

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(word => word[0]).join('').toUpperCase();
}

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

export function HeroParallax({ business, onViewMenu, onOrder, onWhatsApp }: HeroParallaxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const { scrollY } = useScroll();
  
  const backgroundY = useTransform(scrollY, [0, 400], [0, reducedMotion ? 0 : 60]);
  const contentY = useTransform(scrollY, [0, 400], [0, reducedMotion ? 0 : 30]);
  const opacity = useTransform(scrollY, [0, 350], [1, 0.3]);

  const primaryColor = business.primary_color || '#C9A24D';
  const businessTypeLabel = getBusinessTypeLabel(business.business_type);
  const hasCoverMedia = (business as any).cover_video_url || business.cover_image_url;
  const bgImage = hasCoverMedia ? (business.cover_image_url || '') : bakeryHeroBg;

  return (
    <div ref={containerRef} className="relative overflow-hidden min-h-[420px] sm:min-h-[500px]">
      {/* Background with parallax */}
      <motion.div className="absolute inset-0" style={{ y: backgroundY }}>
        {/* Cover video */}
        {(business as any).cover_video_url ? (
          <video
            src={(business as any).cover_video_url}
            className="absolute inset-0 w-full h-full object-cover scale-110"
            autoPlay muted loop playsInline
          />
        ) : (
          <motion.img
            src={bgImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover scale-110"
          />
        )}
        
        {/* Dark overlay for readability */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.7) 50%, rgba(11,13,18,0.95) 100%)'
        }} />
        
        {/* Noise texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }} />
      </motion.div>

      {/* Radial glow */}
      <motion.div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute inset-0"
          style={{ background: `radial-gradient(ellipse 80% 50% at 50% 100%, ${primaryColor}20 0%, transparent 70%)` }}
          animate={reducedMotion ? {} : { opacity: [0.4, 0.7, 0.4], scale: [1, 1.05, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Content */}
      <motion.div className="relative z-10 px-4 py-14 sm:py-20" style={{ y: contentY, opacity }}>
        <motion.div 
          className="max-w-4xl mx-auto flex flex-col items-center text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo */}
          <motion.div 
            className="mb-5 relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.div
              className="absolute inset-0 rounded-2xl blur-2xl"
              style={{ backgroundColor: primaryColor }}
              animate={reducedMotion ? { opacity: 0.4 } : { opacity: [0.3, 0.5, 0.3], scale: [1, 1.2, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            
            {business.logo_url ? (
              <div 
                className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 shadow-2xl glass"
                style={{ borderColor: `${primaryColor}40` }}
              >
                <img src={business.logo_url} alt={business.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div 
                className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 shadow-2xl flex items-center justify-center text-3xl font-bold glass"
                style={{ borderColor: `${primaryColor}40`, color: primaryColor }}
              >
                {getInitials(business.name)}
              </div>
            )}
          </motion.div>

          {/* Business Name */}
          <motion.h1 
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 text-white drop-shadow-lg"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            {business.name}
          </motion.h1>

          {/* Subtitle */}
          {businessTypeLabel && (
            <motion.p 
              className="text-sm sm:text-base font-medium mb-2"
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
              className="text-sm max-w-md leading-relaxed text-white/60 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              {business.description}
            </motion.p>
          )}

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.75 }}
          >
            {onViewMenu && (
              <motion.button
                onClick={onViewMenu}
                className="px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all"
                style={{ 
                  backgroundColor: primaryColor,
                  color: 'hsl(225 25% 6%)',
                  boxShadow: `0 0 30px -5px ${primaryColor}50`,
                }}
                whileHover={{ scale: 1.05, boxShadow: `0 0 40px -5px ${primaryColor}70` }}
                whileTap={{ scale: 0.97 }}
              >
                <ShoppingBag className="w-4 h-4" />
                Ver Menu
              </motion.button>
            )}
            
            {onOrder && (
              <motion.button
                onClick={onOrder}
                className="px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 glass border-white/20 text-white hover:bg-white/10 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                Fazer Encomenda
              </motion.button>
            )}
            
            {onWhatsApp && (
              <motion.button
                onClick={onWhatsApp}
                className="px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all"
                style={{
                  backgroundColor: '#25D366',
                  color: 'white',
                  boxShadow: '0 0 25px -5px rgba(37,211,102,0.4)',
                }}
                whileHover={{ scale: 1.05, boxShadow: '0 0 35px -5px rgba(37,211,102,0.6)' }}
                whileTap={{ scale: 0.97 }}
              >
                <MessageCircle className="w-4 h-4" fill="white" />
                Pedir no WhatsApp
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
      
      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
        animate={reducedMotion ? {} : { y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ChevronDown className="w-6 h-6 text-white/30" />
      </motion.div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
        style={{ background: 'linear-gradient(to top, hsl(225 25% 6%), transparent)' }}
      />
    </div>
  );
}
