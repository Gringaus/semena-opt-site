import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { archive as archiveFallback, ARCHIVE_API_URL } from '@/components/site/data';
import SiteLogo from '@/components/site/SiteLogo';

interface ArchiveItem { slug: string; date: string; title: string; image?: string }

const ArchivePage = () => {
  const [items, setItems] = useState<ArchiveItem[]>(archiveFallback);

  useEffect(() => {
    fetch(ARCHIVE_API_URL)
      .then((r) => r.json())
      .then((d) => { if (d.items?.length) setItems(d.items); })
      .catch(() => {});
  }, []);

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

      <section className="container py-24 lg:py-32">
        <div className="mb-12">
          <div className="text-xs uppercase tracking-[0.25em] text-[hsl(var(--earth))] mb-3">Архив</div>
          <h1 className="font-display text-5xl lg:text-7xl leading-[0.95]">
            Архив <em className="text-[hsl(var(--earth))]">новостей</em>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl">
            Все прошлые поступления, события и обновления компании. Новые записи появляются еженедельно.
          </p>
        </div>

        <div className="divide-y divide-border/60 border-y border-border/60">
          {items.map((a, i) => (
            <Link
              key={i}
              to={`/archive/${a.slug}`}
              className="flex items-center justify-between gap-6 py-5 group cursor-pointer hover:pl-4 transition-all"
            >
              <div className="flex items-center gap-6 min-w-0 flex-1">
                {a.image ? (
                  <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-border/60">
                    <img src={a.image} alt={a.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-2xl shrink-0 bg-muted grid place-items-center">
                    <Icon name="FileText" size={24} className="text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{a.date}</div>
                  <div className="font-display text-xl leading-tight truncate">{a.title}</div>
                </div>
              </div>
              <Icon name="ArrowUpRight" size={18} className="opacity-40 group-hover:opacity-100 transition-opacity shrink-0" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ArchivePage;