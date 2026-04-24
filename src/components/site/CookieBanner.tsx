import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const STORAGE_KEY = 'cookie_consent_v1';

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (!v) {
        const t = setTimeout(() => setVisible(true), 600);
        return () => clearTimeout(t);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (visible) {
      root.classList.add('cookie-banner-visible');
    } else {
      root.classList.remove('cookie-banner-visible');
    }
    return () => {
      root.classList.remove('cookie-banner-visible');
    };
  }, [visible]);

  const accept = () => {
    try { localStorage.setItem(STORAGE_KEY, 'accepted'); } catch { /* ignore */ }
    setVisible(false);
  };

  const dismiss = () => {
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:bottom-6 md:max-w-md z-[90]">
      <div className="relative bg-[hsl(var(--forest))] text-[hsl(var(--cream))] rounded-3xl p-5 pr-12 shadow-2xl border border-[hsl(var(--cream))]/10">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Закрыть"
          className="absolute top-3 right-3 w-9 h-9 rounded-full grid place-items-center text-[hsl(var(--cream))]/70 hover:text-[hsl(var(--cream))] hover:bg-[hsl(var(--cream))]/10 transition-colors"
        >
          <Icon name="X" size={18} />
        </button>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[hsl(var(--lime))]/20 grid place-items-center shrink-0">
            <Icon name="Cookie" size={20} className="text-[hsl(var(--lime))]" />
          </div>
          <div className="text-sm leading-relaxed">
            Мы используем файлы cookie, чтобы сайт работал удобнее и быстрее. Продолжая пользоваться сайтом, вы соглашаетесь на их использование и принимаете{' '}
            <Link to="/privacy" className="underline hover:text-[hsl(var(--lime))]">
              политику конфиденциальности
            </Link>
            .
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={accept}
            className="flex-1 rounded-full bg-[hsl(var(--lime))] hover:bg-[hsl(var(--lime))]/90 text-[hsl(var(--forest))] h-11"
          >
            Принять
          </Button>
          <Link to="/privacy" className="flex-1">
            <Button variant="outline" className="w-full rounded-full h-11 bg-transparent border-[hsl(var(--cream))]/30 text-[hsl(var(--cream))] hover:bg-[hsl(var(--cream))]/10 hover:text-[hsl(var(--cream))]">
              Подробнее
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;