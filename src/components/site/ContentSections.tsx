import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import {
  news as newsFallback,
  catalog as catalogFallback,
  partners,
  NEWS_API_URL,
  CATALOG_API_URL,
  CONTACT_API_URL,
} from './data';
import { faqCategories } from './faq';
import AdaptiveImage from './AdaptiveImage';
import PhoneInput from './PhoneInput';
import { reachGoal, Goals } from '@/lib/metrika';

interface NewsApi { id?: number; slug: string; date: string; tag: string; title: string; text: string; content?: string[]; image?: string }
interface CatalogApi { id?: number; name: string; count: number; img: string; items: string[] }

const ContentSections = () => {
  const [news, setNews] = useState<NewsApi[]>(newsFallback);
  const [homeLimit, setHomeLimit] = useState<number>(3);
  const [catalog, setCatalog] = useState<CatalogApi[]>(catalogFallback);
  const [selectedCategory, setSelectedCategory] = useState<CatalogApi | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [sending, setSending] = useState(false);
  const [agree, setAgree] = useState(false);

  useEffect(() => {
    fetch(NEWS_API_URL)
      .then((r) => r.json())
      .then((d) => {
        if (d.items?.length) setNews(d.items);
        if (typeof d.homeLimit === 'number' && d.homeLimit > 0) setHomeLimit(d.homeLimit);
      })
      .catch(() => {});
    fetch(CATALOG_API_URL)
      .then((r) => r.json())
      .then((d) => { if (d.items?.length) setCatalog(d.items); })
      .catch(() => {});
  }, []);

  const closeDialog = () => {
    setSelectedCategory(null);
    setShowForm(false);
    setForm({ name: '', phone: '', email: '' });
    setAgree(false);
  };

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;
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
    reachGoal(Goals.PriceRequestSubmit, { source: 'catalog', category: selectedCategory.name });
    try {
      const res = await fetch(CONTACT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          message: `Запрос прайс-листа: ${selectedCategory.name}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка отправки');
      reachGoal(Goals.PriceRequestSuccess, { source: 'catalog', category: selectedCategory.name });
      toast({ title: 'Заявка отправлена', description: 'Пришлём прайс-лист и свяжемся с вами в ближайшее время.' });
      closeDialog();
    } catch (err) {
      toast({ title: 'Не удалось отправить', description: err instanceof Error ? err.message : 'Попробуйте позже', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <section id="news" className="container py-14 sm:py-20 lg:py-32 scroll-mt-20 sm:scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 sm:mb-12">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-[hsl(var(--earth))] mb-2 sm:mb-3">01 — Новости</div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-6xl">Новости и поступления</h2>
          </div>
          <div className="hidden md:block text-sm text-muted-foreground max-w-xs">
            Свежие партии, изменения в наличии и отраслевые события — обновляем еженедельно.
          </div>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {news.slice(0, homeLimit).map((n, i) => (
            <Link key={i} to={`/news/${n.slug}`} className="block h-full">
              <Card className="rounded-2xl sm:rounded-3xl border-border/60 hover:shadow-xl transition-all hover:-translate-y-1 bg-card group cursor-pointer h-full overflow-hidden flex flex-col">
                {n.image && (
                  <div className="aspect-[16/10] overflow-hidden">
                    <AdaptiveImage
                      src={n.image}
                      alt={n.title}
                      mode="cover-smart"
                      loading="lazy"
                      decoding="async"
                      width={600}
                      height={375}
                      className="group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                )}
                <div className="p-5 sm:p-7 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
                    <Badge className={`rounded-full border-0 ${n.tag === 'Поступление' ? 'bg-[hsl(var(--lime))]/30 text-[hsl(var(--forest))]' : 'bg-[hsl(var(--earth))]/20 text-[hsl(var(--earth))]'}`}>
                      {n.tag}
                    </Badge>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">{n.date}</span>
                  </div>
                  <h3 className="font-display text-xl sm:text-2xl leading-tight mb-3">{n.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5 sm:mb-6 flex-1">{n.text}</p>
                  <div className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--forest))] group-hover:gap-3 transition-all">
                    Читать полностью <Icon name="ArrowUpRight" size={16} />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-10 sm:mt-16 flex justify-center">
          <Link to="/archive">
            <Button size="lg" variant="outline" className="rounded-full h-12 sm:h-14 px-6 sm:px-8 border-foreground/20 text-sm sm:text-base">
              Архив новостей
              <Icon name="ArrowRight" size={18} />
            </Button>
          </Link>
        </div>
      </section>

      <section id="catalog" className="bg-[hsl(var(--forest))] text-[hsl(var(--cream))] py-14 sm:py-20 lg:py-32 rounded-t-[2rem] sm:rounded-t-[3rem] scroll-mt-20 sm:scroll-mt-24">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 sm:mb-12">
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-[hsl(var(--lime))] mb-2 sm:mb-3">02 — Каталог</div>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-6xl">Информационный каталог продукции</h2>
            </div>
            <div className="hidden md:block text-sm opacity-70 max-w-xs"></div>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {catalog.map((c, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedCategory(c)}
                className="text-left"
              >
                <Card className="overflow-hidden rounded-2xl sm:rounded-3xl bg-[hsl(var(--cream))] border-0 text-foreground group cursor-pointer h-full hover:shadow-2xl hover:-translate-y-1 transition-all">
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <AdaptiveImage
                      src={c.img}
                      alt={c.name}
                      mode="cover-smart"
                      loading="lazy"
                      decoding="async"
                      width={600}
                      height={450}
                      className="group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-[hsl(var(--forest))]/0 group-hover:bg-[hsl(var(--forest))]/20 transition-colors grid place-items-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-[hsl(var(--cream))] text-[hsl(var(--forest))] px-5 py-2 rounded-full text-sm font-medium inline-flex items-center gap-2">
                        Подробнее <Icon name="ArrowUpRight" size={16} />
                      </div>
                    </div>
                  </div>
                  <div className="p-5 sm:p-7">
                    <div className="flex items-baseline justify-between mb-3 sm:mb-4 gap-3">
                      <h3 className="font-display text-xl sm:text-2xl">{c.name}</h3>
                      <span className="font-display text-2xl sm:text-3xl text-[hsl(var(--earth))]">{c.count}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {c.items.map((it) => (
                        <span key={it} className="text-xs px-2.5 sm:px-3 py-1 rounded-full bg-muted">{it}</span>
                      ))}
                    </div>
                  </div>
                </Card>
              </button>
            ))}
          </div>
        </div>
      </section>

      <Dialog open={!!selectedCategory} onOpenChange={(o) => { if (!o) closeDialog(); }}>
        <DialogContent className="rounded-2xl sm:rounded-3xl w-[calc(100vw-1.5rem)] max-w-lg p-0 overflow-hidden max-h-[92vh] overflow-y-auto">
          {selectedCategory && (
            <>
              <div className="aspect-[16/9] overflow-hidden">
                <img src={selectedCategory.img} alt={selectedCategory.name} loading="lazy" decoding="async" width={800} height={450} className="w-full h-full object-cover" />
              </div>
              <div className="p-5 sm:p-6 space-y-4 sm:space-y-5">
                <DialogHeader>
                  <DialogTitle className="font-display text-2xl sm:text-3xl flex flex-wrap items-baseline justify-between gap-2 sm:gap-4">
                    <span>{selectedCategory.name}</span>
                    <span className="text-lg sm:text-2xl text-[hsl(var(--earth))]">{selectedCategory.count} сортов</span>
                  </DialogTitle>
                </DialogHeader>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Представленные культуры</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedCategory.items.map((it) => (
                      <span key={it} className="text-xs px-3 py-1 rounded-full bg-muted">{it}</span>
                    ))}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-[hsl(var(--lime))]/20 border border-[hsl(var(--lime))]/40 flex items-start gap-3">
                  <Icon name="Info" size={18} className="text-[hsl(var(--forest))] mt-0.5 shrink-0" />
                  <div className="text-sm">Оставьте заявку — пришлём прайс-лист с актуальными ценами и поможем подобрать сорта под ваш регион.</div>
                </div>

                {!showForm ? (
                  <div className="flex flex-col sm:flex-row gap-3 pt-1">
                    <Button
                      onClick={() => { reachGoal(Goals.PriceRequestOpen, { source: 'catalog', category: selectedCategory.name }); setShowForm(true); }}
                      className="flex-1 rounded-full bg-[hsl(var(--forest))] hover:bg-[hsl(var(--forest))]/90 text-[hsl(var(--cream))] h-12"
                    >
                      <Icon name="FileText" size={16} />
                      Запросить прайс-лист
                    </Button>
                    <a
                      href="tel:+79206738383"
                      onClick={() => reachGoal(Goals.PhoneClick, { phone: '+79206738383', source: 'catalog_dialog' })}
                      className="flex-1"
                    >
                      <Button variant="outline" className="w-full rounded-full h-12 border-foreground/20">
                        <Icon name="Phone" size={16} />
                        Связаться с менеджером
                      </Button>
                    </a>
                  </div>
                ) : (
                  <form onSubmit={submitRequest} className="space-y-3 pt-1">
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
                      value={`Запрос прайс-листа: ${selectedCategory.name}`}
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
                      <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="rounded-full h-11 px-5 border-foreground/20">
                        Назад
                      </Button>
                      <Button type="submit" disabled={sending || !agree} className="flex-1 rounded-full h-11 bg-[hsl(var(--forest))] hover:bg-[hsl(var(--forest))]/90 text-[hsl(var(--cream))]">
                        {sending ? 'Отправляем...' : 'Отправить заявку'}
                        <Icon name="Send" size={14} />
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <section id="faq" className="container py-14 sm:py-20 lg:py-32 scroll-mt-20 sm:scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 sm:mb-12">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-[hsl(var(--earth))] mb-2 sm:mb-3">04 — FAQ</div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-6xl">Вопросы и ответы</h2>
          </div>
          <div className="hidden md:block text-sm text-muted-foreground max-w-xs">
            Подобрали ответы на вопросы, которые нам задают чаще всего — по огурцам, томатам и зелени.
          </div>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {faqCategories.map((cat) => (
            <Link key={cat.id} to="/faq" className="block h-full">
              <Card className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl border-border/60 bg-card hover:bg-[hsl(var(--forest))] hover:text-[hsl(var(--cream))] transition-all cursor-pointer group h-full">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[hsl(var(--lime))]/30 grid place-items-center mb-4 sm:mb-6 group-hover:bg-[hsl(var(--lime))]/20">
                  <Icon name={cat.icon} size={24} className="text-[hsl(var(--forest))] group-hover:text-[hsl(var(--lime))]" />
                </div>
                <h3 className="font-display text-xl sm:text-2xl mb-2">{cat.title}</h3>
                <p className="text-sm opacity-70 mb-4 sm:mb-6">
                  {cat.items.length} {cat.items.length === 1 ? 'вопрос' : cat.items.length < 5 ? 'вопроса' : 'вопросов'} с подробными ответами
                </p>
                <div className="flex items-center gap-2 text-sm font-medium group-hover:gap-3 transition-all">
                  Читать ответы <Icon name="ArrowUpRight" size={16} />
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="flex justify-center">
          <Link to="/faq">
            <Button size="lg" variant="outline" className="rounded-full h-12 sm:h-14 px-6 sm:px-8 border-foreground/20 text-sm sm:text-base">
              Все вопросы и ответы
              <Icon name="ArrowRight" size={18} />
            </Button>
          </Link>
        </div>
      </section>

      <section id="partners" className="container pb-14 sm:pb-20 lg:pb-32 scroll-mt-20 sm:scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 sm:mb-12">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-[hsl(var(--earth))] mb-2 sm:mb-3">05 — Партнёрство</div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-6xl">Наши партнёры</h2>
          </div>
          <div className="hidden md:block text-sm text-muted-foreground max-w-xs">
            Работаем напрямую с селекционными станциями и проверенными производителями семян.
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-border/60 rounded-2xl sm:rounded-3xl overflow-hidden border border-border/60">
          {partners.map((p, i) => (
            <div
              key={i}
              className="bg-card px-4 sm:px-6 py-5 sm:py-8 flex items-center gap-3 sm:gap-4 min-h-[90px] sm:min-h-[110px]"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden shrink-0 border border-border/60 bg-[hsl(var(--cream))]">
                <img src={p.logo} alt={p.name} loading="lazy" decoding="async" width={48} height={48} className="w-full h-full object-cover" />
              </div>
              <div className="font-display text-base sm:text-lg leading-tight">{p.name}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="about" className="container pb-14 sm:pb-20 lg:pb-32 scroll-mt-20 sm:scroll-mt-24">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div className="aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5] rounded-2xl sm:rounded-[2rem] overflow-hidden">
            <img src="https://cdn.poehali.dev/projects/6e30ca34-8fe1-4535-8d16-622fe38c58fb/files/576adcb1-4f20-4559-a90a-4201de6ac62a.jpg" alt="Склад" loading="lazy" decoding="async" width={800} height={1000} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-[hsl(var(--earth))] mb-2 sm:mb-3">05 — О нас</div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-6xl leading-[0.95] mb-5 sm:mb-8">
              20 лет <em className="text-[hsl(var(--earth))]">растём</em> <br />вместе с фермерами.
            </h2>
            <div className="space-y-4 sm:space-y-5 text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed mb-6 sm:mb-10">
              <p>
                Магазин «Семена оптом» предлагает широкий ассортимент продукции высокого качества для мелко оптовых и крупно оптовых покупателей. Всегда представлено большое разнообразие видов и сортов, которые будут радовать Вас богатым урожаем круглый год. В нашем магазине представлены товары по уходу за садом и огородом, различные средства защиты от вредителей и насекомых.
              </p>
              <p>
                Мы сотрудничаем с ведущими фирмами производителями, являясь их официальными представителями. Нашими партнёрами выступают такие крупные компании как: Урожай удачи, Цветущий сад, Ботаника, ЗТК Аэлита, Аэлита-агро, Русский огород, Евро-семена, Марс, Седек, Агроника (Плазменные семена).
              </p>
              <p>
                Для наших клиентов разработаны выгодные системы скидок. Мы используем индивидуальный подход к каждому клиенту. У нас всегда самые низкие цены! Быстрое оформление и формирование заказа, профессиональные менеджеры всегда готовы проконсультировать Вас.
              </p>
              <p>
                Также, есть возможность сделать заказ по телефону или отправить заявку на нашу почту. Осуществляем доставку по городу и области, а также в регионы по предварительной договорённости.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 sm:gap-8 border-t border-border/60 pt-5 sm:pt-8">
              <div>
                <div className="font-display text-3xl sm:text-4xl lg:text-5xl text-[hsl(var(--forest))]">20</div>
                <div className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mt-1.5 sm:mt-2">лет на рынке</div>
              </div>
              <div>
                <div className="font-display text-xl sm:text-2xl lg:text-4xl text-[hsl(var(--forest))] leading-tight">Центр<br />города</div>
                <div className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mt-1.5 sm:mt-2">склад</div>
              </div>
              <div>
                <div className="font-display text-3xl sm:text-4xl lg:text-5xl text-[hsl(var(--forest))]">4.2k</div>
                <div className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mt-1.5 sm:mt-2">отгрузок в год</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContentSections;