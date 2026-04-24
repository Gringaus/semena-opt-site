import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { ARCHIVE_API_URL } from '@/components/site/data';
import SiteLogo from '@/components/site/SiteLogo';
import useDocumentMeta from '@/hooks/useDocumentMeta';

interface ArchiveItem { slug: string; date: string; title: string; image?: string }

const ArchivePage = () => {
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [loading, setLoading] = useState(true);

  useDocumentMeta({
    title: 'Архив новостей',
    description: 'Архив поступлений, событий и новостей магазина «Семена Оптом». Все прошлые партии семян, отраслевые события и обновления компании в одном месте.',
    ogType: 'website',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Архив новостей — Семена Оптом',
      description: 'Архив поступлений, событий и новостей магазина «Семена Оптом».',
      inLanguage: 'ru-RU',
    },
    jsonLdId: 'archive-page-jsonld',
  });

  useEffect(() => {
    let cancelled = false;
    fetch(ARCHIVE_API_URL)
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setItems(Array.isArray(d.items) ? d.items : []); })
      .catch(() => { if (!cancelled) setItems([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/60">
        <div className="container flex items-center justify-between h-14 sm:h-16 gap-3">
          <SiteLogo to="/" />
          <Link to="/">
            <Button variant="outline" className="rounded-full h-9 sm:h-10 px-3 sm:px-4 text-sm">
              <Icon name="ArrowLeft" size={16} />
              <span className="hidden sm:inline">На главную</span>
            </Button>
          </Link>
        </div>
      </header>

      <main className="container py-12 sm:py-20 lg:py-32">
        <div className="mb-8 sm:mb-12">
          <div className="text-xs uppercase tracking-[0.25em] text-[hsl(var(--earth))] mb-2 sm:mb-3">Архив</div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl leading-[0.95]">
            Архив <em className="text-[hsl(var(--earth))]">новостей</em>
          </h1>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg text-muted-foreground max-w-xl">
            Все прошлые поступления, события и обновления компании. Новые записи появляются еженедельно.
          </p>
        </div>

        {loading ? (
          <div className="py-16 text-center text-muted-foreground">
            <Icon name="Loader2" size={28} className="animate-spin mx-auto mb-3" />
            Загружаем архив...
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground border-y border-border/60">
            <Icon name="FileText" size={28} className="mx-auto mb-3 opacity-60" />
            В архиве пока нет записей.
          </div>
        ) : (
        <div className="divide-y divide-border/60 border-y border-border/60">
          {items.map((a, i) => (
            <Link
              key={i}
              to={`/archive/${a.slug}`}
              className="flex items-center justify-between gap-3 sm:gap-6 py-4 sm:py-5 group cursor-pointer sm:hover:pl-4 transition-all"
            >
              <div className="flex items-center gap-3 sm:gap-6 min-w-0 flex-1">
                {a.image ? (
                  <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 border border-border/60">
                    <img src={a.image} alt={a.title} loading="lazy" decoding="async" width={80} height={80} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl shrink-0 bg-muted grid place-items-center">
                    <Icon name="FileText" size={22} className="text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0">
                  <time className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-0.5 sm:mb-1 block">{a.date}</time>
                  <div className="font-display text-base sm:text-xl leading-tight line-clamp-2 sm:truncate">{a.title}</div>
                </div>
              </div>
              <Icon name="ArrowUpRight" size={18} className="opacity-40 group-hover:opacity-100 transition-opacity shrink-0" />
            </Link>
          ))}
        </div>
        )}
      </main>
    </div>
  );
};

export default ArchivePage;