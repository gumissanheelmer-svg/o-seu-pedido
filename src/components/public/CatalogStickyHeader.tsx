import { motion } from 'framer-motion';
import { Business } from '@/types/database';

interface CatalogStickyHeaderProps {
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

export function CatalogStickyHeader({ business }: CatalogStickyHeaderProps) {
  const primaryColor = business.primary_color || '#C9A24D';

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/10">
      <div className="container max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center gap-3">
          {business.logo_url ? (
            <motion.img
              src={business.logo_url}
              alt={business.name}
              className="w-9 h-9 rounded-xl object-cover shadow-lg"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            />
          ) : (
            <motion.div 
              className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shadow-lg"
              style={{ 
                backgroundColor: primaryColor,
                color: 'hsl(225 25% 6%)',
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {getInitials(business.name)}
            </motion.div>
          )}
          <span className="font-semibold text-foreground text-sm truncate max-w-[200px] sm:max-w-none">
            {business.name}
          </span>
        </div>
      </div>
    </header>
  );
}
