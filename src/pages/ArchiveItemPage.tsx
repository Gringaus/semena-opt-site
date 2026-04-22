import { Link, useParams } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { archive } from '@/components/site/data';

const ArchiveItemPage = () => {
  const { slug } = useParams();
  const item = archive.find((a) => a.slug === slug);

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
          <Link to="/archive">
            <Button variant="outline" className="rounded-full">
              <Icon name="ArrowLeft" size={16} />
              В архив
            </Button>
          </Link>
        </div>
      </header>

      {!item ? (
        <section className="container py-24 lg:py-32 text-center">
          <h1 className="font-display text-4xl lg:text-5xl mb-6">Запись не найдена</h1>
          <p className="text-muted-foreground mb-8">Возможно, запись была удалена или перемещена.</p>
          <Link to="/archive">
            <Button size="lg" className="rounded-full bg-[hsl(var(--forest))] hover:bg-[hsl(var(--forest))]/90 text-[hsl(var(--cream))] h-14 px-8">
              Вернуться в архив
            </Button>
          </Link>
        </section>
      ) : (
        <div className="container py-16 lg:py-24">
          <Link to="/archive" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-10 transition-colors">
            <Icon name="ArrowLeft" size={16} />
            Ко всем записям архива
          </Link>

          <div className="grid lg:grid-cols-12 gap-12">
            <article className="lg:col-span-8">
              <div className="flex items-center gap-3 mb-6">
                <Badge className="rounded-full border-0 bg-[hsl(var(--earth))]/20 text-[hsl(var(--earth))]">
                  Архив
                </Badge>
                <span className="text-xs uppercase tracking-wider text-muted-foreground">{item.date}</span>
              </div>

              <h1 className="font-display text-4xl lg:text-6xl leading-[1] mb-10">{item.title}</h1>

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

            <aside className="lg:col-span-4">
              <div className="lg:sticky lg:top-24 bg-card border border-border/60 rounded-3xl p-7">
                <div className="text-xs uppercase tracking-[0.25em] text-[hsl(var(--earth))] mb-3">Ещё из архива</div>
                <h3 className="font-display text-2xl mb-6">Другие записи</h3>
                <div className="divide-y divide-border/60">
                  {archive
                    .filter((a) => a.slug !== item.slug)
                    .map((a) => (
                      <Link
                        key={a.slug}
                        to={`/archive/${a.slug}`}
                        className="block py-4 group first:pt-0 last:pb-0"
                      >
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{a.date}</div>
                        <div className="font-display text-base leading-snug group-hover:text-[hsl(var(--forest))] transition-colors flex items-start justify-between gap-3">
                          <span>{a.title}</span>
                          <Icon name="ArrowUpRight" size={14} className="opacity-40 group-hover:opacity-100 transition-opacity mt-1 shrink-0" />
                        </div>
                      </Link>
                    ))}
                </div>
                <Link to="/archive" className="mt-6 pt-5 border-t border-border/60 flex items-center gap-2 text-sm font-medium text-[hsl(var(--forest))] hover:gap-3 transition-all">
                  Все записи архива <Icon name="ArrowRight" size={16} />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchiveItemPage;