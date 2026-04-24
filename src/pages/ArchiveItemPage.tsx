import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { ARCHIVE_API_URL, CONTACT_API_URL } from '@/components/site/data';
import SiteLogo from '@/components/site/SiteLogo';
import AdaptiveImage from '@/components/site/AdaptiveImage';
import PhoneInput from '@/components/site/PhoneInput';
import useDocumentMeta from '@/hooks/useDocumentMeta';

interface ArchiveItem { slug: string; date: string; title: string; content?: string[]; image?: string; images?: string[] }

const ArchiveItemPage = () => {
  const { slug } = useParams();
  const [archive, setArchive] = useState<ArchiveItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [requestOpen, setRequestOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [sending, setSending] = useState(false);
  const [agree, setAgree] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(ARCHIVE_API_URL)
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setArchive(Array.isArray(d.items) ? d.items : []); })
      .catch(() => { if (!cancelled) setArchive([]); })
      .finally(() => { if (!cancelled) setLoaded(true); });
    return () => { cancelled = true; };
  }, []);

  const item = archive.find((a) => a.slug === slug);
  const gallery = item?.images || [];
  const description = item?.content?.[0]?.slice(0, 180) || 'Запись из архива магазина «Семена Оптом».';

  useDocumentMeta({
    title: item ? item.title : 'Запись не найдена',
    description,
    ogType: 'article',
    ogImage: item?.image,
    robots: item ? 'index, follow' : 'noindex, follow',
    jsonLd: item ? {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: item.title,
      description,
      image: item.image ? [item.image] : undefined,
      datePublished: item.date,
      inLanguage: 'ru-RU',
      publisher: {
        '@type': 'Organization',
        name: 'Семена Оптом',
        url: 'https://semena37.ru',
      },
    } : null,
    jsonLdId: 'archive-article-jsonld',
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (lightboxIdx === null) return;
      if (e.key === 'Escape') setLightboxIdx(null);
      if (e.key === 'ArrowRight') setLightboxIdx((i) => i === null ? null : (i + 1) % gallery.length);
      if (e.key === 'ArrowLeft') setLightboxIdx((i) => i === null ? null : (i - 1 + gallery.length) % gallery.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIdx, gallery.length]);

  const closeRequest = () => {
    setRequestOpen(false);
    setForm({ name: '', phone: '', email: '' });
    setAgree(false);
  };

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    if (!form.name || !form.phone || !form.email) {
      toast({ title: 'Заполните все поля', variant: 'destructive' });
      return;
    }
    if (!agree) {
      toast({ title: 'Примите политику конфиденциальности', variant: 'destructive' });
      return;
    }
    if (!CONTACT_API_URL) {
      toast({ title: 'Форма временно недоступна', description: 'Пожалуйста, свяжитесь по телефону.' });
      return;
    }
    setSending(true);
    try {
      const res = await fetch(CONTACT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          message: `Запрос прайс-листа со страницы архива: ${item.title}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка отправки');
      toast({ title: 'Заявка отправлена', description: 'Пришлём прайс-лист и свяжемся в ближайшее время.' });
      closeRequest();
    } catch (err) {
      toast({ title: 'Не удалось отправить', description: err instanceof Error ? err.message : 'Попробуйте позже', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/60">
        <div className="container flex items-center justify-between h-14 sm:h-16 gap-3">
          <SiteLogo to="/" />
          <Link to="/archive">
            <Button variant="outline" className="rounded-full h-9 sm:h-10 px-3 sm:px-4 text-sm">
              <Icon name="ArrowLeft" size={16} />
              <span className="hidden xs:inline sm:inline">В архив</span>
            </Button>
          </Link>
        </div>
      </header>

      {!loaded ? (
        <section className="container py-16 sm:py-24 lg:py-32 text-center text-muted-foreground">
          <Icon name="Loader2" size={32} className="animate-spin mx-auto mb-4" />
          Загружаем запись...
        </section>
      ) : !item ? (
        <section className="container py-16 sm:py-24 lg:py-32 text-center">
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl mb-4 sm:mb-6">Запись не найдена</h1>
          <p className="text-muted-foreground mb-6 sm:mb-8">Возможно, запись была удалена или перемещена.</p>
          <Link to="/archive">
            <Button size="lg" className="rounded-full bg-[hsl(var(--forest))] hover:bg-[hsl(var(--forest))]/90 text-[hsl(var(--cream))] h-12 sm:h-14 px-6 sm:px-8">
              Вернуться в архив
            </Button>
          </Link>
        </section>
      ) : (
        <div className="container py-10 sm:py-16 lg:py-24">
          <nav aria-label="Хлебные крошки" className="mb-6 sm:mb-8 text-sm">
            <ol className="flex items-center flex-wrap gap-1.5 text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-foreground transition-colors">Главная</Link>
              </li>
              <li aria-hidden="true"><Icon name="ChevronRight" size={14} className="opacity-60" /></li>
              <li>
                <Link to="/archive" className="hover:text-foreground transition-colors">Архив</Link>
              </li>
              <li aria-hidden="true"><Icon name="ChevronRight" size={14} className="opacity-60" /></li>
              <li className="text-foreground font-medium line-clamp-1 max-w-[16ch] sm:max-w-[32ch]" aria-current="page">{item.title}</li>
            </ol>
          </nav>
          <Link to="/archive" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 sm:mb-10 transition-colors">
            <Icon name="ArrowLeft" size={16} />
            Ко всем записям архива
          </Link>

          <div className="grid lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12">
            <article className="lg:col-span-8">
              <div className="flex items-center flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
                <Badge className="rounded-full border-0 bg-[hsl(var(--earth))]/20 text-[hsl(var(--earth))]">
                  Архив
                </Badge>
                <time className="text-xs uppercase tracking-wider text-muted-foreground">{item.date}</time>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-6xl leading-[1.05] lg:leading-[1] mb-6 sm:mb-10">{item.title}</h1>

              {item.image && (
                <AdaptiveImage
                  src={item.image}
                  alt={item.title}
                  mode="fit"
                  maxHeightClass="max-h-[75vh]"
                  wrapperClassName="rounded-2xl sm:rounded-3xl mb-6 sm:mb-10"
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                />
              )}

              <div className="space-y-4 sm:space-y-6">
                {item.content?.map((p, i) => (
                  <p key={i} className="text-base sm:text-lg leading-relaxed">{p}</p>
                ))}
              </div>

              {gallery.length > 0 && (
                <div className="mt-8 sm:mt-12">
                  <div className="text-xs uppercase tracking-[0.25em] text-[hsl(var(--earth))] mb-3 sm:mb-4">Фотогалерея</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                    {gallery.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setLightboxIdx(i)}
                        className="aspect-square rounded-xl sm:rounded-2xl overflow-hidden group relative"
                      >
                        <AdaptiveImage
                          src={img}
                          alt={`${item.title} — фото ${i + 1}`}
                          mode="cover-smart"
                          loading="lazy"
                          decoding="async"
                          width={400}
                          height={400}
                          className="group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-[hsl(var(--forest))]/0 group-hover:bg-[hsl(var(--forest))]/30 transition-colors grid place-items-center">
                          <Icon name="Maximize2" size={24} className="text-[hsl(var(--cream))] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-10 sm:mt-16 pt-6 sm:pt-10 border-t border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Остались вопросы?</div>
                  <div className="font-display text-xl sm:text-2xl">Запросите прайс-лист</div>
                </div>
                <Button
                  size="lg"
                  onClick={() => setRequestOpen(true)}
                  className="w-full sm:w-auto rounded-full bg-[hsl(var(--forest))] hover:bg-[hsl(var(--forest))]/90 text-[hsl(var(--cream))] h-12 sm:h-14 px-6 sm:px-8"
                >
                  Оставить заявку
                  <Icon name="ArrowRight" size={18} />
                </Button>
              </div>
            </article>

            <aside className="lg:col-span-4">
              <div className="lg:sticky lg:top-24 bg-card border border-border/60 rounded-2xl sm:rounded-3xl p-5 sm:p-7">
                <div className="text-xs uppercase tracking-[0.25em] text-[hsl(var(--earth))] mb-2 sm:mb-3">Ещё из архива</div>
                <h3 className="font-display text-xl sm:text-2xl mb-4 sm:mb-6">Другие записи</h3>
                <div className="divide-y divide-border/60">
                  {archive
                    .filter((a) => a.slug !== item.slug)
                    .map((a) => (
                      <Link
                        key={a.slug}
                        to={`/archive/${a.slug}`}
                        className="flex gap-3 py-4 group first:pt-0 last:pb-0"
                      >
                        {a.image && (
                          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-border/60">
                            <img src={a.image} alt={a.title} loading="lazy" decoding="async" width={56} height={56} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{a.date}</div>
                          <div className="font-display text-sm leading-snug group-hover:text-[hsl(var(--forest))] transition-colors">
                            {a.title}
                          </div>
                        </div>
                        <Icon name="ArrowUpRight" size={14} className="opacity-40 group-hover:opacity-100 transition-opacity mt-1 shrink-0" />
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

      <Dialog open={requestOpen} onOpenChange={(o) => { if (!o && !sending) closeRequest(); }}>
        <DialogContent className="rounded-2xl sm:rounded-3xl w-[calc(100vw-1.5rem)] max-w-md p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl sm:text-3xl">Запрос прайс-листа</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitRequest} className="space-y-3 pt-2">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">Имя</label>
              <Input autoFocus autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ваше имя" className="h-11 rounded-xl" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">Телефон</label>
              <PhoneInput value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} className="h-11 rounded-xl" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">Email</label>
              <Input type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@company.ru" className="h-11 rounded-xl" />
            </div>
            <Textarea
              value={item ? `Запрос прайс-листа со страницы архива: ${item.title}` : ''}
              readOnly
              rows={2}
              className="rounded-xl bg-muted/50 resize-none"
            />
            <label className="flex items-start gap-3 cursor-pointer pt-1">
              <Checkbox checked={agree} onCheckedChange={(v) => setAgree(!!v)} className="mt-0.5" />
              <span className="text-xs text-muted-foreground">
                Я согласен с <Link to="/privacy" target="_blank" className="underline hover:text-foreground">политикой конфиденциальности</Link> и даю согласие на обработку персональных данных.
              </span>
            </label>
            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" onClick={closeRequest} className="rounded-full h-11 px-5 border-foreground/20">
                Отмена
              </Button>
              <Button type="submit" disabled={sending || !agree} className="flex-1 rounded-full h-11 bg-[hsl(var(--forest))] hover:bg-[hsl(var(--forest))]/90 text-[hsl(var(--cream))]">
                {sending ? 'Отправляем...' : 'Отправить заявку'}
                <Icon name="Send" size={14} />
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {lightboxIdx !== null && gallery[lightboxIdx] && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm grid place-items-center p-4"
          onClick={() => setLightboxIdx(null)}
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setLightboxIdx(null); }}
            className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center text-white transition-colors"
          >
            <Icon name="X" size={24} />
          </button>
          {gallery.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => i === null ? null : (i - 1 + gallery.length) % gallery.length); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center text-white transition-colors"
              >
                <Icon name="ChevronLeft" size={24} />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => i === null ? null : (i + 1) % gallery.length); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center text-white transition-colors"
              >
                <Icon name="ChevronRight" size={24} />
              </button>
            </>
          )}
          <img
            src={gallery[lightboxIdx]}
            alt={`фото ${lightboxIdx + 1}`}
            className="max-w-full max-h-[90vh] object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
          {gallery.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 text-white text-sm">
              {lightboxIdx + 1} / {gallery.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ArchiveItemPage;