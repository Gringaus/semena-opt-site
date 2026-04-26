import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import SiteLogo from "./SiteLogo";
import { nav } from "./data";

interface HeaderHeroProps {
  active: string;
  scroll: (id: string) => void;
}

const HeaderHero = ({ active, scroll }: HeaderHeroProps) => {
  const navRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [pill, setPill] = useState<{ left: number; width: number; visible: boolean }>({ left: 0, width: 0, visible: false });
  const [menuOpen, setMenuOpen] = useState(false);

  const pendingNavRef = useRef<string | null>(null);

  const runPendingNav = () => {
    const id = pendingNavRef.current;
    if (!id) return;
    pendingNavRef.current = null;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => scroll(id));
    });
  };

  const handleMobileNav = (id: string) => {
    pendingNavRef.current = id;
    setMenuOpen(false);
  };

  const handleMenuOpenChange = (open: boolean) => {
    setMenuOpen(open);
  };

  useEffect(() => {
    if (menuOpen) return;
    if (!pendingNavRef.current) return;
    const t = setTimeout(() => runPendingNav(), 350);
    return () => clearTimeout(t);
  }, [menuOpen]);

  useLayoutEffect(() => {
    const btn = itemRefs.current[active];
    const wrap = navRef.current;
    if (!btn || !wrap) {
      setPill((p) => ({ ...p, visible: false }));
      return;
    }
    const b = btn.getBoundingClientRect();
    const w = wrap.getBoundingClientRect();
    setPill({ left: b.left - w.left, width: b.width, visible: true });
  }, [active]);

  useEffect(() => {
    const onResize = () => {
      const btn = itemRefs.current[active];
      const wrap = navRef.current;
      if (!btn || !wrap) return;
      const b = btn.getBoundingClientRect();
      const w = wrap.getBoundingClientRect();
      setPill({ left: b.left - w.left, width: b.width, visible: true });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [active]);

  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/60">
        <div className="container flex items-center justify-between h-14 sm:h-16 gap-2 md:gap-3">
          <div className="min-w-0 flex-1 overflow-hidden">
            <SiteLogo to="" />
          </div>

          <nav ref={navRef} className="hidden md:flex items-center gap-0 lg:gap-1 relative">
            <span
              aria-hidden="true"
              className="absolute top-0 h-full rounded-full bg-[hsl(var(--forest))] transition-all duration-300 ease-out pointer-events-none"
              style={{
                left: `${pill.left}px`,
                width: `${pill.width}px`,
                opacity: pill.visible ? 1 : 0,
                transform: pill.visible ? "scale(1)" : "scale(0.9)",
              }}
            />
            {nav.map((n) => (
              <button
                key={n.id}
                ref={(el) => { itemRefs.current[n.id] = el; }}
                onClick={() => scroll(n.id)}
                className={`relative z-10 px-2 lg:px-3 xl:px-4 py-2 text-[11px] lg:text-sm rounded-full transition-colors duration-200 whitespace-nowrap ${
                  active === n.id
                    ? "text-[hsl(var(--cream))]"
                    : "text-foreground hover:text-[hsl(var(--forest))]"
                }`}
              >
                {n.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2 shrink-0">
            <Dialog open={menuOpen} onOpenChange={handleMenuOpenChange}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  aria-label="Открыть меню"
                  className="md:hidden rounded-full h-10 w-10 p-0 border-foreground/20"
                >
                  <Icon name="Menu" size={20} />
                </Button>
              </DialogTrigger>
              <DialogContent
                className="rounded-3xl w-[calc(100vw-1.5rem)] max-w-md p-5 sm:p-6"
                onCloseAutoFocus={(e) => {
                  if (pendingNavRef.current) e.preventDefault();
                }}
                onAnimationEnd={() => {
                  if (!menuOpen) runPendingNav();
                }}
              >
                <DialogHeader>
                  <DialogTitle className="font-display text-2xl sm:text-3xl">Меню</DialogTitle>
                </DialogHeader>
                <nav className="flex flex-col gap-1 pt-2">
                  {nav.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => handleMobileNav(n.id)}
                      className={`text-left px-4 py-3 rounded-2xl text-base font-medium transition-colors ${
                        active === n.id
                          ? "bg-[hsl(var(--forest))] text-[hsl(var(--cream))]"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      {n.label}
                    </button>
                  ))}
                </nav>
                <div className="border-t border-border/60 pt-4 mt-2 space-y-3">
                  <a href="tel:+79206738383" className="flex items-center gap-3 hover:text-[hsl(var(--earth))] transition-colors">
                    <Icon name="Phone" size={18} className="text-[hsl(var(--forest))]" />
                    <span className="font-display text-lg">+7 (920) 673-83-83</span>
                  </a>
                  <a href="mailto:semena.37@mail.ru" className="flex items-center gap-3 hover:text-[hsl(var(--earth))] transition-colors">
                    <Icon name="Mail" size={18} className="text-[hsl(var(--forest))]" />
                    <span className="font-display text-base break-all">semena.37@mail.ru</span>
                  </a>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  aria-label="Связаться с нами"
                  className="bg-[hsl(var(--earth))] hover:bg-[hsl(var(--earth))]/90 text-white rounded-full h-10 w-10 p-0 sm:w-auto sm:px-4 md:w-10 md:px-0 lg:w-auto lg:px-4 text-sm"
                >
                  <Icon name="Phone" size={16} />
                  <span className="hidden sm:inline md:hidden lg:inline">Связаться</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-3xl w-[calc(100vw-1.5rem)] max-w-md p-5 sm:p-6">
                <DialogHeader>
                  <DialogTitle className="font-display text-2xl sm:text-3xl">
                    Свяжитесь с нами
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 sm:space-y-5 pt-2">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[hsl(var(--forest))] grid place-items-center shrink-0">
                      <Icon
                        name="Phone"
                        size={18}
                        className="text-[hsl(var(--lime))]"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                        Телефоны
                      </div>
                      <a
                        href="tel:+79206738383"
                        className="font-display text-lg sm:text-xl block hover:text-[hsl(var(--earth))] transition-colors"
                      >
                        +7 (920) 673-83-83
                      </a>
                      <a
                        href="tel:+79203418866"
                        className="font-display text-lg sm:text-xl block hover:text-[hsl(var(--earth))] transition-colors"
                      >
                        +7 (920) 341-88-66
                      </a>
                      <div className="text-xs text-muted-foreground mt-1">
                        Пн–Пт: 9:00–17:00 · Сб: 9:00–14:00
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[hsl(var(--forest))] grid place-items-center shrink-0">
                      <Icon
                        name="Mail"
                        size={18}
                        className="text-[hsl(var(--lime))]"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                        Почта
                      </div>
                      <a
                        href="mailto:semena.37@mail.ru"
                        className="font-display text-lg sm:text-xl block hover:text-[hsl(var(--earth))] transition-colors break-all"
                      >
                        semena.37@mail.ru
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[hsl(var(--forest))] grid place-items-center shrink-0">
                      <Icon
                        name="MapPin"
                        size={18}
                        className="text-[hsl(var(--lime))]"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                        Адрес
                      </div>
                      <div className="font-display text-lg sm:text-xl">г. Иваново</div>
                      <div className="text-sm text-muted-foreground">
                        ул. Зелёная, д. 19В
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grain opacity-[0.08] pointer-events-none" />
        <div className="container pt-10 pb-14 sm:pt-16 sm:pb-20 lg:pt-32 lg:pb-40 relative">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-8 items-end">
            <div className="lg:col-span-7 rise">
              <Badge className="mb-4 sm:mb-6 bg-[hsl(var(--lime))]/20 text-[hsl(var(--forest))] border-0 rounded-full px-3 sm:px-4 py-1 sm:py-1.5 hover:bg-[hsl(var(--lime))]/30 text-xs sm:text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--forest))] mr-2 animate-pulse" />
                Сезон 2026 открыт
              </Badge>
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-8xl leading-[0.95] tracking-tight text-balance">
                Семена, <br />
                <em className="text-[hsl(var(--earth))]">
                  которые прорастают
                </em>{" "}
                <br />в урожай.
              </h1>
              <p className="mt-5 sm:mt-8 text-base sm:text-lg text-muted-foreground max-w-xl">
                Оптовый поставщик семян овощных, цветочных и полевых культур.
                Более 560 позиций, прямые контракты с селекционными станциями.
              </p>
            </div>
            <div
              className="lg:col-span-5 relative rise"
              style={{ animationDelay: "0.15s" }}
            >
              <div className="aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5] rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden relative shadow-2xl">
                <img
                  src="https://cdn.poehali.dev/projects/6e30ca34-8fe1-4535-8d16-622fe38c58fb/files/a1c310be-a37a-41df-bcbd-1078909d16ec.jpg"
                  alt="Семена"
                  width={800}
                  height={1000}
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6 bg-background/95 backdrop-blur rounded-xl sm:rounded-2xl p-3 sm:p-5">
                  <div className="flex items-baseline justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1 text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground">
                        <Icon name="Package" size={12} className="text-primary" />
                        Ассортимент
                      </div>
                      <div className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold">
                        560+
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground">
                        <Icon name="Award" size={12} className="text-primary" />
                        Опыт
                      </div>
                      <div className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold">
                        20 лет
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground">
                        <Icon name="Sprout" size={12} className="text-primary" />
                        Всхожесть
                      </div>
                      <div className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold">
                        97%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-2 sm:-top-6 sm:-right-4 w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-[hsl(var(--lime))] grid place-items-center rotate-12 shadow-xl">
                <div className="text-center leading-tight">
                  <div className="font-display text-lg sm:text-2xl font-bold"></div>
                  <div className="text-[9px] sm:text-[10px] uppercase tracking-wider"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-y border-border/60 py-3 sm:py-5 overflow-hidden bg-[hsl(var(--forest))] text-[hsl(var(--cream))]">
          <div className="flex marquee whitespace-nowrap">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-8 sm:gap-12 pr-8 sm:pr-12 font-display text-xl sm:text-2xl lg:text-3xl italic"
              >
                <span>Подсолнечник</span>
                <span>✿</span>
                <span>Томаты</span>
                <span>✿</span>
                <span>Кукуруза</span>
                <span>✿</span>
                <span>Огурцы</span>
                <span>✿</span>
                <span>Газонные травы</span>
                <span>✿</span>
                <span>Цветы</span>
                <span>✿</span>
                <span>Зелень</span>
                <span>✿</span>
                <span>Рапс</span>
                <span>✿</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default HeaderHero;