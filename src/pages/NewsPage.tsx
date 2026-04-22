import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { news as newsFallback, NEWS_API_URL } from '@/components/site/data';

interface NewsItem { slug: string; date: string; tag: string; title: string; text: string; content?: string[]; image?: string }

const NewsPage = () => {
  const { slug } = useParams();
  const [items, setItems] = useState<NewsItem[]>(newsFallback);

  useEffect(() => {
    fetch(NEWS_API_URL)
      .then((r) => r.json())
      .then((d) => { if (d.items?.length) setItems(d.items); })
      .catch(() => {});
  }, []);

  const item = items.find((n) => n.slug === slug);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/60">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-[hsl(var(--forest))] grid place-items-center">
              <Icon name="Sprout" size={20} className="text-[hsl(var(--lime))]" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-xl font-semibold">Семена Оптом</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">с 2009 года</div>
            </div>
          </Link>
          <Link to="/">
            <Button variant="outline" className="rounded-full">
              <Icon name="ArrowLeft" size={16} />
              На главную
            </Button>
          </Link>
        </div>
      </header>

      {!item ? (
        <section className="container py-24 lg:py-32 text-center">
          <h1 className="font-display text-4xl lg:text-5xl mb-6">Новость не найдена</h1>
          <p className="text-muted-foreground mb-8">Возможно, запись была удалена или перемещена в архив.</p>
          <Link to="/">
            <Button size="lg" className="rounded-full bg-[hsl(var(--forest))] hover:bg-[hsl(var(--forest))]/90 text-[hsl(var(--cream))] h-14 px-8">
              Вернуться на главную
            </Button>
          </Link>
        </section>
      ) : (
        <article className="container py-16 lg:py-24 max-w-3xl">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-10 transition-colors">
            <Icon name="ArrowLeft" size={16} />
            Ко всем новостям
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <Badge className={`rounded-full border-0 ${item.tag === 'Поступление' ? 'bg-[hsl(var(--lime))]/30 text-[hsl(var(--forest))]' : 'bg-[hsl(var(--earth))]/20 text-[hsl(var(--earth))]'}`}>
              {item.tag}
            </Badge>
            <span className="text-xs uppercase tracking-wider text-muted-foreground">{item.date}</span>
          </div>

          <h1 className="font-display text-4xl lg:text-6xl leading-[1] mb-8">{item.title}</h1>

          {item.image && (
            <div className="aspect-[16/9] rounded-3xl overflow-hidden mb-10">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
            </div>
          )}

          <p className="text-xl text-muted-foreground leading-relaxed mb-10 border-l-4 border-[hsl(var(--earth))] pl-6">
            {item.text}
          </p>

          <div className="space-y-6">
            {item.content?.map((p, i) => (
              <p key={i} className="text-lg leading-relaxed">{p}</p>
            ))}
          </div>

          <div className="mt-16 pt-10 border-t border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Остались вопросы?</div>
              <div className="font-display text-2xl">Свяжитесь с менеджером</div>
            </div>
            <Link to="/#contacts">
              <Button size="lg" className="rounded-full bg-[hsl(var(--forest))] hover:bg-[hsl(var(--forest))]/90 text-[hsl(var(--cream))] h-14 px-8">
                Оставить заявку
                <Icon name="ArrowRight" size={18} />
              </Button>
            </Link>
          </div>
        </article>
      )}
    </div>
  );
};

export default NewsPage;