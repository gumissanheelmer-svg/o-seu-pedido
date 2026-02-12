import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function CTA() {
  return (
    <section className="py-20 lg:py-28 relative overflow-hidden" style={{ backgroundColor: '#0F172A' }}>
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[120px] opacity-20" style={{ backgroundColor: '#F97316' }} />
      <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full blur-[100px] opacity-10" style={{ backgroundColor: '#3B82F6' }} />

      <div className="container relative z-10 mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-8"
            style={{ borderColor: 'rgba(249,115,22,0.3)', backgroundColor: 'rgba(249,115,22,0.08)' }}
          >
            <Sparkles className="w-4 h-4" style={{ color: '#F97316' }} />
            <span className="text-sm font-medium" style={{ color: '#F97316' }}>Comece agora mesmo</span>
          </motion.div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6" style={{ color: '#FFFFFF' }}>
            Pronto para organizar seus pedidos?
          </h2>

          <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto" style={{ color: '#CBD5E1' }}>
            Cadastre-se grátis e comece a receber pedidos organizados hoje mesmo. Sem cartão de crédito, sem compromisso.
          </p>

          <Link to="/registar">
            <Button
              size="xl"
              className="font-bold text-white border-0 transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)',
                boxShadow: '0 0 40px -5px rgba(249,115,22,0.5)',
              }}
            >
              Criar Minha Loja Grátis
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>

          <p className="mt-8 text-sm" style={{ color: 'rgba(203,213,225,0.6)' }}>
            ✓ Sem taxa de adesão &nbsp; ✓ Configuração em 5 minutos &nbsp; ✓ Suporte via WhatsApp
          </p>
        </motion.div>
      </div>
    </section>
  );
}
