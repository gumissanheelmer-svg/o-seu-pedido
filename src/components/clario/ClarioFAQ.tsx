import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  { q: 'O Clario é realmente grátis?', a: 'Sim! O plano Starter é 100% grátis e permite até 50 transações por mês. Sem necessidade de cartão de crédito.' },
  { q: 'Posso usar no telemóvel?', a: 'Absolutamente. O Clario foi desenhado mobile-first e funciona perfeitamente em qualquer dispositivo.' },
  { q: 'Os meus dados estão seguros?', a: 'Sim. Usamos encriptação de ponta a ponta e nunca vendemos dados. A sua privacidade é prioridade.' },
  { q: 'Como funciona o limite diário?', a: 'Você define um valor máximo de gasto diário. O Clario acompanha em tempo real e avisa antes de ultrapassar.' },
  { q: 'Posso cancelar a qualquer momento?', a: 'Sim, sem perguntas. Cancele o Pro quando quiser e mantenha acesso ao plano Starter.' },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="border-b"
      style={{ borderColor: 'rgba(255,255,255,0.06)' }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left"
      >
        <span className="text-sm sm:text-base font-semibold pr-4">{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown className="w-4 h-4 shrink-0" style={{ color: '#B8C0D4' }} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-relaxed" style={{ color: '#B8C0D4' }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function ClarioFAQ() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="py-20 sm:py-28 px-4" ref={ref}>
      <div className="max-w-2xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-3xl sm:text-4xl font-extrabold text-center mb-4"
        >
          Perguntas <span style={{ color: '#A4FF5E' }}>frequentes</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.1 }}
          className="text-center text-base mb-12"
          style={{ color: '#B8C0D4' }}
        >
          Tudo o que precisa saber antes de começar.
        </motion.p>

        {inView && (
          <div>
            {FAQS.map((f, i) => (
              <FAQItem key={i} q={f.q} a={f.a} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
