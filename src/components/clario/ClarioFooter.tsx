import { ArrowRight } from 'lucide-react';

export function ClarioFooter() {
  return (
    <footer className="border-t py-16 px-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Mini CTA */}
        <div className="text-center mb-12">
          <h3 className="text-2xl sm:text-3xl font-extrabold mb-3">
            Pronta para ter <span style={{ color: '#A4FF5E' }}>clareza financeira</span>?
          </h3>
          <p className="text-sm mb-6" style={{ color: '#B8C0D4' }}>
            Comece grátis. Sem cartão de crédito.
          </p>
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 text-sm font-bold px-7 py-3 rounded-full transition-all hover:brightness-110"
            style={{ background: '#A4FF5E', color: '#0B0D12', boxShadow: '0 0 25px -5px rgba(164,255,94,0.35)' }}
          >
            Começar agora <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs" style={{ color: '#B8C0D4' }}>
          <span className="font-bold text-base" style={{ color: '#A4FF5E' }}>Clario</span>
          <div className="flex gap-6">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Preços</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
          <span>© 2026 Clario. Todos os direitos reservados.</span>
        </div>
      </div>
    </footer>
  );
}
