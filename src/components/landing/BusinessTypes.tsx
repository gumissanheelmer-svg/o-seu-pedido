import { motion } from 'framer-motion';

const businessTypes = [
  {
    emoji: '🍔',
    name: 'Lanchonetes',
    description: 'Hambúrgueres, sandes e petiscos',
  },
  {
    emoji: '🎂',
    name: 'Bolos & Doces',
    description: 'Confeitaria e sobremesas',
  },
  {
    emoji: '💐',
    name: 'Flores & Buquês',
    description: 'Arranjos e presentes florais',
  },
  {
    emoji: '🍲',
    name: 'Restaurantes',
    description: 'Marmitas e pratos por encomenda',
  },
];

export function BusinessTypes() {
  return (
    <section className="py-20 lg:py-32 gradient-warm">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
            Feito para <span className="text-primary">seu tipo de negócio</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Seja comida, doces ou flores — o Encomendas se adapta ao que você vende.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {businessTypes.map((type, index) => (
            <motion.div
              key={type.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="p-8 bg-card rounded-2xl shadow-soft hover:shadow-large transition-all duration-300 text-center"
            >
              <span className="text-6xl mb-4 block">{type.emoji}</span>
              <h3 className="text-xl font-display font-bold text-foreground mb-2">
                {type.name}
              </h3>
              <p className="text-muted-foreground text-sm">
                {type.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
