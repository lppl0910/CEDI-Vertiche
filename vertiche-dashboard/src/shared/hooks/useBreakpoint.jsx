import { useState, useEffect } from 'react';

export function useBreakpoint() {
  const [isTablet, setIsTablet] = useState(window.innerWidth < 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handler = () => {
      setIsTablet(window.innerWidth < 1024);
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return { isTablet, isMobile };
}