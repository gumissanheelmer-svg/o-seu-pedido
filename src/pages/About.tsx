import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Target, Zap, ArrowRight, Star } from 'lucide-react';
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

const values = [
  {
    icon: Heart,
    title: 'Feito com propósito',
    description: 'Criado para negócios reais que querem crescer com organização e imagem profissional.',
    iconColor: '#FF7A1A',
  },
  {
    icon: Target,
    title: 'Foco total no cliente',
    description: 'Seus clientes fazem pedidos sem complicação e você recebe tudo estruturado no WhatsApp.',
    iconColor: '#FF7A1A',
  },
  {
    icon: Zap,
    title: 'Simples, rápido e moderno',
    description: 'Configure em minutos e tenha uma loja digital pronta para receber pedidos.',
    iconColor: '#FF7A1A',
  },
];

const testimonials = [
  { text: 'Agora recebo pedidos organizados e sem confusão. Meu negócio cresceu muito!', role: 'Dona de Pastelaria' },
  { text: 'Meus clientes adoram a facilidade. Tudo pelo WhatsApp, simples e rápido.', role: 'Empreendedora de Bolos' },
  { text: 'Finalmente tenho controle dos meus pedidos. Recomendo a todos!', role: 'Dono de Restaurante' },
];

const About = () => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0B0D12', color: '#FFFFFF' }}>
      <Navbar dark />

      <main className="pt-28 pb-20">
        {/* Hero */}
        <section className="container mx-auto px-4 text-center max-w-3xl mb-24">
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl md:text-5xl lg:text-[3.25rem] font-bold leading-tight mb-6"
            style={{ color: '#FFFFFF', letterSpacing: '-0.02em' }}
          >
            Transformamos pedidos simples em negócios organizados.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-lg md:text-xl mb-10 max-w-2xl mx-auto"
            style={{ color: '#B8C0D4', lineHeight: '1.7' }}
          >
            O Encomendas nasceu para ajudar pequenos negócios moçambicanos a venderem com profissionalismo, organização e automação via WhatsApp.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
            <Link to="/registar">
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(255,122,26,0.4)' }}
                whileTap={{ scale: 0.98 }}
                className="rounded-full px-8 py-3 font-semibold text-white transition-all duration-300"
                style={{ background: 'linear-gradient(135deg, #FF7A1A, #E06510)', boxShadow: '0 0 20px rgba(255,122,26,0.25)' }}
              >
                Criar minha loja agora
                <ArrowRight className="w-4 h-4 ml-2 inline" />
              </motion.button>
            </Link>
          </motion.div>
        </section>

        {/* Values */}
        <section className="py-20" style={{ backgroundColor: '#0F1118' }}>
          <div className="container mx-auto px-4 max-w-6xl">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              custom={0}
              variants={fadeUp}
              className="text-3xl md:text-4xl font-bold text-center mb-16"
              style={{ color: '#FFFFFF' }}
            >
              Por que o Encomendas?
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-6">
              {values.map((v, i) => (
                <motion.div
                  key={v.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-30px' }}
                  custom={i + 1}
                  variants={fadeUp}
                  whileHover={{ y: -6, boxShadow: '0 8px 40px rgba(255,122,26,0.12)' }}
                  className="p-8 transition-all duration-300 cursor-default"
                  style={{
                    backgroundColor: '#121827',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '22px',
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                    style={{ backgroundColor: 'rgba(255,122,26,0.12)' }}
                  >
                    <v.icon className="w-7 h-7" style={{ color: v.iconColor }} />
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: '#FFFFFF' }}>{v.title}</h3>
                  <p style={{ color: '#B8C0D4', lineHeight: '1.65' }}>{v.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20" style={{ backgroundColor: '#0B0D12' }}>
          <div className="container mx-auto px-4 max-w-6xl">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              custom={0}
              variants={fadeUp}
              className="text-3xl md:text-4xl font-bold text-center mb-4"
              style={{ color: '#FFFFFF' }}
            >
              Pequenos negócios já estão usando
            </motion.h2>
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0.5}
              variants={fadeUp}
              className="text-center mb-14"
              style={{ color: '#B8C0D4' }}
            >
              Veja o que dizem os nossos primeiros utilizadores
            </motion.p>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <motion.div
                  key={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-30px' }}
                  custom={i + 1}
                  variants={fadeUp}
                  className="p-8"
                  style={{
                    backgroundColor: '#121827',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '22px',
                  }}
                >
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-base mb-5 italic" style={{ color: '#B8C0D4', lineHeight: '1.65' }}>
                    "{t.text}"
                  </p>
                  <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>— {t.role}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16" style={{ backgroundColor: '#0F1118' }}>
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0}
              variants={fadeUp}
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-6" style={{ color: '#FFFFFF' }}>
                Pronto para organizar seus pedidos?
              </h2>
              <Link to="/registar">
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(255,122,26,0.4)' }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-full px-8 py-3 font-semibold text-white transition-all duration-300"
                  style={{ background: 'linear-gradient(135deg, #FF7A1A, #E06510)', boxShadow: '0 0 20px rgba(255,122,26,0.25)' }}
                >
                  Começar agora
                  <ArrowRight className="w-4 h-4 ml-2 inline" />
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer dark />
    </div>
  );
};

export default About;
