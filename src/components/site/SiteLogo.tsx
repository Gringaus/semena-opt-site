import { Link } from 'react-router-dom';

export const LOGO_URL = 'https://i.postimg.cc/9MZQsVfv/logo-opt.jpg';

interface SiteLogoProps {
  to?: string;
  className?: string;
}

const SiteLogo = ({ to = '/', className = '' }: SiteLogoProps) => {
  const content = (
    <div className={`flex items-center gap-3 ${className}`}>
      {LOGO_URL ? (
        <img src={LOGO_URL} alt="Семена Оптом" className="h-12 w-auto object-contain" />
      ) : (
        <div className="w-11 h-11 rounded-full bg-[hsl(var(--forest))] grid place-items-center shrink-0">
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-[hsl(var(--lime))]" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 20h10M12 20V9m0 0c-3-1-4-4-4-7 3 1 4 4 4 7Zm0 0c3-1 4-4 4-7-3 1-4 4-4 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
      <div className="leading-tight">
        <div className="font-display text-xl font-semibold">Семена Оптом</div>
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground max-w-[260px]">
          магазин для юридических лиц и индивидуальных предпринимателей
        </div>
      </div>
    </div>
  );

  if (!to) return content;
  return <Link to={to}>{content}</Link>;
};

export default SiteLogo;