import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Store } from 'lucide-react';
import { usePublicBusiness } from '@/hooks/useBusiness';
import { usePublicProducts, ProductWithOptions } from '@/hooks/useProducts';
import { usePublicCategories } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { ProductDetailModal } from '@/components/public/ProductDetailModal';
import { HeroParallax } from '@/components/public/HeroParallax';
import { CatalogEmptyState } from '@/components/public/CatalogEmptyState';
import { CatalogProductCard } from '@/components/public/CatalogProductCard';
import { CatalogFloatingButton } from '@/components/public/CatalogFloatingButton';
import { CatalogStickyHeader } from '@/components/public/CatalogStickyHeader';
import { SkeletonHero, SkeletonGrid } from '@/components/public/animations/SkeletonCard';
import { staggerContainer } from '@/components/public/animations/MotionComponents';
import { AdminAccessButton } from '@/components/public/AdminAccessButton';

export default function PublicCatalogPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: business, isLoading: businessLoading, error: businessError } = usePublicBusiness(slug || '');
  const { data: products, isLoading: productsLoading } = usePublicProducts(business?.id || '');
  const { data: categories } = usePublicCategories(business?.id || '');
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithOptions | null>(null);

  const primaryColor = business?.primary_color || '#C9A24D';

  // Loading state with skeleton
  if (businessLoading || productsLoading) {
    return (
      <div className="min-h-screen theme-premium-dark bg-background">
        <SkeletonHero />
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <SkeletonGrid count={6} />
        </div>
      </div>
    );
  }

  // Error state
  if (businessError || !business) {
    return (
      <div className="min-h-screen theme-premium-dark bg-background flex items-center justify-center">
        <motion.div 
          className="text-center max-w-md px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-20 h-20 rounded-2xl glass mx-auto mb-4 flex items-center justify-center">
            <Store className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Negócio Indisponível</h1>
          <p className="text-muted-foreground">
            Este negócio está temporariamente indisponível ou não existe.
          </p>
        </motion.div>
      </div>
    );
  }

  const filteredProducts = selectedCategory
    ? products?.filter(p => p.category_id === selectedCategory)
    : products;

  const groupedByCategory = categories?.reduce((acc, cat) => {
    const catProducts = products?.filter(p => p.category_id === cat.id) || [];
    if (catProducts.length > 0) {
      acc[cat.id] = { name: cat.name, products: catProducts };
    }
    return acc;
  }, {} as Record<string, { name: string; products: ProductWithOptions[] }>) || {};

  // Products without category
  const uncategorizedProducts = products?.filter(p => !p.category_id) || [];

  const hasProducts = products && products.length > 0;

  const handleWhatsAppClick = () => {
    const phone = business.whatsapp_number.replace(/\D/g, '');
    const formattedPhone = phone.startsWith('258') ? phone : (phone.length === 9 ? '258' + phone : phone);
    const text = encodeURIComponent(`Olá! Vi o catálogo de ${business.name} e gostaria de saber mais.`);
    window.open(`https://wa.me/${formattedPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen theme-premium-dark bg-background flex flex-col">
      {/* Hero Section with Parallax */}
      <AdminAccessButton />
      <HeroParallax business={business} />

      {/* Sticky Header */}
      <CatalogStickyHeader business={business} />

      {/* Category Filter */}
      {categories && categories.length > 0 && hasProducts && (
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <motion.div 
            className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className={`rounded-xl shrink-0 ${
                selectedCategory === null 
                  ? 'border-0' 
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
              style={selectedCategory === null ? { backgroundColor: primaryColor, color: 'hsl(225 25% 6%)' } : {}}
            >
              Todos
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap rounded-xl shrink-0 ${
                  selectedCategory === cat.id 
                    ? 'border-0' 
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
                style={selectedCategory === cat.id ? { backgroundColor: primaryColor, color: 'hsl(225 25% 6%)' } : {}}
              >
                {cat.name}
              </Button>
            ))}
          </motion.div>
        </div>
      )}

      {/* Main Content */}
      {!hasProducts ? (
        <CatalogEmptyState business={business} />
      ) : (
        <main className="container max-w-4xl mx-auto px-4 pb-28 flex-1">
          {selectedCategory ? (
            // Filtered view
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              key={selectedCategory}
            >
              {filteredProducts?.map((product) => (
                <CatalogProductCard
                  key={product.id}
                  product={product}
                  onClick={() => setSelectedProduct(product)}
                  primaryColor={primaryColor}
                />
              ))}
            </motion.div>
          ) : (
            // Grouped by category view
            <div className="space-y-10">
              {Object.entries(groupedByCategory).map(([catId, { name, products: catProducts }], catIndex) => (
                <motion.div 
                  key={catId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: catIndex * 0.1 }}
                >
                  <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-3">
                    <span 
                      className="w-1 h-6 rounded-full"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <span>{name}</span>
                  </h2>
                  <motion.div 
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    {catProducts.map((product) => (
                      <CatalogProductCard
                        key={product.id}
                        product={product}
                        onClick={() => setSelectedProduct(product)}
                        primaryColor={primaryColor}
                      />
                    ))}
                  </motion.div>
                </motion.div>
              ))}
              {uncategorizedProducts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Object.keys(groupedByCategory).length * 0.1 }}
                >
                  <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-3">
                    <span 
                      className="w-1 h-6 rounded-full"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <span>Outros</span>
                  </h2>
                  <motion.div 
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    {uncategorizedProducts.map((product) => (
                      <CatalogProductCard
                        key={product.id}
                        product={product}
                        onClick={() => setSelectedProduct(product)}
                        primaryColor={primaryColor}
                      />
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </div>
          )}
        </main>
      )}

      {/* Floating WhatsApp Button */}
      <AnimatePresence>
        <CatalogFloatingButton
          primaryColor={primaryColor}
          onWhatsAppClick={handleWhatsAppClick}
          hasWhatsApp={!!business.whatsapp_number}
        />
      </AnimatePresence>

      {/* Product Detail Modal with Direct WhatsApp */}
      <ProductDetailModal
        product={selectedProduct}
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        businessName={business.name}
        whatsappNumber={business.whatsapp_number}
        primaryColor={primaryColor}
      />

      {/* Footer */}
      <footer className="container max-w-4xl mx-auto px-4 py-6 text-center mt-auto">
        <p className="text-xs text-muted-foreground">
          Powered by <span className="font-semibold" style={{ color: primaryColor }}>Agenda Smart</span>
        </p>
      </footer>
    </div>
  );
}
