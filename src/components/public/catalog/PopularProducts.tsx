import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { ProductWithOptions } from '@/hooks/useProducts';
import { CatalogProductCard } from '@/components/public/CatalogProductCard';
import { staggerContainer } from '@/components/public/animations/MotionComponents';

interface PopularProductsProps {
  products: ProductWithOptions[];
  onProductClick: (product: ProductWithOptions) => void;
  primaryColor: string;
}

export function PopularProducts({ products, onProductClick, primaryColor }: PopularProductsProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-10">
      <div className="container max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-6"
        >
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${primaryColor}20` }}
          >
            <Flame className="w-5 h-5" style={{ color: primaryColor }} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">🔥 Mais Pedidos</h2>
            <p className="text-muted-foreground text-xs">Os favoritos dos nossos clientes</p>
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {products.map((product) => (
            <CatalogProductCard
              key={product.id}
              product={product}
              onClick={() => onProductClick(product)}
              primaryColor={primaryColor}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
