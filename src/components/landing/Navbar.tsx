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

  // Always dark now for landing
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl"
      style={{
        backgroundColor: 'rgba(11,13,18,0.85)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #FF7A1A, #FF9A4A)' }}
            >
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-display font-bold" style={{ color: '#FFFFFF' }}>
              Encomendas
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/sobre" className="font-medium transition-colors hover:text-white" style={{ color: '#B8C0D4' }}>Sobre</Link>
            <Link to="/precos" className="font-medium transition-colors hover:text-white" style={{ color: '#B8C0D4' }}>Preços</Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/entrar">
              <Button variant="ghost" style={{ color: '#FFFFFF' }}>Entrar</Button>
            </Link>
            <Link to="/registar">
              <Button
                className="font-semibold text-white border-0"
                style={{ background: 'linear-gradient(135deg, #FF7A1A, #FF9A4A)' }}
              >
                Criar Loja Grátis
              </Button>
            </Link>
          </div>

          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2" style={{ color: '#FFFFFF' }}>
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
            className="md:hidden"
            style={{ backgroundColor: '#0B0D12', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="container mx-auto px-4 py-4 space-y-4">
              <Link to="/sobre" className="block font-medium hover:text-white" style={{ color: '#B8C0D4' }} onClick={() => setIsOpen(false)}>Sobre</Link>
              <Link to="/precos" className="block font-medium hover:text-white" style={{ color: '#B8C0D4' }} onClick={() => setIsOpen(false)}>Preços</Link>
              <hr style={{ borderColor: 'rgba(255,255,255,0.06)' }} />
              <div className="flex flex-col gap-2">
                <Link to="/entrar" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full" style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#FFFFFF' }}>Entrar</Button>
                </Link>
                <Link to="/registar" onClick={() => setIsOpen(false)}>
                  <Button className="w-full font-semibold text-white border-0" style={{ background: 'linear-gradient(135deg, #FF7A1A, #FF9A4A)' }}>Criar Loja Grátis</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
