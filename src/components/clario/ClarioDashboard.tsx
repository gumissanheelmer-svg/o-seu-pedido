import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { TrendingUp, TrendingDown, Target, ShieldCheck, Coffee, ShoppingBag, Zap, Music } from 'lucide-react';

const CARDS = [
  { label: 'Saldo actual', value: '24.580 MT', change: '+12%', up: true, icon: TrendingUp },
  { label: 'Gastos do mês', value: '8.320 MT', change: '-5%', up: false, icon: TrendingDown },
  { label: 'Meta mensal', value: '15.000 MT', change: '56%', up: true, icon: Target },
  { label: 'Limite diário', value: '800 MT', change: '320 restante', up: true, icon: ShieldCheck },
];

const TRANSACTIONS = [
  { icon: Coffee, label: 'Café da manhã', amount: '-120 MT', time: 'Hoje, 08:30' },
  { icon: ShoppingBag, label: 'Supermercado', amount: '-2.450 MT', time: 'Hoje, 14:15' },
  { icon: Zap, label: 'Electricidade', amount: '-1.800 MT', time: 'Ontem' },
  { icon: Music, label: 'Spotify', amount: '-350 MT', time: 'Ontem' },
];

const reveal = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

export function ClarioDashboard() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="py-20 sm:py-28 px-4" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-3xl sm:text-4xl font-extrabold text-center mb-4"
        >
          Seu dinheiro, <span style={{ color: '#A4FF5E' }}>visualizado.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.15 }}
          className="text-center text-base sm:text-lg mb-12 max-w-xl mx-auto"
          style={{ color: '#B8C0D4' }}
        >
          Acompanhe gastos, metas e limites num painel elegante.
        </motion.p>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {CARDS.map((c, i) => (
            <motion.div
              key={c.label}
              custom={i}
              variants={reveal}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              className="rounded-2xl p-5 backdrop-blur-sm"
              style={{ background: '#121827', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(164,255,94,0.1)' }}>
                  <c.icon className="w-4 h-4" style={{ color: '#A4FF5E' }} />
                </div>
              </div>
              <p className="text-[11px] font-medium mb-1" style={{ color: '#B8C0D4' }}>{c.label}</p>
              <p className="text-xl font-bold">{c.value}</p>
              <span className="text-[11px] font-semibold" style={{ color: c.up ? '#A4FF5E' : '#C7A6FF' }}>{c.change}</span>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="rounded-2xl p-6"
            style={{ background: '#121827', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <p className="text-sm font-semibold mb-4">Gastos semanais</p>
            <div className="flex items-end gap-3 h-36">
              {[35, 55, 45, 70, 50, 65, 85].map((h, i) => (
                <motion.div
                  key={i}
                  className="flex-1 rounded-t-lg relative group cursor-pointer"
                  style={{ background: `linear-gradient(to top, rgba(164,255,94,0.15), rgba(164,255,94,${h / 100}))` }}
                  initial={{ height: 0 }}
                  animate={inView ? { height: `${h}%` } : { height: 0 }}
                  transition={{ delay: 0.6 + i * 0.07, duration: 0.6, ease: 'easeOut' }}
                  whileHover={{ filter: 'brightness(1.3)' }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[10px]" style={{ color: '#B8C0D4' }}>
              {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(d => <span key={d}>{d}</span>)}
            </div>
          </motion.div>

          {/* Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="rounded-2xl p-6"
            style={{ background: '#121827', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <p className="text-sm font-semibold mb-4">Transações recentes</p>
            <div className="space-y-3">
              {TRANSACTIONS.map((t, i) => (
                <motion.div
                  key={t.label}
                  custom={i}
                  variants={reveal}
                  initial="hidden"
                  animate={inView ? 'visible' : 'hidden'}
                  className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-white/[0.03]"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(199,166,255,0.1)' }}>
                    <t.icon className="w-4 h-4" style={{ color: '#C7A6FF' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t.label}</p>
                    <p className="text-[11px]" style={{ color: '#B8C0D4' }}>{t.time}</p>
                  </div>
                  <p className="text-sm font-bold" style={{ color: '#FFFFFF' }}>{t.amount}</p>
                </motion.div>
              ))}
            </div>

            {/* Daily limit bar */}
            <div className="mt-5">
              <div className="flex justify-between text-[11px] mb-1.5">
                <span style={{ color: '#B8C0D4' }}>Limite diário</span>
                <span style={{ color: '#A4FF5E' }}>480 / 800 MT</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #A4FF5E, #C7A6FF)' }}
                  initial={{ width: 0 }}
                  animate={inView ? { width: '60%' } : { width: 0 }}
                  transition={{ delay: 0.8, duration: 1, ease: 'easeOut' }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
