
import { useState, useEffect, useRef, RefObject } from 'react';

export const useScrollVisibility = <T extends HTMLElement>(): [RefObject<T>, boolean] => {
  const elementRef = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (!elementRef.current) return;

      const rect = elementRef.current.getBoundingClientRect();
      const isElementVisible = rect.bottom > 0 && rect.top < window.innerHeight;
      
      setIsVisible(isElementVisible);
    };

    // Initial check
    handleScroll();

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return [elementRef, isVisible];
};
