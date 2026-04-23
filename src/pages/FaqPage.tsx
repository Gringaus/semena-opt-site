import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { faqCategories, faqIntro } from '@/components/site/faq';
import SiteLogo from '@/components/site/SiteLogo';

const FaqPage = () => {
  const [active, setActive] = useState(faqCategories[0].id);
  const current = faqCategories.find((c) => c.id === active) ?? faqCategories[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/60">
        <div className="container flex items-center justify-between h-16">
          <SiteLogo to="/" />
          <Link to="/">
            <Button variant="outline" className="rounded-full">
              <Icon name="ArrowLeft" size={16} />
              На главную
            </Button>
          </Link>
        </div>
      </header>

      <section className="container py-20 lg:py-28">
        <div className="mb-12 max-w-3xl">
          <Badge className="mb-6 bg-[hsl(var(--lime))]/20 text-[hsl(var(--forest))] border-0 rounded-full px-4 py-1.5 hover:bg-[hsl(var(--lime))]/30">
            FAQ
          </Badge>
          <h1 className="font-display text-5xl lg:text-7xl leading-[0.95] mb-8">
            Вопросы и <em className="text-[hsl(var(--earth))]">ответы</em>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {faqIntro}
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 items-start">
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-2">
              <div className="text-xs uppercase tracking-[0.25em] text-[hsl(var(--earth))] mb-4">Разделы</div>
              {faqCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActive(cat.id)}
                  className={`w-full flex items-center justify-between gap-4 p-5 rounded-2xl transition-all text-left ${
                    active === cat.id
                      ? 'bg-[hsl(var(--forest))] text-[hsl(var(--cream))]'
                      : 'bg-card hover:bg-muted border border-border/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full grid place-items-center shrink-0 ${active === cat.id ? 'bg-[hsl(var(--lime))]/20' : 'bg-[hsl(var(--lime))]/30'}`}>
                      <Icon name={cat.icon} size={18} className={active === cat.id ? 'text-[hsl(var(--lime))]' : 'text-[hsl(var(--forest))]'} />
                    </div>
                    <div>
                      <div className="font-display text-lg leading-tight">{cat.title}</div>
                      <div className={`text-xs ${active === cat.id ? 'opacity-70' : 'text-muted-foreground'}`}>
                        {cat.items.length} {cat.items.length === 1 ? 'вопрос' : cat.items.length < 5 ? 'вопроса' : 'вопросов'}
                      </div>
                    </div>
                  </div>
                  <Icon name="ChevronRight" size={18} className={active === cat.id ? 'opacity-100' : 'opacity-40'} />
                </button>
              ))}
            </div>
          </aside>

          <div className="lg:col-span-8">
            <Card className="p-6 lg:p-10 rounded-3xl border-border/60">
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border/60">
                <div className="w-14 h-14 rounded-full bg-[hsl(var(--lime))]/30 grid place-items-center shrink-0">
                  <Icon name={current.icon} size={24} className="text-[hsl(var(--forest))]" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.25em] text-[hsl(var(--earth))] mb-1">Раздел</div>
                  <h2 className="font-display text-3xl lg:text-4xl">{current.title}</h2>
                </div>
              </div>

              <div className="space-y-2">
                {current.items.map((item, i) => (
                  <details
                    key={`${current.id}-${i}`}
                    className="group border border-border/60 rounded-2xl px-5 open:bg-muted/40 transition-colors"
                  >
                    <summary className="cursor-pointer flex items-start justify-between gap-4 py-5 font-display text-lg leading-snug list-none [&::-webkit-details-marker]:hidden">
                      <span>{item.q}</span>
                      <Icon
                        name="Plus"
                        size={20}
                        className="shrink-0 mt-1 text-[hsl(var(--forest))] transition-transform group-open:rotate-45"
                      />
                    </summary>
                    <div className="text-base text-muted-foreground leading-relaxed pb-5 pt-1 pr-8">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>

              <div className="mt-10 pt-8 border-t border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Не нашли ответ?</div>
                  <div className="font-display text-xl">Задайте вопрос менеджеру</div>
                </div>
                <Link to="/#contacts">
                  <Button size="lg" className="rounded-full bg-[hsl(var(--forest))] hover:bg-[hsl(var(--forest))]/90 text-[hsl(var(--cream))] h-14 px-8">
                    Оставить заявку
                    <Icon name="ArrowRight" size={18} />
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FaqPage;