import { useState, useEffect } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    // Check if window is available (SSR safety)
    if (typeof window === 'undefined') return false;
    return window.matchMedia(QUERY).matches;
  });

  useEffect(() => {
    const mediaQueryList = window.matchMedia(QUERY);
    
    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQueryList.addEventListener('change', listener);
    
    return () => {
      mediaQueryList.removeEventListener('change', listener);
    };
  }, []);

  return prefersReducedMotion;
}

// Motion config helper for Framer Motion
export function getMotionConfig(prefersReducedMotion: boolean) {
  return {
    transition: prefersReducedMotion 
      ? { duration: 0 } 
      : undefined,
    animate: prefersReducedMotion 
      ? {} 
      : undefined,
  };
}
