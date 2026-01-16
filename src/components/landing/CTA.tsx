import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function CTA() {
  return (
    <section className="py-20 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMDUiIGN4PSIzMCIgY3k9IjMwIiByPSI0Ii8+PC9nPjwvc3ZnPg==')] opacity-30" />

      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white font-medium text-sm mb-6"
          >
            <Sparkles className="w-4 h-4" />
            Comece agora mesmo
          </motion.div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-6">
            Pronto para organizar seus pedidos?
          </h2>

          <p className="text-lg md:text-xl text-white/80 mb-10">
            Cadastre-se grátis e comece a receber pedidos organizados hoje mesmo. 
            Sem cartão de crédito, sem compromisso.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/registar">
              <Button 
                size="xl" 
                className="bg-white text-primary hover:bg-white/90 font-bold shadow-large"
              >
                Criar Minha Loja Grátis
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>

          <p className="mt-8 text-white/60 text-sm">
            ✓ Sem taxa de adesão &nbsp; ✓ Configuração em 5 minutos &nbsp; ✓ Suporte via WhatsApp
          </p>
        </motion.div>
      </div>
    </section>
  );
}
