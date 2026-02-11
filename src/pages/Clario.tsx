import { useRef, useState, useCallback, useEffect } from 'react';
import { ClarioNavbar } from '@/components/clario/ClarioNavbar';
import { ClarioHero } from '@/components/clario/ClarioHero';
import { ClarioDashboard } from '@/components/clario/ClarioDashboard';
import { ClarioFeatures } from '@/components/clario/ClarioFeatures';
import { ClarioPricing } from '@/components/clario/ClarioPricing';
import { ClarioTestimonials } from '@/components/clario/ClarioTestimonials';
import { ClarioFAQ } from '@/components/clario/ClarioFAQ';
import { ClarioFooter } from '@/components/clario/ClarioFooter';

const SECTION_IDS = ['hero', 'dashboard', 'features', 'pricing', 'testimonials', 'faq'];

export default function Clario() {
  const [autoScrolling, setAutoScrolling] = useState(false);
  const autoScrollRef = useRef(false);

  const startAutoScroll = useCallback(async () => {
    setAutoScrolling(true);
    autoScrollRef.current = true;

    const cancelHandler = () => {
      autoScrollRef.current = false;
      setAutoScrolling(false);
      window.removeEventListener('wheel', cancelHandler);
      window.removeEventListener('touchstart', cancelHandler);
    };
    window.addEventListener('wheel', cancelHandler, { passive: true });
    window.addEventListener('touchstart', cancelHandler, { passive: true });

    for (const id of SECTION_IDS) {
      if (!autoScrollRef.current) break;
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        await new Promise(r => setTimeout(r, 2800));
      }
    }

    window.removeEventListener('wheel', cancelHandler);
    window.removeEventListener('touchstart', cancelHandler);
    autoScrollRef.current = false;
    setAutoScrolling(false);
  }, []);

  useEffect(() => {
    return () => { autoScrollRef.current = false; };
  }, []);

  return (
    <div style={{ background: '#0B0D12', color: '#FFFFFF' }} className="min-h-screen font-sans antialiased">
      <ClarioNavbar onAutoScroll={startAutoScroll} autoScrolling={autoScrolling} />
      <main>
        <div id="hero"><ClarioHero onAutoScroll={startAutoScroll} /></div>
        <div id="dashboard"><ClarioDashboard /></div>
        <div id="features"><ClarioFeatures /></div>
        <div id="pricing"><ClarioPricing /></div>
        <div id="testimonials"><ClarioTestimonials /></div>
        <div id="faq"><ClarioFAQ /></div>
      </main>
      <ClarioFooter />
    </div>
  );
}
