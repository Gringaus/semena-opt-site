import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const nav = [
  { id: 'news', label: 'Новости' },
  { id: 'catalog', label: 'Каталог' },
  { id: 'prices', label: 'Прайс-листы' },
  { id: 'materials', label: 'Материалы' },
  { id: 'partners', label: 'Партнёры' },
  { id: 'about', label: 'О магазине' },
  { id: 'contacts', label: 'Контакты' },
];

const news = [
  {
    date: '18 апреля',
    tag: 'Поступление',
    title: 'Новая партия семян подсолнечника «Лакомка»',
    text: 'Привезли 2 тонны свежего урожая 2026 года. Всхожесть 98%, калибровка по стандарту ГОСТ.',
  },
  {
    date: '12 апреля',
    tag: 'Новость',
    title: 'Открыт приём заказов на весенний сезон',
    text: 'Формируем опт на май–июнь: томаты, огурцы, зелень, цветы. Бронь со скидкой до 15%.',
  },
  {
    date: '03 апреля',
    tag: 'Поступление',
    title: 'Газонные травосмеси — 12 новых позиций',
    text: 'Спортивные, партерные и теневыносливые смеси в мешках по 20 кг. Наличие на складе.',
  },
];

const archive = [
  { date: 'Март 2026', title: 'Каталог цветочных семян обновлён — 340 сортов' },
  { date: 'Февраль 2026', title: 'Сертификация на органические семена получена' },
  { date: 'Январь 2026', title: 'Новый склад в Ростовской области — 800 м²' },
  { date: 'Декабрь 2025', title: 'Итоги года: 4 200 оптовых отгрузок' },
  { date: 'Ноябрь 2025', title: 'Партнёрство с агрохолдингом «Русское поле»' },
];

const catalog = [
  {
    name: 'Овощные культуры',
    count: 186,
    img: 'https://cdn.poehali.dev/projects/6e30ca34-8fe1-4535-8d16-622fe38c58fb/files/4c240e5e-747f-409a-9009-d91f9e9e64cb.jpg',
    items: ['Томаты', 'Огурцы', 'Перец', 'Капуста', 'Морковь'],
  },
  {
    name: 'Зерновые и масличные',
    count: 42,
    img: 'https://cdn.poehali.dev/projects/6e30ca34-8fe1-4535-8d16-622fe38c58fb/files/a1c310be-a37a-41df-bcbd-1078909d16ec.jpg',
    items: ['Подсолнечник', 'Кукуруза', 'Пшеница', 'Рапс'],
  },
  {
    name: 'Цветы и декоративные',
    count: 340,
    img: 'https://cdn.poehali.dev/projects/6e30ca34-8fe1-4535-8d16-622fe38c58fb/files/576adcb1-4f20-4559-a90a-4201de6ac62a.jpg',
    items: ['Петуния', 'Бархатцы', 'Астра', 'Циния', 'Космея'],
  },
];

const prices = [
  { name: 'Овощи и зелень — весна 2026', size: 'PDF, 1.2 МБ', date: '15.04.2026' },
  { name: 'Цветочные семена — полный каталог', size: 'PDF, 3.4 МБ', date: '02.04.2026' },
  { name: 'Газонные травы и травосмеси', size: 'PDF, 680 КБ', date: '28.03.2026' },
  { name: 'Зерновые и масличные культуры', size: 'XLSX, 420 КБ', date: '20.03.2026' },
];

const materials = [
  { icon: 'BookOpen', title: 'Агротехнический справочник', desc: 'Сроки посева, глубина, расход на гектар' },
  { icon: 'Sprout', title: 'Нормы высева по культурам', desc: 'Таблицы для разных регионов России' },
  { icon: 'FileText', title: 'Сертификаты качества', desc: 'ГОСТ, органик, сортовая чистота' },
  { icon: 'Leaf', title: 'Календарь садовода', desc: 'Что и когда сеять в открытый грунт' },
];

const partners = [
  { name: 'Русское Поле', type: 'Агрохолдинг', since: '2015' },
  { name: 'Поиск', type: 'Селекционная станция', since: '2011' },
  { name: 'Гавриш', type: 'Селекция и семеноводство', since: '2012' },
  { name: 'Аэлита', type: 'Производитель семян', since: '2014' },
  { name: 'СеДеК', type: 'Агрофирма', since: '2016' },
  { name: 'Биотехника', type: 'Научное объединение', since: '2018' },
  { name: 'Nunhems', type: 'Международный бренд', since: '2019' },
  { name: 'Rijk Zwaan', type: 'Селекционный дом', since: '2020' },
];

const Index = () => {
  const [active, setActive] = useState('news');

  const scroll = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/60">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-[hsl(var(--forest))] grid place-items-center">
              <Icon name="Sprout" size={20} className="text-[hsl(var(--lime))]" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-xl font-semibold">Семена Оптом</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">с 2009 года</div>
            </div>
          </div>
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
          <Button className="bg-[hsl(var(--earth))] hover:bg-[hsl(var(--earth))]/90 text-white rounded-full">
            <Icon name="Phone" size={16} />
            Связаться
          </Button>
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
              <div className="mt-10 flex flex-wrap gap-3">
                <Button size="lg" onClick={() => scroll('catalog')} className="rounded-full bg-[hsl(var(--forest))] hover:bg-[hsl(var(--forest))]/90 text-[hsl(var(--cream))] h-14 px-8">
                  Смотреть каталог
                  <Icon name="ArrowRight" size={18} />
                </Button>
                <Button size="lg" variant="outline" onClick={() => scroll('prices')} className="rounded-full h-14 px-8 border-foreground/20">
                  <Icon name="Download" size={18} />
                  Скачать прайс
                </Button>
              </div>
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
            <Card key={i} className="p-7 rounded-3xl border-border/60 hover:shadow-xl transition-all hover:-translate-y-1 bg-card group cursor-pointer">
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
          ))}
        </div>

        <div className="mt-20">
          <div className="flex items-baseline justify-between mb-8">
            <h3 className="font-display text-3xl">Архив новостей</h3>
            <Button variant="ghost" className="rounded-full">
              Все записи <Icon name="ArrowRight" size={16} />
            </Button>
          </div>
          <div className="divide-y divide-border/60 border-y border-border/60">
            {archive.map((a, i) => (
              <div key={i} className="flex items-center justify-between py-5 group cursor-pointer hover:pl-4 transition-all">
                <div className="flex items-baseline gap-8">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground w-32 shrink-0">{a.date}</div>
                  <div className="font-display text-xl">{a.title}</div>
                </div>
                <Icon name="ArrowUpRight" size={18} className="opacity-40 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border/60 rounded-3xl overflow-hidden border border-border/60">
          {partners.map((p, i) => (
            <div
              key={i}
              className="bg-card p-8 flex flex-col justify-between min-h-[180px] group hover:bg-[hsl(var(--forest))] hover:text-[hsl(var(--cream))] transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-[hsl(var(--lime))]/30 grid place-items-center group-hover:bg-[hsl(var(--lime))]/20">
                  <Icon name="Sprout" size={18} className="text-[hsl(var(--forest))] group-hover:text-[hsl(var(--lime))]" />
                </div>
                <span className="text-[10px] uppercase tracking-wider opacity-60">с {p.since}</span>
              </div>
              <div>
                <div className="font-display text-2xl leading-tight mb-1">{p.name}</div>
                <div className="text-xs opacity-70">{p.type}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 p-8 rounded-3xl bg-[hsl(var(--lime))]/20 border border-[hsl(var(--lime))]/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <Icon name="Handshake" size={28} className="text-[hsl(var(--forest))] shrink-0 mt-1" />
            <div>
              <div className="font-display text-2xl mb-1">Станьте нашим партнёром</div>
              <div className="text-sm text-muted-foreground max-w-xl">Открыты к сотрудничеству с селекционными станциями, агрохолдингами и оптовыми дистрибьюторами.</div>
            </div>
          </div>
          <Button className="rounded-full bg-[hsl(var(--forest))] hover:bg-[hsl(var(--forest))]/90 text-[hsl(var(--cream))] h-12 px-6 shrink-0">
            Предложить сотрудничество
            <Icon name="ArrowRight" size={16} />
          </Button>
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
            <p className="text-lg text-muted-foreground leading-relaxed mb-10">
              «Семена Оптом» — прямой поставщик для сельхозпредприятий, фермерских хозяйств и магазинов садовода. Работаем с отечественными селекционными станциями и проверенными зарубежными партнёрами. Своя лаборатория контроля качества, три склада в ЦФО и ЮФО, отгрузки от 10 кг.
            </p>
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

      <section id="contacts" className="bg-[hsl(var(--forest))] text-[hsl(var(--cream))] py-24 lg:py-32">
        <div className="container">
          <div className="text-xs uppercase tracking-[0.25em] text-[hsl(var(--lime))] mb-3">06 — Связь</div>
          <h2 className="font-display text-5xl lg:text-7xl mb-16 leading-[0.95]">
            Позвоните — <em>подберём</em> <br />сорта под ваш регион.
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: 'Phone', label: 'Телефон', value: '+7 (800) 555-72-19', sub: 'Пн–Сб, 9:00–19:00' },
              { icon: 'Mail', label: 'Почта', value: 'opt@semena-optom.ru', sub: 'Ответим в течение часа' },
              { icon: 'MapPin', label: 'Главный склад', value: 'Московская обл., Домодедово', sub: 'ул. Промышленная, 12' },
            ].map((c, i) => (
              <div key={i} className="border-t border-[hsl(var(--cream))]/20 pt-8">
                <Icon name={c.icon} size={24} className="text-[hsl(var(--lime))] mb-6" />
                <div className="text-xs uppercase tracking-wider opacity-60 mb-2">{c.label}</div>
                <div className="font-display text-3xl mb-1">{c.value}</div>
                <div className="text-sm opacity-70">{c.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="container py-10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
        <div>© 2026 Семена Оптом. Все права защищены.</div>
        <div className="flex gap-6">
          <span>ИНН 5074012345</span>
          <span className="hidden md:inline">·</span>
          <span>Политика конфиденциальности</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;