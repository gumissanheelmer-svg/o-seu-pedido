import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';

const Pricing = () => {
  const features = [
    'Página pública personalizada',
    'Catálogo de produtos ilimitado',
    'Pedidos via WhatsApp',
    'Painel de gestão',
    'Notificações de pedidos',
    'Suporte por WhatsApp',
    'Relatórios básicos',
    'Cores personalizáveis',
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">
              Preços Simples
            </h1>
            <p className="text-xl text-muted-foreground">
              Um plano único, sem surpresas. Tudo o que você precisa para gerenciar seus pedidos.
            </p>
          </motion.div>

          {/* Pricing Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-md mx-auto"
          >
            <div className="bg-card rounded-3xl border border-border p-8 shadow-lg relative overflow-hidden">
              {/* Badge */}
              <div className="absolute top-4 right-4">
                <span className="bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full">
                  Popular
                </span>
              </div>

              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                  Plano Profissional
                </h2>
                <p className="text-muted-foreground">
                  Tudo incluído, sem limites
                </p>
              </div>

              {/* Price */}
              <div className="text-center mb-8">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-lg text-muted-foreground">MZN</span>
                  <span className="text-5xl font-display font-bold text-foreground">500</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  30 dias grátis para experimentar
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-success" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link to="/registar" className="block">
                <Button variant="hero" size="xl" className="w-full">
                  Começar Grátis
                </Button>
              </Link>

              <p className="text-center text-sm text-muted-foreground mt-4">
                Sem cartão de crédito necessário
              </p>
            </div>
          </motion.div>

          {/* FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl mx-auto mt-16"
          >
            <h3 className="text-2xl font-display font-bold text-foreground text-center mb-8">
              Perguntas Frequentes
            </h3>
            
            <div className="space-y-6">
              <div className="bg-muted/30 rounded-2xl p-6">
                <h4 className="font-semibold text-foreground mb-2">
                  Como funciona o período grátis?
                </h4>
                <p className="text-muted-foreground">
                  Ao criar sua conta, você tem 30 dias para testar todas as funcionalidades sem pagar nada. 
                  Após esse período, a mensalidade de 500 MZN será cobrada.
                </p>
              </div>

              <div className="bg-muted/30 rounded-2xl p-6">
                <h4 className="font-semibold text-foreground mb-2">
                  Posso cancelar a qualquer momento?
                </h4>
                <p className="text-muted-foreground">
                  Sim! Não há fidelidade. Você pode cancelar quando quiser e sua loja permanece ativa até o fim do período pago.
                </p>
              </div>

              <div className="bg-muted/30 rounded-2xl p-6">
                <h4 className="font-semibold text-foreground mb-2">
                  Como faço o pagamento?
                </h4>
                <p className="text-muted-foreground">
                  Aceitamos M-Pesa, e-Mola e transferência bancária. Você receberá instruções por WhatsApp.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
