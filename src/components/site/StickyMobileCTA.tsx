import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { reachGoal, Goals } from '@/lib/metrika';

const StickyMobileCTA = () => {
  const [visible, setVisible] = useState(false);
  const [cookieActive, setCookieActive] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const scrolled = window.scrollY > 500;
        const bottom = window.scrollY + window.innerHeight;
        const max = document.documentElement.scrollHeight;
        const nearFooter = max - bottom < 400;
        setVisible(scrolled && !nearFooter);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const check = () => setCookieActive(root.classList.contains('cookie-banner-visible'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const hidden =
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/privacy') ||
    cookieActive;

  if (hidden) return null;

  const handleClick = () => {
    reachGoal(Goals.PriceRequestOpen, { source: 'sticky_mobile_cta' });
    if (location.pathname === '/') {
      const el = document.getElementById('contacts');
      if (el) {
        const offset = window.innerWidth >= 640 ? 96 : 80;
        const top = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      }
    } else {
      navigate('/#contacts');
    }
  };

  return (
    <div
      className={`md:hidden fixed z-40 left-3 right-3 bottom-3 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <button
        type="button"
        onClick={handleClick}
        className="w-full h-12 rounded-full bg-[hsl(var(--earth))] text-white font-medium shadow-xl shadow-[hsl(var(--earth))]/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
      >
        <Icon name="Send" size={18} />
        Оставить заявку
      </button>
    </div>
  );
};

export default StickyMobileCTA;