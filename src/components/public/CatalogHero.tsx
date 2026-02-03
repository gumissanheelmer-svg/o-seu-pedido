import { Store } from 'lucide-react';
import { Business } from '@/types/database';

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
    <div className="relative overflow-hidden">
      {/* Background Layer */}
      <div className="absolute inset-0">
        {(business as any).cover_video_url ? (
          <video
            src={(business as any).cover_video_url}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : business.cover_image_url ? (
          <img
            src={business.cover_image_url}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div 
            className="w-full h-full"
            style={{ 
              background: `linear-gradient(135deg, ${primaryColor}30 0%, ${primaryColor}10 50%, transparent 100%)` 
            }}
          />
        )}
        {/* Overlay gradient */}
        <div 
          className="absolute inset-0"
          style={{
            background: hasCoverMedia 
              ? 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)'
              : 'transparent'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          {/* Logo */}
          <div className="mb-4">
            {business.logo_url ? (
              <div 
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-4 border-white/20 shadow-xl backdrop-blur-sm"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                <img
                  src={business.logo_url}
                  alt={business.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div 
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white/20 shadow-xl flex items-center justify-center text-white text-3xl font-bold"
                style={{ backgroundColor: primaryColor }}
              >
                {getInitials(business.name)}
              </div>
            )}
          </div>

          {/* Business Name */}
          <h1 
            className={`text-2xl sm:text-3xl font-bold mb-2 ${
              hasCoverMedia ? 'text-white drop-shadow-lg' : 'text-foreground'
            }`}
          >
            {business.name}
          </h1>

          {/* Subtitle / Business Type */}
          {businessTypeLabel && (
            <p 
              className={`text-sm sm:text-base font-medium mb-3 ${
                hasCoverMedia ? 'text-white/80' : 'text-muted-foreground'
              }`}
            >
              {businessTypeLabel}
            </p>
          )}

          {/* Description */}
          {business.description && (
            <p 
              className={`text-sm max-w-md leading-relaxed ${
                hasCoverMedia ? 'text-white/70' : 'text-muted-foreground'
              }`}
            >
              {business.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
