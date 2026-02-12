import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

interface FooterProps {
  dark?: boolean;
}

export function Footer({ dark }: FooterProps) {
  return (
    <footer
      className={!dark ? 'py-12 bg-foreground text-background' : 'py-12'}
      style={dark ? { backgroundColor: '#080A0F', color: '#FFFFFF' } : undefined}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-display font-bold" style={dark ? { color: '#FFFFFF' } : undefined}>Encomendas</span>
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm" style={dark ? { color: '#B8C0D4' } : undefined}>
            {!dark && (
              <>
                <Link to="/sobre" className="text-muted-foreground hover:text-background transition-colors">Sobre</Link>
                <Link to="/precos" className="text-muted-foreground hover:text-background transition-colors">Preços</Link>
                <Link to="/termos" className="text-muted-foreground hover:text-background transition-colors">Termos de Uso</Link>
                <Link to="/privacidade" className="text-muted-foreground hover:text-background transition-colors">Privacidade</Link>
              </>
            )}
            {dark && (
              <>
                <Link to="/sobre" className="hover:text-white transition-colors">Sobre</Link>
                <Link to="/precos" className="hover:text-white transition-colors">Preços</Link>
                <Link to="/termos" className="hover:text-white transition-colors">Termos de Uso</Link>
                <Link to="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
              </>
            )}
          </div>

          <p className="text-sm" style={dark ? { color: 'rgba(255,255,255,0.4)' } : undefined}>
            {!dark && <span className="text-muted-foreground">© {new Date().getFullYear()} Encomendas. Feito em 🇲🇿 Moçambique</span>}
            {dark && `© ${new Date().getFullYear()} Encomendas. Feito em 🇲🇿 Moçambique`}
          </p>
        </div>
      </div>
    </footer>
  );
}
