import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Store } from 'lucide-react';
import { usePublicBusiness } from '@/hooks/useBusiness';
import { usePublicProducts, ProductWithOptions } from '@/hooks/useProducts';
import { usePublicCategories } from '@/hooks/useCategories';
import { usePublicReviews, usePopularProducts } from '@/hooks/usePublicCatalog';
import { ProductDetailModal } from '@/components/public/ProductDetailModal';
import { HeroParallax } from '@/components/public/HeroParallax';
import { CatalogEmptyState } from '@/components/public/CatalogEmptyState';
import { CatalogProductCard } from '@/components/public/CatalogProductCard';
import { CatalogFloatingButton } from '@/components/public/CatalogFloatingButton';
import { CatalogStickyHeader } from '@/components/public/CatalogStickyHeader';
import { SkeletonHero, SkeletonGrid } from '@/components/public/animations/SkeletonCard';
import { staggerContainer } from '@/components/public/animations/MotionComponents';
import { AdminAccessButton } from '@/components/public/AdminAccessButton';
import { CatalogCategoryCards } from '@/components/public/catalog/CatalogCategoryCards';
import { PopularProducts } from '@/components/public/catalog/PopularProducts';
import { CustomerReviews } from '@/components/public/catalog/CustomerReviews';
import { AboutSection } from '@/components/public/catalog/AboutSection';
import { PhotoGallery } from '@/components/public/catalog/PhotoGallery';
import { CatalogFooter } from '@/components/public/catalog/CatalogFooter';

export default function PublicCatalogPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: business, isLoading: businessLoading, error: businessError } = usePublicBusiness(slug || '');
  const { data: products, isLoading: productsLoading } = usePublicProducts(business?.id || '');
  const { data: categories } = usePublicCategories(business?.id || '');
  const { data: reviews } = usePublicReviews(business?.id || '');
  const { data: popularProducts } = usePopularProducts(business?.id || '');
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithOptions | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const primaryColor = business?.primary_color || '#C9A24D';

  // Loading
  if (businessLoading || productsLoading) {
    return (
      <div className="min-h-screen theme-premium-dark bg-background">
        <SkeletonHero />
        <div className="container max-w-5xl mx-auto px-4 py-8">
          <SkeletonGrid count={6} />
        </div>
      </div>
    );
  }

  // Error
  if (businessError || !business) {
    return (
      <div className="min-h-screen theme-premium-dark bg-background flex items-center justify-center">
        <motion.div className="text-center max-w-md px-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-20 h-20 rounded-2xl glass mx-auto mb-4 flex items-center justify-center">
            <Store className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Negócio Indisponível</h1>
          <p className="text-muted-foreground">Este negócio está temporariamente indisponível ou não existe.</p>
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

  const uncategorizedProducts = products?.filter(p => !p.category_id) || [];
  const hasProducts = products && products.length > 0;

  const handleWhatsAppClick = () => {
    const phone = business.whatsapp_number.replace(/\D/g, '');
    const formattedPhone = phone.startsWith('258') ? phone : (phone.length === 9 ? '258' + phone : phone);
    const text = encodeURIComponent(`Olá! Vi o catálogo de ${business.name} e gostaria de saber mais.`);
    window.open(`https://wa.me/${formattedPhone}?text=${text}`, '_blank');
  };

  const scrollToMenu = () => {
    menuRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleOrderClick = () => {
    navigate(`/loja/${slug}/encomendar`);
  };

  return (
    <div className="min-h-screen theme-premium-dark bg-background flex flex-col">
      <AdminAccessButton />
      
      {/* Hero with CTAs */}
      <HeroParallax 
        business={business}
        onViewMenu={scrollToMenu}
        onOrder={handleOrderClick}
        onWhatsApp={business.whatsapp_number ? handleWhatsAppClick : undefined}
      />

      {/* Sticky Header */}
      <CatalogStickyHeader business={business} />

      {/* Category Cards */}
      {categories && categories.length > 0 && hasProducts && (
        <CatalogCategoryCards
          categories={categories}
          onSelectCategory={setSelectedCategory}
          selectedCategory={selectedCategory}
          primaryColor={primaryColor}
        />
      )}

      {/* Popular Products */}
      {!selectedCategory && popularProducts && popularProducts.length > 0 && (
        <PopularProducts
          products={popularProducts as ProductWithOptions[]}
          onProductClick={setSelectedProduct}
          primaryColor={primaryColor}
        />
      )}

      {/* Divider */}
      {hasProducts && (
        <div className="container max-w-5xl mx-auto px-4">
          <div className="h-px" style={{ background: `linear-gradient(to right, transparent, ${primaryColor}30, transparent)` }} />
        </div>
      )}

      {/* Menu / Products */}
      <div ref={menuRef}>
        {!hasProducts ? (
          <CatalogEmptyState business={business} />
        ) : (
          <main className="container max-w-5xl mx-auto px-4 py-10 flex-1">
            {/* Section title */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-6"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                {selectedCategory 
                  ? categories?.find(c => c.id === selectedCategory)?.name || 'Produtos' 
                  : '🍰 Nosso Menu'}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                {selectedCategory ? 'Produtos nesta categoria' : 'Todas as nossas delícias disponíveis para encomenda'}
              </p>
            </motion.div>

            {selectedCategory ? (
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
              <div className="space-y-10">
                {Object.entries(groupedByCategory).map(([catId, { name, products: catProducts }], catIndex) => (
                  <motion.div 
                    key={catId}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: catIndex * 0.1 }}
                  >
                    <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-3">
                      <span className="w-1 h-6 rounded-full" style={{ backgroundColor: primaryColor }} />
                      <span>{name}</span>
                    </h3>
                    <motion.div 
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                      variants={staggerContainer}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
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
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-3">
                      <span className="w-1 h-6 rounded-full" style={{ backgroundColor: primaryColor }} />
                      <span>Outros</span>
                    </h3>
                    <motion.div 
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                      variants={staggerContainer}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
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
      </div>

      {/* Photo Gallery */}
      {hasProducts && products && (
        <PhotoGallery products={products} primaryColor={primaryColor} />
      )}

      {/* Customer Reviews */}
      {reviews && reviews.length > 0 && (
        <CustomerReviews reviews={reviews} primaryColor={primaryColor} />
      )}

      {/* About Section */}
      <AboutSection business={business} primaryColor={primaryColor} />

      {/* Floating WhatsApp Button */}
      <AnimatePresence>
        <CatalogFloatingButton
          primaryColor={primaryColor}
          onWhatsAppClick={handleWhatsAppClick}
          hasWhatsApp={!!business.whatsapp_number}
        />
      </AnimatePresence>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        businessName={business.name}
        whatsappNumber={business.whatsapp_number}
        primaryColor={primaryColor}
      />

      {/* Footer */}
      <CatalogFooter business={business} primaryColor={primaryColor} />
    </div>
  );
}
