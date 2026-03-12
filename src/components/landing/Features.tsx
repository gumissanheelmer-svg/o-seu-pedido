import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  ImagePlus, 
  LayoutDashboard, 
  Users,
  BarChart3,
  Link2
} from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'Pedidos direto no WhatsApp',
    description: 'Cliente escolhe, confirma e envia tudo pelo WhatsApp. Sem apps extras.',
  },
  {
    icon: ImagePlus,
    title: 'Upload de fotos e vídeos',
    description: 'Até 10 fotos e vídeos por pedido. Referências visuais que evitam erros.',
  },
  {
    icon: LayoutDashboard,
    title: 'Dashboard inteligente',
    description: 'Resumo do dia, métricas animadas e lista de pedidos — tudo num só lugar.',
  },
  {
    icon: Users,
    title: 'Clientes organizados',
    description: 'Base de clientes automática. Veja histórico e dados de cada cliente.',
  },
  {
    icon: BarChart3,
    title: 'Estatísticas em tempo real',
    description: 'Receita, pedidos e produtos mais vendidos. Gráficos simples e elegantes.',
  },
  {
    icon: Link2,
    title: 'Link personalizado',
    description: 'Seu link exclusivo para partilhar no Instagram, WhatsApp e Facebook.',
  },
];

export function Features() {
  return (
    <section className="py-20 lg:py-28" style={{ background: 'linear-gradient(180deg, #0b0f1a 0%, #121826 100%)' }}>
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4" style={{ color: '#FFFFFF' }}>
            Tudo que você precisa para{' '}
            <span style={{
              background: 'linear-gradient(135deg, #ff4d8d, #c44cff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>vender mais</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: '#94a3b8' }}>
            Ferramentas poderosas num sistema simples. Sem complicação, sem taxas escondidas.
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
              whileHover={{ y: -4, scale: 1.03, transition: { duration: 0.2 } }}
              className="group p-6 rounded-[22px] border backdrop-blur-xl transition-all duration-300 cursor-pointer"
              style={{
                backgroundColor: 'rgba(255,255,255,0.03)',
                borderColor: 'rgba(255,255,255,0.08)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(196,76,255,0.3)';
                e.currentTarget.style.boxShadow = '0 8px 32px -8px rgba(196,76,255,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                style={{ background: 'linear-gradient(135deg, rgba(255,77,141,0.15), rgba(196,76,255,0.1))' }}
              >
                <feature.icon className="w-6 h-6" style={{ color: '#ff4d8d' }} />
              </div>
              <h3 className="text-lg font-display font-bold mb-2" style={{ color: '#FFFFFF' }}>
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
