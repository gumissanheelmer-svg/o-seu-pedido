import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, Users, Zap, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';

const About = () => {
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
              Sobre o Encomendas
            </h1>
            <p className="text-xl text-muted-foreground">
              Nascemos para ajudar pequenos negócios moçambicanos a receberem pedidos de forma profissional e organizada.
            </p>
          </motion.div>

          {/* Values */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center p-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-2">
                Feito com Amor
              </h3>
              <p className="text-muted-foreground">
                Entendemos os desafios dos pequenos negócios porque trabalhamos lado a lado com eles.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center p-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-secondary/30 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-secondary-foreground" />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-2">
                Focado no Cliente
              </h3>
              <p className="text-muted-foreground">
                Sem complicações, sem apps extras. Seus clientes fazem pedidos em segundos.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center p-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-accent/30 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-2">
                Simples e Rápido
              </h3>
              <p className="text-muted-foreground">
                Configure sua loja em minutos e comece a receber pedidos pelo WhatsApp.
              </p>
            </motion.div>
          </div>

          {/* Mission */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-muted/30 rounded-3xl p-8 md:p-12 max-w-4xl mx-auto text-center"
          >
            <div className="w-20 h-20 rounded-2xl gradient-hero flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
              Nossa Missão
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Empoderar pequenos empreendedores com ferramentas profissionais para crescer seus negócios, 
              sem precisar de conhecimento técnico ou grandes investimentos.
            </p>
            <Link to="/registar">
              <Button variant="hero" size="lg">
                Começar Agora
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
