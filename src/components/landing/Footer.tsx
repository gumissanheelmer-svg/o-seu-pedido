import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

export function Footer() {
  return (
    <footer className="py-12" style={{ backgroundColor: '#080A0F', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FF7A1A, #FF9A4A)' }}>
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-display font-bold" style={{ color: '#FFFFFF' }}>Encomendas</span>
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm" style={{ color: '#B8C0D4' }}>
            <Link to="/sobre" className="hover:text-white transition-colors">Sobre</Link>
            <Link to="/precos" className="hover:text-white transition-colors">Preços</Link>
            <Link to="/termos" className="hover:text-white transition-colors">Termos de Uso</Link>
            <Link to="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
          </div>

          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
            © {new Date().getFullYear()} Encomendas. Feito em 🇲🇿 Moçambique
          </p>
        </div>
      </div>
    </footer>
  );
}
