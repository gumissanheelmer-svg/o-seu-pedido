import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

interface Props {
  onAutoScroll: () => void;
}

export function ClarioHero({ onAutoScroll }: Props) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Glow blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-30 blur-[120px]" style={{ background: '#A4FF5E' }} />
        <div className="absolute -bottom-40 -right-40 w-[400px] h-[400px] rounded-full opacity-20 blur-[100px]" style={{ background: '#C7A6FF' }} />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
              style={{ background: 'rgba(164,255,94,0.12)', color: '#A4FF5E', border: '1px solid rgba(164,255,94,0.2)' }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Controle financeiro inteligente
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-6 tracking-tight">
              Controle suas finanças{' '}
              <span style={{ color: '#A4FF5E' }}>com clareza.</span>
            </h1>

            <p className="text-lg sm:text-xl mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed" style={{ color: '#B8C0D4' }}>
              Clario organiza gastos, limites e metas com um dashboard lindo e simples.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a
                href="#pricing"
                className="inline-flex items-center justify-center gap-2 text-sm font-bold px-7 py-3.5 rounded-full transition-all hover:brightness-110"
                style={{ background: '#A4FF5E', color: '#0B0D12', boxShadow: '0 0 30px -5px rgba(164,255,94,0.4)' }}
              >
                Começar grátis
                <ArrowRight className="w-4 h-4" />
              </a>
              <button
                onClick={onAutoScroll}
                className="inline-flex items-center justify-center gap-2 text-sm font-semibold px-7 py-3.5 rounded-full border transition-all hover:bg-white/5"
                style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#B8C0D4' }}
              >
                Ver demo
              </button>
            </div>
          </motion.div>

          {/* Right - Dashboard mock */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="relative"
          >
            <div
              className="rounded-3xl p-6 sm:p-8 relative overflow-hidden"
              style={{ background: '#121827', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 25px 80px -20px rgba(0,0,0,0.6)' }}
            >
              {/* Mini header */}
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full" style={{ background: '#FF6058' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#FFBD2E' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#27CA40' }} />
                <span className="ml-3 text-xs font-medium" style={{ color: '#B8C0D4' }}>Clario Dashboard</span>
              </div>

              {/* Cards row */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: 'Saldo', value: '24.580 MT', accent: false },
                  { label: 'Gastos', value: '8.320 MT', accent: true },
                ].map((c, i) => (
                  <motion.div
                    key={c.label}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut' }}
                    className="rounded-2xl p-4"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <p className="text-[11px] font-medium mb-1" style={{ color: '#B8C0D4' }}>{c.label}</p>
                    <p className="text-lg font-bold" style={{ color: c.accent ? '#C7A6FF' : '#FFFFFF' }}>{c.value}</p>
                  </motion.div>
                ))}
              </div>

              {/* Fake chart bars */}
              <div className="flex items-end gap-2 h-20 mb-4">
                {[40, 65, 50, 80, 55, 70, 90].map((h, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 rounded-t-md"
                    style={{ background: i === 6 ? '#A4FF5E' : 'rgba(164,255,94,0.2)' }}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 0.5 + i * 0.08, duration: 0.6, ease: 'easeOut' }}
                  />
                ))}
              </div>
              <div className="flex justify-between text-[10px]" style={{ color: '#B8C0D4' }}>
                {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(d => <span key={d}>{d}</span>)}
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              animate={{ y: [-6, 6, -6] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-3 -right-3 px-3 py-1.5 rounded-full text-[11px] font-bold"
              style={{ background: '#C7A6FF', color: '#0B0D12', boxShadow: '0 0 20px rgba(199,166,255,0.4)' }}
            >
              ✨ Smart
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
