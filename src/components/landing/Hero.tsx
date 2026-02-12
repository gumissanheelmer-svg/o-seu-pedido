import { motion } from 'framer-motion';
import { ArrowRight, Smartphone, CheckCircle, Camera, FileText, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden" style={{ backgroundColor: '#0B0D12' }}>
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20" style={{ backgroundColor: '#FF7A1A' }} />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px] opacity-15" style={{ backgroundColor: '#C7A6FF' }} />

      <div className="container relative z-10 mx-auto px-4 py-24 lg:py-36">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <div className="text-center lg:text-left">
            <motion.div
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-8"
              style={{ borderColor: 'rgba(255,122,26,0.3)', backgroundColor: 'rgba(255,122,26,0.08)' }}
            >
              <Star className="w-4 h-4" style={{ color: '#FF7A1A' }} />
              <span className="text-sm font-medium" style={{ color: '#FF7A1A' }}>Sistema de Pedidos Premium</span>
            </motion.div>

            <motion.h1
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-4xl md:text-5xl lg:text-[3.5rem] font-display font-extrabold leading-[1.1] mb-6"
              style={{ color: '#FFFFFF' }}
            >
              Transforme cada pedido em uma{' '}
              <span style={{ color: '#FF7A1A' }}>experiência memorável</span>.
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-lg md:text-xl mb-10 max-w-xl mx-auto lg:mx-0"
              style={{ color: '#B8C0D4' }}
            >
              Receba encomendas organizadas, com fotos, detalhes e confirmação profissional — tudo direto no WhatsApp.
            </motion.p>

            <motion.div
              custom={3}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12"
            >
              <Link to="/registar">
                <Button
                  size="xl"
                  className="relative overflow-hidden font-bold text-white border-0 transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(135deg, #FF7A1A 0%, #FF9A4A 100%)',
                    boxShadow: '0 0 30px -5px rgba(255,122,26,0.5)',
                  }}
                >
                  Encomendar agora
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/demo">
                <Button
                  variant="outline"
                  size="xl"
                  className="transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    borderColor: 'rgba(255,255,255,0.15)',
                    color: '#FFFFFF',
                    backgroundColor: 'transparent',
                  }}
                >
                  Ver Demonstração
                </Button>
              </Link>
            </motion.div>

            {/* Benefits */}
            <motion.div
              custom={4}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap gap-6 justify-center lg:justify-start"
            >
              {[
                'Sem taxa de adesão',
                'Pronto em 5 minutos',
                'Funciona no WhatsApp',
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-2 text-sm" style={{ color: '#B8C0D4' }}>
                  <CheckCircle className="w-4 h-4" style={{ color: '#4ADE80' }} />
                  {benefit}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — Floating dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative flex justify-center"
          >
            <div className="relative w-full max-w-md">
              {/* Main card */}
              <div
                className="rounded-[28px] p-6 border"
                style={{
                  backgroundColor: '#121827',
                  borderColor: 'rgba(255,255,255,0.08)',
                  boxShadow: '0 25px 60px -12px rgba(0,0,0,0.5)',
                }}
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FF7A1A, #FF9A4A)' }}>
                    <span className="text-2xl">🍰</span>
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ color: '#FFFFFF' }}>Bolos da Maria</h3>
                    <p className="text-xs" style={{ color: '#B8C0D4' }}>Encomendas abertas</p>
                  </div>
                </div>

                {/* Product cards */}
                <div className="space-y-3">
                  {[
                    { name: 'Bolo de Chocolate', price: '800 MZN', emoji: '🎂' },
                    { name: 'Cupcakes (6un)', price: '350 MZN', emoji: '🧁' },
                    { name: 'Torta de Limão', price: '650 MZN', emoji: '🥧' },
                  ].map((product, i) => (
                    <motion.div
                      key={product.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + i * 0.12 }}
                      className="flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        borderColor: 'rgba(255,255,255,0.06)',
                      }}
                    >
                      <span className="text-2xl">{product.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm" style={{ color: '#FFFFFF' }}>{product.name}</p>
                        <p className="font-bold text-sm" style={{ color: '#FF7A1A' }}>{product.price}</p>
                      </div>
                      <Button
                        size="sm"
                        className="h-8 w-8 p-0 rounded-lg text-white border-0"
                        style={{ background: 'linear-gradient(135deg, #FF7A1A, #FF9A4A)' }}
                      >
                        +
                      </Button>
                    </motion.div>
                  ))}
                </div>

                {/* CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                  className="mt-5"
                >
                  <Button
                    className="w-full font-bold text-white border-0 rounded-xl"
                    size="lg"
                    style={{ background: 'linear-gradient(135deg, #FF7A1A, #FF9A4A)', boxShadow: '0 0 20px -5px rgba(255,122,26,0.4)' }}
                  >
                    <Smartphone className="w-4 h-4" />
                    Enviar Pedido via WhatsApp
                  </Button>
                </motion.div>
              </div>

              {/* Floating badges */}
              <motion.div
                animate={{ y: [-6, 6, -6] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 -right-4 flex items-center gap-2 px-3 py-2 rounded-xl border"
                style={{
                  backgroundColor: '#121827',
                  borderColor: 'rgba(255,255,255,0.08)',
                  boxShadow: '0 8px 24px -6px rgba(0,0,0,0.4)',
                }}
              >
                <Camera className="w-4 h-4" style={{ color: '#C7A6FF' }} />
                <span className="text-xs font-medium" style={{ color: '#FFFFFF' }}>10 fotos</span>
              </motion.div>

              <motion.div
                animate={{ y: [6, -6, 6] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-3 -left-4 flex items-center gap-2 px-3 py-2 rounded-xl border"
                style={{
                  backgroundColor: '#121827',
                  borderColor: 'rgba(255,255,255,0.08)',
                  boxShadow: '0 8px 24px -6px rgba(0,0,0,0.4)',
                }}
              >
                <FileText className="w-4 h-4" style={{ color: '#4ADE80' }} />
                <span className="text-xs font-medium" style={{ color: '#FFFFFF' }}>Detalhes</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
