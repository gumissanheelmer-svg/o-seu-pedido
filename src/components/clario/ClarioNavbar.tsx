import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Play, Pause } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'Features', href: '#features' },
  { label: 'Preços', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

interface Props {
  onAutoScroll: () => void;
  autoScrolling: boolean;
}

export function ClarioNavbar({ onAutoScroll, autoScrolling }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b"
      style={{ background: 'rgba(11,13,18,0.8)', borderColor: 'rgba(255,255,255,0.08)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <a href="#hero" className="text-xl font-bold tracking-tight" style={{ color: '#A4FF5E' }}>
          Clario
        </a>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(l => (
            <a key={l.href} href={l.href} className="text-sm font-medium transition-colors hover:opacity-100" style={{ color: '#B8C0D4' }}>
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={onAutoScroll}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all"
            style={{ borderColor: 'rgba(255,255,255,0.12)', color: '#B8C0D4' }}
          >
            {autoScrolling ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            {autoScrolling ? 'Parar' : 'Assistir'}
          </button>
          <a
            href="#pricing"
            className="text-sm font-semibold px-5 py-2 rounded-full transition-all"
            style={{ background: '#A4FF5E', color: '#0B0D12' }}
          >
            Começar grátis
          </a>
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)} style={{ color: '#B8C0D4' }}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t"
            style={{ background: '#0B0D12', borderColor: 'rgba(255,255,255,0.08)' }}
          >
            <div className="px-4 py-4 space-y-3">
              {NAV_LINKS.map(l => (
                <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block text-sm font-medium" style={{ color: '#B8C0D4' }}>
                  {l.label}
                </a>
              ))}
              <a
                href="#pricing"
                onClick={() => setOpen(false)}
                className="block text-center text-sm font-semibold px-5 py-2.5 rounded-full mt-2"
                style={{ background: '#A4FF5E', color: '#0B0D12' }}
              >
                Começar grátis
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
