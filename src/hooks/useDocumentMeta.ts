import { useEffect } from 'react';

interface Meta {
  title?: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  /** Если передан — выведется <script type="application/ld+json"> с этим id. Передай null чтобы снять. */
  jsonLd?: Record<string, unknown> | null;
  jsonLdId?: string;
  robots?: string;
}

const DEFAULT_TITLE = 'Семена Оптом — оптовый поставщик семян в Иваново | 560+ сортов';
const DEFAULT_DESCRIPTION = 'Оптовый магазин семян в Иваново: овощные, цветочные и полевые культуры. Более 560 сортов, прямые контракты с селекционными станциями, всхожесть 97%. Доставка по Иваново и области.';

function ensureMeta(selector: string, create: () => HTMLElement): HTMLElement {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  return el;
}

function setMetaByName(name: string, content: string) {
  const el = ensureMeta(`meta[name="${name}"]`, () => {
    const m = document.createElement('meta');
    m.setAttribute('name', name);
    return m;
  });
  el.setAttribute('content', content);
}

function setMetaByProperty(property: string, content: string) {
  const el = ensureMeta(`meta[property="${property}"]`, () => {
    const m = document.createElement('meta');
    m.setAttribute('property', property);
    return m;
  });
  el.setAttribute('content', content);
}

function setCanonical(href: string) {
  const el = ensureMeta('link[rel="canonical"]', () => {
    const l = document.createElement('link');
    l.setAttribute('rel', 'canonical');
    return l;
  });
  el.setAttribute('href', href);
}

function setJsonLd(id: string, data: Record<string, unknown> | null) {
  const existing = document.getElementById(id);
  if (!data) {
    existing?.remove();
    return;
  }
  const script = (existing as HTMLScriptElement) || document.createElement('script');
  script.type = 'application/ld+json';
  script.id = id;
  script.textContent = JSON.stringify(data);
  if (!existing) document.head.appendChild(script);
}

export function useDocumentMeta(meta: Meta) {
  useEffect(() => {
    const title = meta.title && meta.title.trim() ? `${meta.title} — Семена Оптом` : DEFAULT_TITLE;
    document.title = title;

    const description = meta.description || DEFAULT_DESCRIPTION;
    setMetaByName('description', description);

    if (meta.robots) setMetaByName('robots', meta.robots);

    const canonicalHref = meta.canonical || (typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '');
    if (canonicalHref) setCanonical(canonicalHref);

    setMetaByProperty('og:title', meta.ogTitle || title);
    setMetaByProperty('og:description', meta.ogDescription || description);
    setMetaByProperty('og:url', canonicalHref);
    setMetaByProperty('og:type', meta.ogType || 'website');
    if (meta.ogImage) setMetaByProperty('og:image', meta.ogImage);

    setMetaByName('twitter:title', meta.ogTitle || title);
    setMetaByName('twitter:description', meta.ogDescription || description);
    if (meta.ogImage) setMetaByName('twitter:image', meta.ogImage);

    const jsonLdId = meta.jsonLdId || 'page-jsonld';
    if (meta.jsonLd !== undefined) {
      setJsonLd(jsonLdId, meta.jsonLd);
    }

    return () => {
      if (meta.jsonLd !== undefined) setJsonLd(jsonLdId, null);
    };
  }, [meta.title, meta.description, meta.canonical, meta.ogTitle, meta.ogDescription, meta.ogImage, meta.ogType, meta.robots, meta.jsonLdId, JSON.stringify(meta.jsonLd)]);
}

export default useDocumentMeta;