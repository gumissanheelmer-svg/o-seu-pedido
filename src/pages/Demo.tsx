import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight, Cake, Coffee, Flower2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';

const Demo = () => {
  const demoBusinesses = [
    {
      name: 'Bolos da Maria',
      slug: 'bolos-da-maria',
      type: 'Bolos e Doces',
      icon: Cake,
      color: 'bg-pink-500/10 text-pink-600',
    },
    {
      name: 'Lanchonete Central',
      slug: 'lanchonete-central',
      type: 'Lanchonete',
      icon: Coffee,
      color: 'bg-amber-500/10 text-amber-600',
    },
    {
      name: 'Flores & Buquês',
      slug: 'flores-buques',
      type: 'Florista',
      icon: Flower2,
      color: 'bg-rose-500/10 text-rose-600',
    },
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
            <div className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">
              Veja o Encomendas em Ação
            </h1>
            <p className="text-xl text-muted-foreground">
              Explore exemplos de lojas criadas com nossa plataforma e veja como seus clientes farão pedidos.
            </p>
          </motion.div>

          {/* Demo Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
            {demoBusinesses.map((business, index) => (
              <motion.div
                key={business.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-shadow"
              >
                <div className={`w-14 h-14 rounded-xl ${business.color} flex items-center justify-center mb-4`}>
                  <business.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-display font-bold text-foreground mb-1">
                  {business.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {business.type}
                </p>
                <Link to={`/p/${business.slug}`}>
                  <Button variant="outline" className="w-full group">
                    Ver Loja
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-muted/30 rounded-3xl p-8 md:p-12 max-w-3xl mx-auto text-center"
          >
            <h2 className="text-2xl font-display font-bold text-foreground mb-4">
              Pronto para criar sua loja?
            </h2>
            <p className="text-muted-foreground mb-6">
              Em menos de 5 minutos você terá sua página profissional de pedidos funcionando.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/registar">
                <Button variant="hero" size="lg">
                  Criar Minha Loja
                </Button>
              </Link>
              <Link to="/precos">
                <Button variant="outline" size="lg">
                  Ver Preços
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Demo;
