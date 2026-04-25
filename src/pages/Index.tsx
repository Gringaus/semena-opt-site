import { useEffect, useRef, useState } from 'react';
import { Toaster } from '@/components/ui/toaster';
import HeaderHero from '@/components/site/HeaderHero';
import ContentSections from '@/components/site/ContentSections';
import ContactsFooter from '@/components/site/ContactsFooter';
import { nav, catalog as fallbackCatalog, CATALOG_API_URL } from '@/components/site/data';
import useDocumentMeta from '@/hooks/useDocumentMeta';

type CatalogEntry = { name: string; count?: number; img?: string; items?: string[] | string };

const Index = () => {
  const [active, setActive] = useState('news');
  const [catalogData, setCatalogData] = useState<CatalogEntry[]>(fallbackCatalog);
  const lockUntilRef = useRef(0);

  useEffect(() => {
    fetch(CATALOG_API_URL)
      .then((r) => r.json())
      .then((d) => {
        if (d?.items?.length) setCatalogData(d.items);
      })
      .catch(() => {});
  }, []);

  useDocumentMeta({
    title: '',
    description: 'Оптовый магазин семян в Иваново: овощные, цветочные и полевые культуры. Более 560 сортов, прямые контракты с селекционными станциями, всхожесть 97%. Доставка по России. Заявки на сезон 2026.',
    ogType: 'website',
    jsonLdId: 'home-jsonld',
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Главная', item: 'https://semena37.pro/' },
          ],
        },
        {
          '@type': 'ItemList',
          '@id': 'https://semena37.pro/#catalog',
          name: 'Каталог семян оптом',
          description: 'Информационный каталог категорий семян: овощные, зерновые, масличные, цветочные и декоративные культуры.',
          numberOfItems: catalogData.length,
          itemListElement: catalogData.map((c, idx) => {
            const items = Array.isArray(c.items)
              ? c.items
              : typeof c.items === 'string'
              ? c.items.split(',').map((s) => s.trim()).filter(Boolean)
              : [];
            const sortsText = items.length ? `Сорта: ${items.join(', ')}.` : '';
            const countText = c.count ? `${c.count} сортов в ассортименте. ` : '';
            return {
              '@type': 'ListItem',
              position: idx + 1,
              item: {
                '@type': 'Product',
                '@id': `https://semena37.pro/#catalog-${idx + 1}`,
                name: c.name,
                category: c.name,
                description: `${countText}${sortsText}`.trim() || c.name,
                image: c.img,
                brand: { '@type': 'Brand', name: 'Семена Оптом' },
                url: 'https://semena37.pro/#catalog',
                offers: {
                  '@type': 'AggregateOffer',
                  availability: 'https://schema.org/InStock',
                  priceCurrency: 'RUB',
                  offerCount: c.count || items.length || 1,
                  seller: { '@id': 'https://semena37.pro/#organization' },
                  url: 'https://semena37.pro/#catalog',
                },
              },
            };
          }),
        },
      ],
    },
  });

  const getHeaderOffset = () => (window.innerWidth >= 640 ? 96 : 80);

  const scrollToSection = (id: string, smooth = true) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - getHeaderOffset();
    window.scrollTo({ top: Math.max(0, top), behavior: smooth ? 'smooth' : 'auto' });
  };

  const scroll = (id: string) => {
    setActive(id);
    const el = document.getElementById(id);
    if (!el) return;
    lockUntilRef.current = Date.now() + 1200;
    scrollToSection(id, true);
    if (history.replaceState) history.replaceState(null, '', `#${id}`);
  };

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (!hash || !nav.some((n) => n.id === hash)) return;
    lockUntilRef.current = Date.now() + 1500;
    setActive(hash);
    let attempts = 0;
    const tryScroll = () => {
      const el = document.getElementById(hash);
      if (el) {
        scrollToSection(hash, false);
        requestAnimationFrame(() => scrollToSection(hash, true));
        return;
      }
      if (attempts++ < 20) setTimeout(tryScroll, 80);
    };
    tryScroll();
  }, []);

  useEffect(() => {
    const ids = nav.map((n) => n.id);

    const update = () => {
      if (Date.now() < lockUntilRef.current) return;
      const line = window.innerHeight * 0.3;
      let currentId = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top - line <= 0) currentId = id;
      }
      setActive((prev) => (prev === currentId ? prev : currentId));
    };

    update();
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        update();
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeaderHero active={active} scroll={scroll} />
      <ContentSections />
      <ContactsFooter />
      <Toaster />
    </div>
  );
};

export default Index;