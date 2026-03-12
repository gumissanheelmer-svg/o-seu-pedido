import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { CustomerReview } from '@/hooks/usePublicCatalog';

interface CustomerReviewsProps {
  reviews: CustomerReview[];
  primaryColor: string;
}

function StarRating({ rating, color }: { rating: number; color: string }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className="w-4 h-4"
          fill={i <= rating ? color : 'transparent'}
          stroke={i <= rating ? color : 'rgba(255,255,255,0.2)'}
        />
      ))}
    </div>
  );
}

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

export function CustomerReviews({ reviews, primaryColor }: CustomerReviewsProps) {
  if (!reviews || reviews.length === 0) return null;

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
            O que dizem os nossos clientes
          </h2>
          <p className="text-muted-foreground text-sm">
            Avaliações reais de clientes satisfeitos
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              whileHover={{ y: -4 }}
              className="glass-card p-5 rounded-2xl relative group"
            >
              {/* Quote icon */}
              <Quote 
                className="absolute top-4 right-4 w-6 h-6 opacity-10 group-hover:opacity-20 transition-opacity"
                style={{ color: primaryColor }}
              />

              {/* Stars */}
              <StarRating rating={review.rating} color={primaryColor} />

              {/* Comment */}
              {review.comment && (
                <p className="text-sm text-foreground/80 mt-3 mb-4 line-clamp-4 leading-relaxed">
                  "{review.comment}"
                </p>
              )}

              {/* Author */}
              <div className="flex items-center gap-3 mt-auto pt-3 border-t border-white/5">
                <div 
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                >
                  {getInitials(review.customer_name)}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{review.customer_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString('pt-MZ', { month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
