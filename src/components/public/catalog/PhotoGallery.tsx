import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera } from 'lucide-react';
import { ProductWithOptions } from '@/hooks/useProducts';

interface PhotoGalleryProps {
  products: ProductWithOptions[];
  primaryColor: string;
}

function getAllPhotos(products: ProductWithOptions[]): string[] {
  const photos: string[] = [];
  products.forEach(p => {
    const main = p.main_image_url || p.image_url;
    if (main && !photos.includes(main)) photos.push(main);
    const urls = Array.isArray(p.image_urls) ? p.image_urls : [];
    urls.forEach(url => {
      if (!photos.includes(url)) photos.push(url);
    });
  });
  return photos.slice(0, 12);
}

export function PhotoGallery({ products, primaryColor }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const photos = getAllPhotos(products);

  if (photos.length < 3) return null;

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
            <Camera className="w-5 h-5" style={{ color: primaryColor }} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">📸 Galeria</h2>
            <p className="text-muted-foreground text-xs">As nossas criações em destaque</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((url, index) => (
            <motion.button
              key={url}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedPhoto(url)}
              className="aspect-square rounded-2xl overflow-hidden relative group"
            >
              <img 
                src={url} 
                alt="" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.button
              className="absolute top-4 right-4 w-10 h-10 rounded-full glass flex items-center justify-center text-white z-10"
              onClick={() => setSelectedPhoto(null)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5" />
            </motion.button>
            <motion.img
              src={selectedPhoto}
              alt=""
              className="max-w-full max-h-[85vh] rounded-2xl object-contain"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
