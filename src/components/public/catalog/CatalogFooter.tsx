import { motion } from 'framer-motion';
import { MapPin, Phone, MessageCircle, Instagram } from 'lucide-react';
import { Business } from '@/types/database';

interface CatalogFooterProps {
  business: Business;
  primaryColor: string;
}

export function CatalogFooter({ business, primaryColor }: CatalogFooterProps) {
  const whatsappLink = () => {
    let phone = business.whatsapp_number.replace(/\D/g, '');
    if (!phone.startsWith('258') && phone.length === 9) phone = '258' + phone;
    return `https://wa.me/${phone}`;
  };

  return (
    <footer className="mt-auto border-t border-white/5">
      <div className="container max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              {business.logo_url ? (
                <img 
                  src={business.logo_url} 
                  alt={business.name}
                  className="w-10 h-10 rounded-xl object-cover"
                />
              ) : (
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                  style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                >
                  {business.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <span className="font-bold text-foreground">{business.name}</span>
            </div>
            {business.description && (
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                {business.description}
              </p>
            )}
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-foreground text-sm mb-3">Contacto</h4>
            <div className="space-y-2">
              {business.whatsapp_number && (
                <a 
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <MessageCircle className="w-4 h-4" style={{ color: '#25D366' }} />
                  WhatsApp
                </a>
              )}
              {business.whatsapp_number && (
                <a 
                  href={`tel:${business.whatsapp_number}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Phone className="w-4 h-4" style={{ color: primaryColor }} />
                  {business.whatsapp_number}
                </a>
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <h4 className="font-semibold text-foreground text-sm mb-3">Localização</h4>
            {business.address ? (
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: primaryColor }} />
                <span>{business.address}</span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Moçambique 🇲🇿</p>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {business.name}. Todos os direitos reservados.
          </p>
          <p className="text-xs text-muted-foreground">
            Powered by <span className="font-semibold" style={{ color: primaryColor }}>Agenda Smart</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
