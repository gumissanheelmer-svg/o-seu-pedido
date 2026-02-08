import { motion } from 'framer-motion';
import { Cake, MessageCircle, Package, Flower2, Gift } from 'lucide-react';
import { Business } from '@/types/database';

interface CatalogEmptyStateProps {
  business: Business;
}

// Get icon based on business type
function getBusinessIcon(type: string) {
  const icons: Record<string, React.ReactNode> = {
    bolos: <Cake className="w-16 h-16 sm:w-20 sm:h-20" />,
    buques: <Flower2 className="w-16 h-16 sm:w-20 sm:h-20" />,
    presente: <Gift className="w-16 h-16 sm:w-20 sm:h-20" />,
  };
  return icons[type] || <Package className="w-16 h-16 sm:w-20 sm:h-20" />;
}

// Get friendly message based on business type
function getEmptyMessage(type: string): { title: string; subtitle: string } {
  const messages: Record<string, { title: string; subtitle: string }> = {
    bolos: {
      title: 'Estamos a preparar novidades para si 🍰',
      subtitle: 'Os nossos produtos estarão disponíveis em breve!',
    },
    buques: {
      title: 'Novidades floridas a caminho 💐',
      subtitle: 'Os nossos arranjos estarão disponíveis em breve!',
    },
    presente: {
      title: 'Presentes especiais em preparação 🎁',
      subtitle: 'Os nossos produtos estarão disponíveis em breve!',
    },
    lanchonete: {
      title: 'Menu a ser preparado 🍔',
      subtitle: 'Os nossos produtos estarão disponíveis em breve!',
    },
    restaurante: {
      title: 'Novos pratos a caminho 🍽️',
      subtitle: 'O nosso menu estará disponível em breve!',
    },
  };
  return messages[type] || {
    title: 'Estamos a preparar novidades para si ✨',
    subtitle: 'Os nossos produtos estarão disponíveis em breve!',
  };
}

export function CatalogEmptyState({ business }: CatalogEmptyStateProps) {
  const primaryColor = business.primary_color || '#C9A24D';
  const icon = getBusinessIcon(business.business_type);
  const message = getEmptyMessage(business.business_type);

  const handleWhatsAppClick = () => {
    const phone = business.whatsapp_number.replace(/\D/g, '');
    const text = encodeURIComponent(`Olá! Vi o catálogo de ${business.name} e gostaria de saber mais.`);
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  return (
    <motion.div 
      className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className="text-center max-w-sm">
        {/* Icon with background and floating animation */}
        <motion.div 
          className="inline-flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32 rounded-3xl mb-6 glass relative"
          style={{ 
            borderColor: `${primaryColor}30`,
            color: primaryColor 
          }}
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 rounded-3xl blur-2xl opacity-30"
            style={{ backgroundColor: primaryColor }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <span className="relative z-10">{icon}</span>
        </motion.div>

        {/* Message */}
        <motion.h2 
          className="text-xl sm:text-2xl font-bold text-foreground mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {message.title}
        </motion.h2>
        <motion.p 
          className="text-muted-foreground text-sm sm:text-base mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {message.subtitle}
        </motion.p>

        {/* CTA Button */}
        <motion.button
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-base ripple relative overflow-hidden"
          style={{ 
            backgroundColor: primaryColor,
            color: 'hsl(225 25% 6%)',
            boxShadow: `0 0 40px -5px ${primaryColor}60`,
          }}
          onClick={handleWhatsAppClick}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Shimmer */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12"
            animate={{ x: ['-200%', '200%'] }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
              repeatDelay: 3,
            }}
          />
          <MessageCircle className="w-5 h-5 relative z-10" />
          <span className="relative z-10">Falar no WhatsApp</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
