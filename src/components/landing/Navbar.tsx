import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  dark?: boolean;
}

export function Navbar({ dark }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const bg = dark ? 'rgba(11,13,18,0.85)' : undefined;
  const borderColor = dark ? 'rgba(255,255,255,0.08)' : undefined;
  const textColor = dark ? '#FFFFFF' : undefined;
  const mutedColor = dark ? '#B8C0D4' : undefined;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-lg ${!dark ? 'bg-background/80 border-b border-border/50' : ''}`}
      style={dark ? { backgroundColor: bg, borderBottom: `1px solid ${borderColor}` } : undefined}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-display font-bold" style={dark ? { color: textColor } : undefined}>
              {!dark && <span className="text-foreground">Encomendas</span>}
              {dark && 'Encomendas'}
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/sobre" className="font-medium transition-colors" style={dark ? { color: mutedColor } : undefined}>
              {!dark && <span className="text-muted-foreground hover:text-foreground">Sobre</span>}
              {dark && 'Sobre'}
            </Link>
            <Link to="/precos" className="font-medium transition-colors" style={dark ? { color: mutedColor } : undefined}>
              {!dark && <span className="text-muted-foreground hover:text-foreground">Preços</span>}
              {dark && 'Preços'}
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/entrar">
              <Button variant="ghost" style={dark ? { color: '#FFFFFF' } : undefined}>Entrar</Button>
            </Link>
            <Link to="/registar">
              <Button variant="hero">Criar Loja Grátis</Button>
            </Link>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2"
            style={dark ? { color: '#FFFFFF' } : undefined}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={!dark ? 'md:hidden bg-background border-b border-border' : 'md:hidden'}
            style={dark ? { backgroundColor: '#0B0D12', borderBottom: '1px solid rgba(255,255,255,0.08)' } : undefined}
          >
            <div className="container mx-auto px-4 py-4 space-y-4">
              <Link to="/sobre" className="block font-medium" style={dark ? { color: '#B8C0D4' } : undefined} onClick={() => setIsOpen(false)}>
                {!dark && <span className="text-muted-foreground">Sobre</span>}
                {dark && 'Sobre'}
              </Link>
              <Link to="/precos" className="block font-medium" style={dark ? { color: '#B8C0D4' } : undefined} onClick={() => setIsOpen(false)}>
                {!dark && <span className="text-muted-foreground">Preços</span>}
                {dark && 'Preços'}
              </Link>
              <hr style={dark ? { borderColor: 'rgba(255,255,255,0.08)' } : undefined} className={!dark ? 'border-border' : ''} />
              <div className="flex flex-col gap-2">
                <Link to="/entrar" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full" style={dark ? { borderColor: 'rgba(255,255,255,0.15)', color: '#FFFFFF' } : undefined}>Entrar</Button>
                </Link>
                <Link to="/registar" onClick={() => setIsOpen(false)}>
                  <Button variant="hero" className="w-full">Criar Loja Grátis</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
