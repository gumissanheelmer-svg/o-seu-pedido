import { motion } from 'framer-motion';

const businessTypes = [
  { emoji: '🍔', name: 'Lanchonetes', description: 'Hambúrgueres, sandes e petiscos' },
  { emoji: '🎂', name: 'Bolos & Doces', description: 'Confeitaria e sobremesas' },
  { emoji: '💐', name: 'Flores & Buquês', description: 'Arranjos e presentes florais' },
  { emoji: '🍲', name: 'Restaurantes', description: 'Marmitas e pratos por encomenda' },
];

export function BusinessTypes() {
  return (
    <section className="py-20 lg:py-28" style={{ backgroundColor: '#0F172A' }}>
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4" style={{ color: '#FFFFFF' }}>
            Feito para <span style={{ color: '#F97316' }}>seu tipo de negócio</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: '#CBD5E1' }}>
            Seja comida, doces ou flores — o Encomendas se adapta ao que você vende.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {businessTypes.map((type, index) => (
            <motion.div
              key={type.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -6, scale: 1.03, transition: { duration: 0.2 } }}
              className="p-8 rounded-[22px] border text-center backdrop-blur-xl transition-all duration-300 cursor-pointer"
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderColor: 'rgba(255,255,255,0.08)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(249,115,22,0.25)';
                e.currentTarget.style.boxShadow = '0 12px 40px -10px rgba(249,115,22,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span className="text-5xl mb-4 block">{type.emoji}</span>
              <h3 className="text-lg font-display font-bold mb-2" style={{ color: '#FFFFFF' }}>
                {type.name}
              </h3>
              <p className="text-sm" style={{ color: '#CBD5E1' }}>
                {type.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
