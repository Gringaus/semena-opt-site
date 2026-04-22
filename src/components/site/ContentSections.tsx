import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { news, catalog, prices, materials, partners } from './data';

const ContentSections = () => {
  return (
    <>
      <section id="news" className="container py-24 lg:py-32">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-[hsl(var(--earth))] mb-3">01 — Новости</div>
            <h2 className="font-display text-5xl lg:text-6xl">Новости и поступления</h2>
          </div>
          <div className="hidden md:block text-sm text-muted-foreground max-w-xs">
            Свежие партии, изменения в наличии и отраслевые события — обновляем еженедельно.
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {news.map((n, i) => (
            <Link key={i} to={`/news/${n.slug}`} className="block h-full">
              <Card className="p-7 rounded-3xl border-border/60 hover:shadow-xl transition-all hover:-translate-y-1 bg-card group cursor-pointer h-full">
                <div className="flex items-center justify-between mb-8">
                  <Badge className={`rounded-full border-0 ${n.tag === 'Поступление' ? 'bg-[hsl(var(--lime))]/30 text-[hsl(var(--forest))]' : 'bg-[hsl(var(--earth))]/20 text-[hsl(var(--earth))]'}`}>
                    {n.tag}
                  </Badge>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">{n.date}</span>
                </div>
                <h3 className="font-display text-2xl leading-tight mb-3">{n.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">{n.text}</p>
                <div className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--forest))] group-hover:gap-3 transition-all">
                  Читать полностью <Icon name="ArrowUpRight" size={16} />
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-16 flex justify-center">
          <Link to="/archive">
            <Button size="lg" variant="outline" className="rounded-full h-14 px-8 border-foreground/20">
              Архив новостей
              <Icon name="ArrowRight" size={18} />
            </Button>
          </Link>
        </div>
      </section>

      <section id="catalog" className="bg-[hsl(var(--forest))] text-[hsl(var(--cream))] py-24 lg:py-32 rounded-t-[3rem]">
        <div className="container">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-[hsl(var(--lime))] mb-3">02 — Каталог</div>
              <h2 className="font-display text-5xl lg:text-6xl">Информационный каталог продукции</h2>
            </div>
            <div className="hidden md:block text-sm opacity-70 max-w-xs">
              Три основные товарные группы. Внутри — сорта, характеристики, фото и описания.
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {catalog.map((c, i) => (
              <Card key={i} className="overflow-hidden rounded-3xl bg-[hsl(var(--cream))] border-0 text-foreground group cursor-pointer">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={c.img} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="p-7">
                  <div className="flex items-baseline justify-between mb-4">
                    <h3 className="font-display text-2xl">{c.name}</h3>
                    <span className="font-display text-3xl text-[hsl(var(--earth))]">{c.count}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {c.items.map((it) => (
                      <span key={it} className="text-xs px-3 py-1 rounded-full bg-muted">{it}</span>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="prices" className="container py-24 lg:py-32">
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <div className="text-xs uppercase tracking-[0.25em] text-[hsl(var(--earth))] mb-3">03 — Документы</div>
            <h2 className="font-display text-5xl lg:text-6xl leading-[0.95]">Прайс-<br />листы</h2>
            <p className="mt-6 text-muted-foreground">Актуальные цены в формате PDF и XLSX. Обновляются по мере поступления новых партий.</p>
            <div className="mt-8 p-6 rounded-2xl bg-[hsl(var(--lime))]/20 border border-[hsl(var(--lime))]/40">
              <div className="flex items-start gap-3">
                <Icon name="Info" size={20} className="text-[hsl(var(--forest))] mt-1 shrink-0" />
                <div className="text-sm">Для получения индивидуальных условий запросите персональный прайс у менеджера.</div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-8">
            <div className="space-y-3">
              {prices.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-6 rounded-2xl bg-card border border-border/60 hover:border-[hsl(var(--forest))] transition-colors group">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-xl bg-[hsl(var(--forest))] grid place-items-center shrink-0">
                      <Icon name="FileText" size={24} className="text-[hsl(var(--lime))]" />
                    </div>
                    <div>
                      <div className="font-display text-xl">{p.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{p.size} · обновлён {p.date}</div>
                    </div>
                  </div>
                  <Button size="sm" className="rounded-full bg-[hsl(var(--earth))] hover:bg-[hsl(var(--earth))]/90 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <Icon name="Download" size={16} />
                    Скачать
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="materials" className="container pb-24 lg:pb-32">
        <div className="text-xs uppercase tracking-[0.25em] text-[hsl(var(--earth))] mb-3">04 — База знаний</div>
        <h2 className="font-display text-5xl lg:text-6xl mb-12">Дополнительные материалы</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {materials.map((m, i) => (
            <Card key={i} className="p-7 rounded-3xl border-border/60 bg-card hover:bg-[hsl(var(--forest))] hover:text-[hsl(var(--cream))] transition-all cursor-pointer group h-full">
              <Icon name={m.icon} size={36} className="mb-8 text-[hsl(var(--earth))] group-hover:text-[hsl(var(--lime))]" />
              <h3 className="font-display text-2xl mb-2">{m.title}</h3>
              <p className="text-sm opacity-70">{m.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="partners" className="container pb-24 lg:pb-32">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-[hsl(var(--earth))] mb-3">05 — Партнёрство</div>
            <h2 className="font-display text-5xl lg:text-6xl">Наши партнёры</h2>
          </div>
          <div className="hidden md:block text-sm text-muted-foreground max-w-xs">
            Работаем напрямую с селекционными станциями и проверенными производителями семян.
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-border/60 rounded-3xl overflow-hidden border border-border/60">
          {partners.map((p, i) => (
            <div
              key={i}
              className="bg-card px-6 py-8 flex items-center gap-4 min-h-[110px]"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-border/60 bg-[hsl(var(--cream))]">
                <img src={p.logo} alt={p.name} className="w-full h-full object-cover" />
              </div>
              <div className="font-display text-lg leading-tight">{p.name}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="about" className="container pb-24 lg:pb-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="aspect-[4/5] rounded-[2rem] overflow-hidden">
            <img src="https://cdn.poehali.dev/projects/6e30ca34-8fe1-4535-8d16-622fe38c58fb/files/576adcb1-4f20-4559-a90a-4201de6ac62a.jpg" alt="Склад" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-[hsl(var(--earth))] mb-3">05 — О нас</div>
            <h2 className="font-display text-5xl lg:text-6xl leading-[0.95] mb-8">
              17 лет <em className="text-[hsl(var(--earth))]">растём</em> <br />вместе с фермерами.
            </h2>
            <div className="space-y-5 text-base lg:text-lg text-muted-foreground leading-relaxed mb-10">
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
            <div className="grid grid-cols-3 gap-8 border-t border-border/60 pt-8">
              <div>
                <div className="font-display text-5xl text-[hsl(var(--forest))]">17</div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mt-2">лет на рынке</div>
              </div>
              <div>
                <div className="font-display text-5xl text-[hsl(var(--forest))]">3</div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mt-2">склада</div>
              </div>
              <div>
                <div className="font-display text-5xl text-[hsl(var(--forest))]">4.2k</div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mt-2">отгрузок в год</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContentSections;