import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

const features = [
  'Loja personalizada',
  'Recebimento direto no WhatsApp',
  'Upload de fotos e vídeos',
  'Sistema organizado de pedidos',
  'Link exclusivo para Instagram',
  'Suporte inicial',
];

const testimonials = [
  { text: 'Agora recebo pedidos organizados e sem confusão.', role: 'Dona de Pastelaria' },
  { text: 'Meus clientes adoram a facilidade pelo WhatsApp.', role: 'Empreendedora de Bolos' },
  { text: 'Finalmente tenho controle dos meus pedidos!', role: 'Dono de Restaurante' },
];

const faqs = [
  {
    q: 'O que está incluído no pagamento?',
    a: 'Tudo: loja personalizada, gestão de pedidos, link para Instagram e suporte. Sem taxas escondidas.',
  },
  {
    q: 'Como faço o pagamento?',
    a: 'Aceitamos M-Pesa, e-Mola e transferência bancária. Você receberá instruções por WhatsApp.',
  },
  {
    q: 'Preciso de conhecimento técnico?',
    a: 'Não! O sistema foi feito para ser simples. Configure em minutos e comece a receber pedidos.',
  },
];

const Pricing = () => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      <Navbar />

      <main className="pt-28 pb-20">
        {/* Hero */}
        <section className="container mx-auto px-4 text-center max-w-3xl mb-20">
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl md:text-5xl font-bold leading-tight mb-6"
            style={{ color: '#1A1A2E', letterSpacing: '-0.02em' }}
          >
            Um investimento, resultados reais.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-lg md:text-xl max-w-2xl mx-auto"
            style={{ color: '#555', lineHeight: '1.7' }}
          >
            Tudo o que você precisa para profissionalizar seus pedidos num único plano acessível.
          </motion.p>
        </section>

        {/* Pricing Card */}
        <section className="container mx-auto px-4 mb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="max-w-md mx-auto bg-white rounded-3xl p-10 relative overflow-hidden"
            style={{
              boxShadow: '0 8px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(201,162,77,0.2)',
            }}
          >
            {/* Badge */}
            <div className="absolute top-5 right-5">
              <span
                className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full"
                style={{ background: 'linear-gradient(135deg, #C9A24D20, #B8902F20)', color: '#B8902F' }}
              >
                Mais escolhido
              </span>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-1" style={{ color: '#1A1A2E' }}>
                Plano Profissional
              </h2>
              <p style={{ color: '#888' }}>Tudo incluído</p>
            </div>

            {/* Price */}
            <div className="text-center mb-8">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-lg" style={{ color: '#888' }}>MZN</span>
                <span className="text-6xl font-extrabold" style={{ color: '#1A1A2E' }}>3.500</span>
              </div>
              <p className="text-sm mt-2 font-medium" style={{ color: '#B8902F' }}>
                Pagamento único
              </p>
            </div>

            {/* Features */}
            <ul className="space-y-4 mb-10">
              {features.map((f, i) => (
                <motion.li
                  key={i}
                  initial="hidden"
                  animate="visible"
                  custom={i * 0.5 + 2}
                  variants={fadeUp}
                  className="flex items-center gap-3"
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#ECFDF5' }}
                  >
                    <Check className="w-3 h-3" style={{ color: '#10B981' }} />
                  </div>
                  <span style={{ color: '#333' }}>{f}</span>
                </motion.li>
              ))}
            </ul>

            {/* CTA */}
            <Link to="/registar" className="block">
              <Button
                size="xl"
                className="w-full rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg, #C9A24D, #B8902F)' }}
              >
                Começar agora
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </motion.div>
        </section>

        {/* Social Proof */}
        <section className="py-20" style={{ backgroundColor: '#F5F5F5' }}>
          <div className="container mx-auto px-4">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0}
              variants={fadeUp}
              className="text-3xl font-bold text-center mb-14"
              style={{ color: '#1A1A2E' }}
            >
              Pequenos negócios já estão usando
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {testimonials.map((t, i) => (
                <motion.div
                  key={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-30px' }}
                  custom={i + 1}
                  variants={fadeUp}
                  className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
                >
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="italic mb-4" style={{ color: '#444', lineHeight: '1.65' }}>"{t.text}"</p>
                  <span className="text-sm font-medium" style={{ color: '#999' }}>— {t.role}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-2xl">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0}
              variants={fadeUp}
              className="text-3xl font-bold text-center mb-12"
              style={{ color: '#1A1A2E' }}
            >
              Perguntas Frequentes
            </motion.h2>
            <div className="space-y-5">
              {faqs.map((f, i) => (
                <motion.div
                  key={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i + 1}
                  variants={fadeUp}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                >
                  <h4 className="font-semibold mb-2" style={{ color: '#1A1A2E' }}>{f.q}</h4>
                  <p style={{ color: '#666', lineHeight: '1.6' }}>{f.a}</p>
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
