import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

export function Footer() {
  return (
    <footer className="py-12 bg-foreground text-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-display font-bold">Encomendas</span>
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <Link to="/sobre" className="hover:text-background transition-colors">
              Sobre
            </Link>
            <Link to="/precos" className="hover:text-background transition-colors">
              Preços
            </Link>
            <Link to="/termos" className="hover:text-background transition-colors">
              Termos de Uso
            </Link>
            <Link to="/privacidade" className="hover:text-background transition-colors">
              Privacidade
            </Link>
          </div>

          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Encomendas. Feito em 🇲🇿 Moçambique
          </p>
        </div>
      </div>
    </footer>
  );
}
