import { motion } from 'framer-motion';
import { ShoppingCart, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/whatsapp';

interface CatalogFloatingButtonProps {
  totalItems: number;
  totalAmount: number;
  primaryColor?: string;
  onCartClick: () => void;
  onWhatsAppClick?: () => void;
  showWhatsApp?: boolean;
}

export function CatalogFloatingButton({
  totalItems,
  totalAmount,
  primaryColor = '#C9A24D',
  onCartClick,
  onWhatsAppClick,
  showWhatsApp = false,
}: CatalogFloatingButtonProps) {
  // Show cart button if there are items
  if (totalItems > 0) {
    return (
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-4 left-4 right-4 max-w-4xl mx-auto z-40"
      >
        <Button
          className="w-full h-14 text-base text-white shadow-xl hover:shadow-2xl transition-all rounded-2xl"
          size="lg"
          onClick={onCartClick}
          style={{ backgroundColor: primaryColor }}
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          Ver Carrinho ({totalItems}) • {formatCurrency(totalAmount)}
        </Button>
      </motion.div>
    );
  }

  // Show WhatsApp button if enabled and no cart items
  if (showWhatsApp && onWhatsAppClick) {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <Button
          size="icon"
          className="w-14 h-14 rounded-full shadow-xl hover:shadow-2xl transition-all"
          style={{ backgroundColor: '#25D366' }}
          onClick={onWhatsAppClick}
        >
          <MessageCircle className="w-6 h-6 text-white" fill="white" />
        </Button>
      </motion.div>
    );
  }

  return null;
}
