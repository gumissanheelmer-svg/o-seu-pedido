import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Check, Star } from 'lucide-react';

const PLANS = [
  {
    name: 'Starter',
    price: 'Grátis',
    desc: 'Para começar a organizar suas finanças.',
    features: ['Dashboard básico', 'Até 50 transações/mês', 'Categorias padrão', 'Exportar CSV'],
    cta: 'Criar conta grátis',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '1.500 MT',
    period: '/mês',
    desc: 'Para quem quer controle total e insights.',
    features: ['Dashboard completo', 'Transações ilimitadas', 'Categorias personalizadas', 'Metas e limites', 'Notificações inteligentes', 'Relatórios mensais', 'Suporte prioritário'],
    cta: 'Começar Pro',
    highlighted: true,
  },
];

export function ClarioPricing() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="py-20 sm:py-28 px-4" ref={ref}>
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-3xl sm:text-4xl font-extrabold text-center mb-4"
        >
          Planos simples, <span style={{ color: '#A4FF5E' }}>sem surpresas.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.1 }}
          className="text-center text-base sm:text-lg mb-14 max-w-lg mx-auto"
          style={{ color: '#B8C0D4' }}
        >
          Escolha o que faz sentido para si. Sem taxas escondidas.
        </motion.p>

        <div className="grid sm:grid-cols-2 gap-6 items-stretch">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="rounded-[24px] p-7 sm:p-8 flex flex-col relative"
              style={{
                background: '#121827',
                border: plan.highlighted ? '1.5px solid rgba(164,255,94,0.4)' : '1px solid rgba(255,255,255,0.08)',
                boxShadow: plan.highlighted ? '0 0 50px -15px rgba(164,255,94,0.2)' : 'none',
              }}
            >
              {plan.highlighted && (
                <motion.div
                  animate={{ y: [-3, 3, -3] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -top-3 right-6 flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold"
                  style={{ background: '#A4FF5E', color: '#0B0D12' }}
                >
                  <Star className="w-3 h-3" /> Recomendado
                </motion.div>
              )}

              <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
              <p className="text-sm mb-5" style={{ color: '#B8C0D4' }}>{plan.desc}</p>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                {plan.period && <span className="text-sm" style={{ color: '#B8C0D4' }}>{plan.period}</span>}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm">
                    <Check className="w-4 h-4 shrink-0" style={{ color: '#A4FF5E' }} />
                    <span style={{ color: '#B8C0D4' }}>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                className="w-full py-3.5 rounded-full text-sm font-bold transition-all hover:brightness-110"
                style={
                  plan.highlighted
                    ? { background: '#A4FF5E', color: '#0B0D12', boxShadow: '0 0 25px -5px rgba(164,255,94,0.4)' }
                    : { background: 'rgba(255,255,255,0.06)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.1)' }
                }
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
