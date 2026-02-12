import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Star, ArrowRight, X } from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

const plans = [
  {
    name: 'Starter',
    price: '1.500',
    subtitle: 'Pagamento único',
    highlighted: false,
    features: [
      { text: 'Loja personalizada', included: true },
      { text: 'Recebimento no WhatsApp', included: true },
      { text: 'Upload de fotos', included: true },
      { text: 'Até 20 produtos', included: true },
      { text: 'Upload de vídeos', included: false },
      { text: 'Link exclusivo Instagram', included: false },
      { text: 'Suporte prioritário', included: false },
    ],
  },
  {
    name: 'Profissional',
    price: '3.500',
    subtitle: 'Pagamento único',
    highlighted: true,
    badge: 'Recomendado',
    features: [
      { text: 'Loja personalizada', included: true },
      { text: 'Recebimento no WhatsApp', included: true },
      { text: 'Upload de fotos e vídeos', included: true },
      { text: 'Produtos ilimitados', included: true },
      { text: 'Sistema organizado de pedidos', included: true },
      { text: 'Link exclusivo para Instagram', included: true },
      { text: 'Suporte inicial', included: true },
    ],
  },
];

const testimonials = [
  { text: 'Agora recebo pedidos organizados e sem confusão.', role: 'Dona de Pastelaria' },
  { text: 'Meus clientes adoram a facilidade pelo WhatsApp.', role: 'Empreendedora de Bolos' },
  { text: 'Finalmente tenho controle dos meus pedidos!', role: 'Dono de Restaurante' },
];

const faqs = [
  { q: 'O que está incluído no pagamento?', a: 'Tudo: loja personalizada, gestão de pedidos, link para Instagram e suporte. Sem taxas escondidas.' },
  { q: 'Como faço o pagamento?', a: 'Aceitamos M-Pesa, e-Mola e transferência bancária. Você receberá instruções por WhatsApp.' },
  { q: 'Preciso de conhecimento técnico?', a: 'Não! O sistema foi feito para ser simples. Configure em minutos e comece a receber pedidos.' },
];

const Pricing = () => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0B0D12', color: '#FFFFFF' }}>
      <Navbar />

      <main className="pt-28 pb-20">
        {/* Hero */}
        <section className="container mx-auto px-4 text-center max-w-3xl mb-20">
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl md:text-5xl font-bold leading-tight mb-6"
            style={{ color: '#FFFFFF', letterSpacing: '-0.02em' }}
          >
            Um investimento, resultados reais.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-lg md:text-xl max-w-2xl mx-auto"
            style={{ color: '#B8C0D4', lineHeight: '1.7' }}
          >
            Tudo o que você precisa para profissionalizar seus pedidos num único plano acessível.
          </motion.p>
        </section>

        {/* Pricing Cards */}
        <section className="container mx-auto px-4 mb-24 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {plans.map((plan, idx) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 + idx * 0.15 }}
                whileHover={{ y: -6 }}
                className="relative p-8 md:p-10 overflow-hidden"
                style={{
                  backgroundColor: '#121827',
                  borderRadius: '22px',
                  border: plan.highlighted ? '1px solid rgba(255,122,26,0.4)' : '1px solid rgba(255,255,255,0.08)',
                  boxShadow: plan.highlighted ? '0 0 40px rgba(255,122,26,0.1)' : 'none',
                }}
              >
                {plan.badge && (
                  <div className="absolute top-5 right-5">
                    <span
                      className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full"
                      style={{ backgroundColor: 'rgba(255,122,26,0.15)', color: '#FF7A1A' }}
                    >
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-1" style={{ color: '#FFFFFF' }}>{plan.name}</h2>
                  <p style={{ color: '#B8C0D4' }}>{plan.subtitle}</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg" style={{ color: '#B8C0D4' }}>MZN</span>
                    <span className="text-5xl font-extrabold" style={{ color: '#FFFFFF' }}>{plan.price}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-10">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-3">
                      {f.included ? (
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(16,185,129,0.15)' }}>
                          <Check className="w-3 h-3" style={{ color: '#10B981' }} />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                          <X className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.25)' }} />
                        </div>
                      )}
                      <span style={{ color: f.included ? '#FFFFFF' : 'rgba(255,255,255,0.35)' }}>{f.text}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/registar" className="block">
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: plan.highlighted ? '0 0 30px rgba(255,122,26,0.4)' : '0 0 20px rgba(255,255,255,0.1)' }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full rounded-xl py-3 font-bold transition-all duration-300"
                    style={{
                      background: plan.highlighted ? 'linear-gradient(135deg, #FF7A1A, #E06510)' : 'rgba(255,255,255,0.08)',
                      color: '#FFFFFF',
                      boxShadow: plan.highlighted ? '0 0 20px rgba(255,122,26,0.25)' : 'none',
                    }}
                  >
                    Começar agora
                    <ArrowRight className="w-4 h-4 ml-2 inline" />
                  </motion.button>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-20" style={{ backgroundColor: '#0F1118' }}>
          <div className="container mx-auto px-4 max-w-6xl">
            <motion.h2
              initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}
              className="text-3xl font-bold text-center mb-14"
              style={{ color: '#FFFFFF' }}
            >
              Pequenos negócios já estão usando
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <motion.div
                  key={i} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-30px' }} custom={i + 1} variants={fadeUp}
                  className="p-8"
                  style={{ backgroundColor: '#121827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '22px' }}
                >
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="italic mb-4" style={{ color: '#B8C0D4', lineHeight: '1.65' }}>"{t.text}"</p>
                  <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>— {t.role}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20" style={{ backgroundColor: '#0B0D12' }}>
          <div className="container mx-auto px-4 max-w-2xl">
            <motion.h2
              initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}
              className="text-3xl font-bold text-center mb-12"
              style={{ color: '#FFFFFF' }}
            >
              Perguntas Frequentes
            </motion.h2>
            <div className="space-y-5">
              {faqs.map((f, i) => (
                <motion.div
                  key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i + 1} variants={fadeUp}
                  className="p-6"
                  style={{ backgroundColor: '#121827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}
                >
                  <h4 className="font-semibold mb-2" style={{ color: '#FFFFFF' }}>{f.q}</h4>
                  <p style={{ color: '#B8C0D4', lineHeight: '1.6' }}>{f.a}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
