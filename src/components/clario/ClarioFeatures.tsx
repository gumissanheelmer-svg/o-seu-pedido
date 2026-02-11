import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { BarChart3, Shield, Smartphone, Bell, PiggyBank, Layers } from 'lucide-react';

const FEATURES = [
  { icon: BarChart3, title: 'Dashboard inteligente', desc: 'Visualize todos os seus gastos e rendimentos num painel limpo e intuitivo.' },
  { icon: Shield, title: 'Limites automáticos', desc: 'Defina limites diários e receba alertas antes de ultrapassar.' },
  { icon: Smartphone, title: 'Mobile-first', desc: 'Feito para funcionar perfeitamente no telemóvel que já usa.' },
  { icon: Bell, title: 'Notificações inteligentes', desc: 'Receba lembretes de contas, metas atingidas e gastos incomuns.' },
  { icon: PiggyBank, title: 'Metas de poupança', desc: 'Crie metas visuais e acompanhe o progresso até alcançar.' },
  { icon: Layers, title: 'Categorias personalizadas', desc: 'Organize despesas em categorias que fazem sentido para si.' },
];

export function ClarioFeatures() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="py-20 sm:py-28 px-4" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-3xl sm:text-4xl font-extrabold text-center mb-4"
        >
          Tudo o que precisa, <span style={{ color: '#C7A6FF' }}>nada que não precisa.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.1 }}
          className="text-center text-base sm:text-lg mb-14 max-w-xl mx-auto"
          style={{ color: '#B8C0D4' }}
        >
          Ferramentas simples e poderosas para gerir o seu dinheiro.
        </motion.p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="rounded-[22px] p-6 cursor-default group"
              style={{ background: '#121827', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-all group-hover:scale-110"
                style={{ background: 'linear-gradient(135deg, rgba(164,255,94,0.15), rgba(199,166,255,0.15))' }}
              >
                <f.icon className="w-5 h-5" style={{ color: '#A4FF5E' }} />
              </div>
              <h3 className="text-base font-bold mb-2">{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#B8C0D4' }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
