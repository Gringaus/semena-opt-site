import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import SiteLogo from './SiteLogo';
import { nav } from './data';

interface HeaderHeroProps {
  active: string;
  scroll: (id: string) => void;
}

const HeaderHero = ({ active, scroll }: HeaderHeroProps) => {
  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/60">
        <div className="container flex items-center justify-between h-16">
          <SiteLogo to="" />

          <nav className="hidden lg:flex items-center gap-1">
            {nav.map((n) => (
              <button
                key={n.id}
                onClick={() => scroll(n.id)}
                className={`px-4 py-2 text-sm rounded-full transition-colors ${
                  active === n.id ? 'bg-[hsl(var(--forest))] text-[hsl(var(--cream))]' : 'hover:bg-muted'
                }`}
              >
                {n.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-[hsl(var(--earth))] hover:bg-[hsl(var(--earth))]/90 text-white rounded-full">
                  <Icon name="Phone" size={16} />
                  Связаться
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-3xl max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-display text-3xl">Свяжитесь с нами</DialogTitle>
                </DialogHeader>
                <div className="space-y-5 pt-2">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-full bg-[hsl(var(--forest))] grid place-items-center shrink-0">
                      <Icon name="Phone" size={18} className="text-[hsl(var(--lime))]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Телефоны</div>
                      <a href="tel:+79206738383" className="font-display text-xl block hover:text-[hsl(var(--earth))] transition-colors">
                        +7 (920) 673-83-83
                      </a>
                      <a href="tel:+79203418866" className="font-display text-xl block hover:text-[hsl(var(--earth))] transition-colors">
                        +7 (920) 341-88-66
                      </a>
                      <div className="text-xs text-muted-foreground mt-1">Пн–Пт: 9:00–17:00 · Сб: 9:00–14:00</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-full bg-[hsl(var(--forest))] grid place-items-center shrink-0">
                      <Icon name="Mail" size={18} className="text-[hsl(var(--lime))]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Почта</div>
                      <a href="mailto:semena.37@mail.ru" className="font-display text-xl block hover:text-[hsl(var(--earth))] transition-colors break-all">semena37@mail.ru</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-full bg-[hsl(var(--forest))] grid place-items-center shrink-0">
                      <Icon name="MapPin" size={18} className="text-[hsl(var(--lime))]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Адрес</div>
                      <div className="font-display text-xl">г. Иваново</div>
                      <div className="text-sm text-muted-foreground">ул. Зелёная, д. 19В</div>
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
        <div className="container pt-20 pb-24 lg:pt-32 lg:pb-40 relative">
          <div className="grid lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-7 rise">
              <Badge className="mb-6 bg-[hsl(var(--lime))]/20 text-[hsl(var(--forest))] border-0 rounded-full px-4 py-1.5 hover:bg-[hsl(var(--lime))]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--forest))] mr-2 animate-pulse" />
                Сезон 2026 открыт
              </Badge>
              <h1 className="font-display text-6xl lg:text-8xl leading-[0.95] tracking-tight text-balance">
                Семена, <br />
                <em className="text-[hsl(var(--earth))]">которые прорастают</em> <br />
                в урожай.
              </h1>
              <p className="mt-8 text-lg text-muted-foreground max-w-xl">
                Оптовый поставщик семян овощных, цветочных и полевых культур. Более 560 позиций, прямые контракты с селекционными станциями.
              </p>
            </div>
            <div className="lg:col-span-5 relative rise" style={{ animationDelay: '0.15s' }}>
              <div className="aspect-[4/5] rounded-[2rem] overflow-hidden relative shadow-2xl">
                <img src="https://cdn.poehali.dev/projects/6e30ca34-8fe1-4535-8d16-622fe38c58fb/files/a1c310be-a37a-41df-bcbd-1078909d16ec.jpg" alt="Семена" className="w-full h-full object-cover" />
                <div className="absolute bottom-6 left-6 right-6 bg-background/95 backdrop-blur rounded-2xl p-5">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Ассортимент</div>
                      <div className="font-display text-4xl font-semibold">560+</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Регионов</div>
                      <div className="font-display text-4xl font-semibold">48</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Всхожесть</div>
                      <div className="font-display text-4xl font-semibold">97%</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-6 -right-4 w-28 h-28 rounded-full bg-[hsl(var(--lime))] grid place-items-center rotate-12 shadow-xl">
                <div className="text-center leading-tight">
                  <div className="font-display text-2xl font-bold">-15%</div>
                  <div className="text-[10px] uppercase tracking-wider">ранний опт</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-y border-border/60 py-5 overflow-hidden bg-[hsl(var(--forest))] text-[hsl(var(--cream))]">
          <div className="flex marquee whitespace-nowrap">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center gap-12 pr-12 font-display text-3xl italic">
                <span>Подсолнечник</span><span>✿</span>
                <span>Томаты</span><span>✿</span>
                <span>Кукуруза</span><span>✿</span>
                <span>Огурцы</span><span>✿</span>
                <span>Газонные травы</span><span>✿</span>
                <span>Цветы</span><span>✿</span>
                <span>Зелень</span><span>✿</span>
                <span>Рапс</span><span>✿</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default HeaderHero;