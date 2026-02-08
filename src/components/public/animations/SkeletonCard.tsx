import { motion } from 'framer-motion';

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className = '' }: SkeletonCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`rounded-2xl overflow-hidden bg-card border border-border ${className}`}
    >
      {/* Image skeleton */}
      <div className="aspect-square shimmer" />
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="h-5 w-3/4 rounded shimmer" />
        
        {/* Description */}
        <div className="space-y-2">
          <div className="h-3 w-full rounded shimmer" />
          <div className="h-3 w-2/3 rounded shimmer" />
        </div>
        
        {/* Price and button */}
        <div className="flex items-center justify-between pt-2">
          <div className="h-6 w-20 rounded shimmer" />
          <div className="h-8 w-20 rounded-lg shimmer" />
        </div>
      </div>
    </motion.div>
  );
}

export function SkeletonHero() {
  return (
    <div className="relative overflow-hidden">
      <div className="h-48 sm:h-56 shimmer" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-4">
        {/* Logo skeleton */}
        <div className="w-24 h-24 rounded-2xl shimmer" />
        {/* Title skeleton */}
        <div className="h-8 w-48 rounded shimmer" />
        {/* Subtitle skeleton */}
        <div className="h-4 w-32 rounded shimmer" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
