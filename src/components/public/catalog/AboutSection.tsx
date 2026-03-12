import { motion } from 'framer-motion';
import { Heart, Clock, Award, MapPin } from 'lucide-react';
import { Business } from '@/types/database';

interface AboutSectionProps {
  business: Business;
  primaryColor: string;
}

const highlights = [
  { icon: Heart, label: 'Feito com Amor', desc: 'Cada produto é preparado com carinho e dedicação' },
  { icon: Clock, label: 'Sempre Fresco', desc: 'Preparamos tudo na hora para garantir frescura' },
  { icon: Award, label: 'Qualidade Premium', desc: 'Ingredientes selecionados de alta qualidade' },
];

export function AboutSection({ business, primaryColor }: AboutSectionProps) {
  return (
    <section className="py-12">
      <div className="container max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Sobre a {business.name}
          </h2>
          {business.description && (
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {business.description}
            </p>
          )}
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {highlights.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              whileHover={{ y: -4 }}
              className="glass-card p-6 rounded-2xl text-center group"
            >
              <div 
                className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${primaryColor}15` }}
              >
                <item.icon className="w-7 h-7" style={{ color: primaryColor }} />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{item.label}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {business.address && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-6 flex items-center justify-center gap-2 text-muted-foreground text-sm"
          >
            <MapPin className="w-4 h-4" style={{ color: primaryColor }} />
            <span>{business.address}</span>
          </motion.div>
        )}
      </div>
    </section>
  );
}
