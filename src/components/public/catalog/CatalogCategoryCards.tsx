import { motion } from 'framer-motion';
import { Cake, Gift, Cookie, Slice, Package } from 'lucide-react';
import { Category } from '@/hooks/useCategories';

interface CatalogCategoryCardsProps {
  categories: Category[];
  onSelectCategory: (categoryId: string | null) => void;
  selectedCategory: string | null;
  primaryColor: string;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'bolos de aniversário': Cake,
  'bolos personalizados': Cake,
  'cupcakes': Cookie,
  'fatias de bolo': Slice,
  'outros': Package,
};

const CATEGORY_GRADIENTS = [
  'from-pink-500/20 to-rose-600/20',
  'from-amber-500/20 to-orange-600/20',
  'from-violet-500/20 to-purple-600/20',
  'from-emerald-500/20 to-teal-600/20',
  'from-sky-500/20 to-blue-600/20',
];

function getCategoryIcon(name: string): React.ElementType {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return Gift;
}

export function CatalogCategoryCards({ categories, onSelectCategory, selectedCategory, primaryColor }: CatalogCategoryCardsProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-10">
      <div className="container max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Categorias
          </h2>
          <p className="text-muted-foreground text-sm">
            Explore as nossas deliciosas opções
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat, index) => {
            const Icon = getCategoryIcon(cat.name);
            const isSelected = selectedCategory === cat.id;
            const gradient = CATEGORY_GRADIENTS[index % CATEGORY_GRADIENTS.length];

            return (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
                whileHover={{ y: -6, scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelectCategory(isSelected ? null : cat.id)}
                className={`relative group rounded-2xl p-5 text-center transition-all duration-300 overflow-hidden ${
                  isSelected
                    ? 'ring-2 shadow-lg'
                    : 'glass-card hover:border-white/20'
                }`}
                style={isSelected ? {
                  ringColor: primaryColor,
                  boxShadow: `0 0 30px -5px ${primaryColor}40`,
                  borderColor: `${primaryColor}60`,
                } : {}}
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`} />
                
                {/* Category image or icon */}
                <div className="relative z-10">
                  {cat.image_url ? (
                    <div className="w-16 h-16 mx-auto mb-3 rounded-xl overflow-hidden">
                      <img 
                        src={cat.image_url} 
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div 
                      className="w-16 h-16 mx-auto mb-3 rounded-xl flex items-center justify-center transition-all duration-300"
                      style={{ 
                        backgroundColor: isSelected ? `${primaryColor}30` : 'rgba(255,255,255,0.05)',
                      }}
                    >
                      <Icon 
                        className="w-7 h-7 transition-colors duration-300"
                        style={{ color: isSelected ? primaryColor : 'rgba(255,255,255,0.5)' }}
                      />
                    </div>
                  )}
                  <h3 className="text-sm font-semibold text-foreground line-clamp-2">
                    {cat.name}
                  </h3>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
