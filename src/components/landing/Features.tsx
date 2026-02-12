import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  ShoppingCart, 
  Clock, 
  Palette,
  BarChart3,
  Shield
} from 'lucide-react';

const features = [
  {
    icon: ShoppingCart,
    title: 'Catálogo Digital',
    description: 'Crie seu cardápio online com fotos, preços e descrições. Atualiza em segundos!',
  },
  {
    icon: MessageSquare,
    title: 'Pedidos via WhatsApp',
    description: 'Cliente faz pedido e envia direto no seu WhatsApp. Sem apps extras.',
  },
  {
    icon: Clock,
    title: 'Controle de Entregas',
    description: 'Organize pedidos por data e horário de entrega. Nunca mais esqueça!',
  },
  {
    icon: Palette,
    title: 'Sua Marca, Seu Estilo',
    description: 'Personalize cores, logo e imagem de capa. Deixe com a cara do seu negócio.',
  },
  {
    icon: BarChart3,
    title: 'Relatórios Simples',
    description: 'Veja seus pedidos e ganhos do dia, semana ou mês. Tudo organizado.',
  },
  {
    icon: Shield,
    title: 'Simples e Seguro',
    description: 'Sem dados do cliente expostos. Você controla tudo pelo painel admin.',
  },
];

export function Features() {
  return (
    <section className="py-20 lg:py-28" style={{ backgroundColor: '#0B0D12' }}>
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4" style={{ color: '#FFFFFF' }}>
            Tudo que você precisa para{' '}
            <span style={{ color: '#FF7A1A' }}>vender mais</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: '#B8C0D4' }}>
            Ferramentas simples para transformar seu negócio. Sem complicação, sem taxas escondidas.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group p-6 rounded-[22px] border transition-all duration-300"
              style={{
                backgroundColor: '#121827',
                borderColor: 'rgba(255,255,255,0.08)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,122,26,0.25)';
                e.currentTarget.style.boxShadow = '0 8px 32px -8px rgba(255,122,26,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                style={{ background: 'linear-gradient(135deg, rgba(255,122,26,0.15), rgba(255,122,26,0.05))' }}
              >
                <feature.icon className="w-6 h-6" style={{ color: '#FF7A1A' }} />
              </div>
              <h3 className="text-lg font-display font-bold mb-2" style={{ color: '#FFFFFF' }}>
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: '#B8C0D4' }}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
