import { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Store, ShoppingCart, ArrowLeft, X, Plus, Minus, Trash2 } from 'lucide-react';
import { usePublicBusiness } from '@/hooks/useBusiness';
import { usePublicProducts, ProductWithOptions } from '@/hooks/useProducts';
import { usePublicCategories } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/whatsapp';
import { CartProvider, useCartContext, SelectedOption } from '@/contexts/CartContext';
import { ProductDetailModal } from '@/components/public/ProductDetailModal';
import { CheckoutFlow } from '@/components/public/CheckoutFlow';

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

  if (businessLoading || productsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (businessError || !business) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <Store className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Negócio Indisponível</h1>
          <p className="text-muted-foreground">
            Este negócio está temporariamente indisponível ou não existe.
          </p>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {business.logo_url ? (
                <img
                  src={business.logo_url}
                  alt={business.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Store className="w-5 h-5 text-primary" />
                </div>
              )}
              <div>
                <h1 className="font-bold text-foreground">{business.name}</h1>
                <p className="text-xs text-muted-foreground">Catálogo de Produtos</p>
              </div>
            </div>

            {/* Cart Button */}
            <Sheet open={cartOpen} onOpenChange={setCartOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <ShoppingCart className="w-5 h-5" />
                  {totalItems > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {totalItems}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Carrinho ({totalItems})</SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col h-[calc(100vh-180px)]">
                  {items.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Carrinho vazio</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 overflow-auto space-y-4">
                        {items.map((item, index) => (
                          <div key={index} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                            <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden shrink-0">
                              {item.product.image_url ? (
                                <img
                                  src={item.product.image_url}
                                  alt={item.product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Store className="w-6 h-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{item.product.name}</h4>
                              {item.selectedOptions.length > 0 && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {item.selectedOptions.map(o => o.valueName).join(', ')}
                                </p>
                              )}
                              <p className="text-sm font-semibold text-primary mt-1">
                                {formatCurrency(item.unitPrice)}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => updateQuantity(index, item.quantity - 1)}
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => updateQuantity(index, item.quantity + 1)}
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 ml-auto text-destructive"
                                  onClick={() => removeItem(index)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Separator className="my-4" />
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-lg font-bold">
                          <span>Total</span>
                          <span className="text-primary">{formatCurrency(totalAmount)}</span>
                        </div>
                        <Button 
                          className="w-full" 
                          size="lg"
                          onClick={() => {
                            setCartOpen(false);
                            setShowCheckout(true);
                          }}
                        >
                          Finalizar Encomenda
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Cover Image */}
      {business.cover_image_url && (
        <div className="relative h-40 bg-muted">
          <img
            src={business.cover_image_url}
            alt={business.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </div>
      )}

      {/* Description */}
      {business.description && (
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <p className="text-muted-foreground text-sm">{business.description}</p>
        </div>
      )}

      {/* Category Filter */}
      {categories && categories.length > 0 && (
        <div className="container max-w-4xl mx-auto px-4 pb-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              Todos
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
                className="whitespace-nowrap"
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      <main className="container max-w-4xl mx-auto px-4 pb-24">
        {selectedCategory ? (
          // Filtered view
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredProducts?.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => setSelectedProduct(product)}
              />
            ))}
          </div>
        ) : (
          // Grouped by category view
          <div className="space-y-8">
            {Object.entries(groupedByCategory).map(([catId, { name, products: catProducts }]) => (
              <div key={catId}>
                <h2 className="text-lg font-semibold text-foreground mb-4">{name}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {catProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onClick={() => setSelectedProduct(product)}
                    />
                  ))}
                </div>
              </div>
            ))}
            {uncategorizedProducts.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">Outros</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {uncategorizedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onClick={() => setSelectedProduct(product)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {(!products || products.length === 0) && (
          <div className="text-center py-12">
            <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum produto disponível</p>
          </div>
        )}
      </main>

      {/* Floating Cart Button */}
      {totalItems > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-4 left-4 right-4 max-w-4xl mx-auto"
        >
          <Button
            className="w-full h-14 text-base"
            size="lg"
            onClick={() => setShowCheckout(true)}
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Ver Carrinho ({totalItems}) • {formatCurrency(totalAmount)}
          </Button>
        </motion.div>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Footer */}
      <footer className="container max-w-4xl mx-auto px-4 py-6 text-center">
        <p className="text-xs text-muted-foreground">
          Powered by <span className="text-primary font-semibold">Agenda Smart</span>
        </p>
      </footer>
    </div>
  );
}

function ProductCard({ product, onClick }: { product: ProductWithOptions; onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="overflow-hidden cursor-pointer h-full" onClick={onClick}>
        <div className="aspect-square bg-muted relative">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Store className="w-12 h-12 text-muted-foreground" />
            </div>
          )}
        </div>
        <CardContent className="p-3">
          <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
          {product.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
              {product.description}
            </p>
          )}
          <p className="text-base font-bold text-primary mt-2">
            {formatCurrency(product.price)}
          </p>
          {product.options && product.options.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              + opções disponíveis
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function PublicCatalogPage() {
  return (
    <CartProvider>
      <CatalogContent />
    </CartProvider>
  );
}
