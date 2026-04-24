import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '@/components/ui/icon';

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        setVisible(window.scrollY > 400);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname, location.hash]);

  if (location.pathname.startsWith('/admin')) return null;

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Наверх"
      className={`fixed z-40 right-4 sm:right-6 bottom-20 sm:bottom-6 h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-[hsl(var(--forest))] text-[hsl(var(--cream))] shadow-lg border border-[hsl(var(--cream))]/10 grid place-items-center transition-all duration-300 hover:bg-[hsl(var(--forest))]/90 ${
        visible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-3 pointer-events-none'
      }`}
    >
      <Icon name="ArrowUp" size={22} />
    </button>
  );
};

export default ScrollToTop;