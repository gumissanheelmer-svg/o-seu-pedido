import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Loader2, Store } from 'lucide-react';
import { usePublicBusiness } from '@/hooks/useBusiness';
import { usePublicProducts, ProductWithOptions } from '@/hooks/useProducts';
import { usePublicCategories } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { CartProvider, useCartContext } from '@/contexts/CartContext';
import { ProductDetailModal } from '@/components/public/ProductDetailModal';
import { CheckoutFlow } from '@/components/public/CheckoutFlow';
import { CatalogHero } from '@/components/public/CatalogHero';
import { CatalogEmptyState } from '@/components/public/CatalogEmptyState';
import { CatalogProductCard } from '@/components/public/CatalogProductCard';
import { CatalogFloatingButton } from '@/components/public/CatalogFloatingButton';
import { CatalogStickyHeader } from '@/components/public/CatalogStickyHeader';

function CatalogContent() {
  const { slug } = useParams<{ slug: string }>();
  const { data: business, isLoading: businessLoading, error: businessError } = usePublicBusiness(slug || '');
  const { data: products, isLoading: productsLoading } = usePublicProducts(business?.id || '');
  const { data: categories } = usePublicCategories(business?.id || '');
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithOptions | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  
  const { items, removeItem, updateQuantity, totalItems, totalAmount, clearCart } = useCartContext();

  const primaryColor = business?.primary_color || '#C9A24D';

  // Loading state
  if (businessLoading || productsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: primaryColor }} />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (businessError || !business) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center">
            <Store className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Negócio Indisponível</h1>
          <p className="text-muted-foreground">
            Este negócio está temporariamente indisponível ou não existe.
          </p>
        </div>
      </div>
    );
  }

  // Checkout flow
  if (showCheckout) {
    return (
      <CheckoutFlow 
        business={business} 
        onBack={() => setShowCheckout(false)}
        onComplete={() => {
          clearCart();
          setShowCheckout(false);
        }}
      />
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
    const text = encodeURIComponent(`Olá! Vi o catálogo de ${business.name} e gostaria de saber mais.`);
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <CatalogHero business={business} />

      {/* Sticky Header */}
      <CatalogStickyHeader
        business={business}
        cartOpen={cartOpen}
        setCartOpen={setCartOpen}
        items={items}
        totalItems={totalItems}
        totalAmount={totalAmount}
        removeItem={removeItem}
        updateQuantity={updateQuantity}
        onCheckout={() => {
          setCartOpen(false);
          setShowCheckout(true);
        }}
      />

      {/* Category Filter */}
      {categories && categories.length > 0 && hasProducts && (
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="rounded-xl shrink-0"
              style={selectedCategory === null ? { backgroundColor: primaryColor } : {}}
            >
              Todos
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
                className="whitespace-nowrap rounded-xl shrink-0"
                style={selectedCategory === cat.id ? { backgroundColor: primaryColor } : {}}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      {!hasProducts ? (
        <CatalogEmptyState business={business} />
      ) : (
        <main className="container max-w-4xl mx-auto px-4 pb-28 flex-1">
          {selectedCategory ? (
            // Filtered view
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts?.map((product) => (
                <CatalogProductCard
                  key={product.id}
                  product={product}
                  onClick={() => setSelectedProduct(product)}
                  primaryColor={primaryColor}
                />
              ))}
            </div>
          ) : (
            // Grouped by category view
            <div className="space-y-8">
              {Object.entries(groupedByCategory).map(([catId, { name, products: catProducts }]) => (
                <div key={catId}>
                  <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <span 
                      className="w-1 h-6 rounded-full"
                      style={{ backgroundColor: primaryColor }}
                    />
                    {name}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {catProducts.map((product) => (
                      <CatalogProductCard
                        key={product.id}
                        product={product}
                        onClick={() => setSelectedProduct(product)}
                        primaryColor={primaryColor}
                      />
                    ))}
                  </div>
                </div>
              ))}
              {uncategorizedProducts.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <span 
                      className="w-1 h-6 rounded-full"
                      style={{ backgroundColor: primaryColor }}
                    />
                    Outros
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {uncategorizedProducts.map((product) => (
                      <CatalogProductCard
                        key={product.id}
                        product={product}
                        onClick={() => setSelectedProduct(product)}
                        primaryColor={primaryColor}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      )}

      {/* Floating Button */}
      <AnimatePresence>
        <CatalogFloatingButton
          totalItems={totalItems}
          totalAmount={totalAmount}
          primaryColor={primaryColor}
          onCartClick={() => setShowCheckout(true)}
          onWhatsAppClick={handleWhatsAppClick}
          showWhatsApp={!hasProducts}
          hasWhatsApp={!!business.whatsapp_number}
        />
      </AnimatePresence>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
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

export default function PublicCatalogPage() {
  return (
    <CartProvider>
      <CatalogContent />
    </CartProvider>
  );
}
