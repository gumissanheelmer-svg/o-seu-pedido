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
    <section className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
            Tudo que você precisa para{' '}
            <span className="text-primary">vender mais</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ferramentas simples para transformar seu negócio. Sem complicação, sem taxas escondidas.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group p-6 bg-card rounded-2xl border border-border/50 hover:border-primary/30 hover:shadow-medium transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
