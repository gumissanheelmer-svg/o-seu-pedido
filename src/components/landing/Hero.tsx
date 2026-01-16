import { motion } from 'framer-motion';
import { ArrowRight, Smartphone, ShoppingBag, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden gradient-warm">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-warning/10 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-4 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6"
            >
              <ShoppingBag className="w-4 h-4" />
              Sistema de Pedidos Online
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-foreground leading-tight mb-6">
              Receba pedidos{' '}
              <span className="text-primary">organizados</span> pelo{' '}
              <span className="text-primary">WhatsApp</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
              Chega de confusão! Seu cliente escolhe os produtos, confirma o pedido e você recebe tudo organizado no WhatsApp.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Link to="/registar">
                <Button variant="hero" size="xl">
                  Começar Grátis
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/demo">
                <Button variant="outline" size="xl">
                  Ver Demonstração
                </Button>
              </Link>
            </div>

            {/* Benefits */}
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              {[
                'Sem taxa de adesão',
                'Pronto em 5 minutos',
                'Funciona no WhatsApp',
              ].map((benefit, index) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <CheckCircle className="w-4 h-4 text-success" />
                  {benefit}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right content - Phone mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="relative flex justify-center"
          >
            <div className="relative">
              {/* Phone frame */}
              <div className="relative w-72 md:w-80 h-[580px] md:h-[640px] bg-foreground rounded-[3rem] p-3 shadow-large">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-foreground rounded-full z-10" />
                
                {/* Screen content */}
                <div className="w-full h-full bg-background rounded-[2.5rem] overflow-hidden">
                  {/* Header */}
                  <div className="gradient-hero p-6 pt-10">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                        <span className="text-2xl">🍰</span>
                      </div>
                      <div className="text-white">
                        <h3 className="font-bold">Bolos da Maria</h3>
                        <p className="text-sm opacity-80">Encomendas abertas</p>
                      </div>
                    </div>
                  </div>

                  {/* Products */}
                  <div className="p-4 space-y-3">
                    {[
                      { name: 'Bolo de Chocolate', price: '800 MZN', emoji: '🎂' },
                      { name: 'Cupcakes (6un)', price: '350 MZN', emoji: '🧁' },
                      { name: 'Torta de Limão', price: '650 MZN', emoji: '🥧' },
                    ].map((product, i) => (
                      <motion.div
                        key={product.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + i * 0.1 }}
                        className="flex items-center gap-3 p-3 bg-secondary rounded-xl"
                      >
                        <span className="text-2xl">{product.emoji}</span>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-primary font-bold">{product.price}</p>
                        </div>
                        <Button size="sm" variant="default">
                          +
                        </Button>
                      </motion.div>
                    ))}
                  </div>

                  {/* Cart button */}
                  <div className="absolute bottom-6 left-4 right-4">
                    <Button variant="hero" className="w-full" size="lg">
                      <Smartphone className="w-4 h-4" />
                      Enviar Pedido
                    </Button>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-4 -right-4 bg-white p-3 rounded-xl shadow-medium"
              >
                <span className="text-2xl">📱</span>
              </motion.div>

              <motion.div
                animate={{ y: [5, -5, 5] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -bottom-4 -left-4 bg-white p-3 rounded-xl shadow-medium"
              >
                <span className="text-2xl">✅</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
