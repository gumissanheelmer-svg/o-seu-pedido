import { Cake, MessageCircle, Package, Flower2, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    <div className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
      <div className="text-center max-w-sm">
        {/* Icon with background */}
        <div 
          className="inline-flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32 rounded-3xl mb-6"
          style={{ 
            backgroundColor: `${primaryColor}15`,
            color: primaryColor 
          }}
        >
          {icon}
        </div>

        {/* Message */}
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
          {message.title}
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base mb-8">
          {message.subtitle}
        </p>

        {/* CTA Button */}
        <Button
          size="lg"
          className="gap-2 text-white shadow-lg hover:shadow-xl transition-shadow"
          style={{ backgroundColor: primaryColor }}
          onClick={handleWhatsAppClick}
        >
          <MessageCircle className="w-5 h-5" />
          Falar no WhatsApp
        </Button>
      </div>
    </div>
  );
}
