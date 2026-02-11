import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Star } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Márcia L.',
    role: 'Empreendedora',
    text: 'Finalmente consigo ver para onde vai o meu dinheiro. O Clario mudou a minha relação com as finanças.',
    initials: 'ML',
  },
  {
    name: 'Ana Sofia R.',
    role: 'Designer freelancer',
    text: 'O dashboard é lindo e fácil de usar. Nunca pensei que controlar gastos pudesse ser tão agradável.',
    initials: 'AR',
  },
  {
    name: 'Joana M.',
    role: 'Gestora de projetos',
    text: 'Os limites diários salvaram-me. Agora poupo mais sem sentir que estou a privar-me de algo.',
    initials: 'JM',
  },
];

export function ClarioTestimonials() {
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
          O que dizem sobre o <span style={{ color: '#C7A6FF' }}>Clario</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.1 }}
          className="text-center text-base mb-14 max-w-md mx-auto"
          style={{ color: '#B8C0D4' }}
        >
          Pessoas reais, resultados reais.
        </motion.p>

        <div className="grid sm:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="rounded-[22px] p-6"
              style={{ background: '#121827', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="w-4 h-4 fill-current" style={{ color: '#A4FF5E' }} />
                ))}
              </div>
              <p className="text-sm leading-relaxed mb-5" style={{ color: '#B8C0D4' }}>"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg, #A4FF5E, #C7A6FF)', color: '#0B0D12' }}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-[11px]" style={{ color: '#B8C0D4' }}>{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
