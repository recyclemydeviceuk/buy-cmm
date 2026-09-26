import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const SITE_NAME = 'CashMyMobile';
export const SITE_URL = ((import.meta.env.VITE_SITE_URL as string | undefined) ?? 'https://buy.cashmymobile.co.uk').replace(/\/$/, '');
export const DEFAULT_DESCRIPTION = 'Buy certified pre-owned iPhone and Samsung Galaxy phones in the UK. 40-point tested, graded by hand, 12-month warranty, free next-day delivery and 30-day returns.';
export const DEFAULT_IMAGE = `${SITE_URL}/og-default.png`;

export interface SeoProps {
  title?: string;
  description?: string;
  /** Path (e.g. "/shop") or absolute URL. Defaults to the current path without query string. */
  canonical?: string;
  image?: string;
  type?: 'website' | 'product' | 'article';
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string | undefined) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!content) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string | undefined) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!href) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * Per-page SEO for the SPA: title, description, canonical, robots, Open Graph, Twitter card and JSON-LD.
 * Tags are keyed so re-renders update in place; JSON-LD is replaced per page.
 */
export function useSeo({ title, description = DEFAULT_DESCRIPTION, canonical, image = DEFAULT_IMAGE, type = 'website', noindex = false, jsonLd }: SeoProps = {}) {
  const { pathname } = useLocation();
  const fullTitle = title ? `${title} · ${SITE_NAME}` : `${SITE_NAME} · Buy iPhone and Samsung Galaxy phones`;
  const url = canonical ? (canonical.startsWith('http') ? canonical : `${SITE_URL}${canonical}`) : `${SITE_URL}${pathname === '/' ? '' : pathname}`;
  const ld = JSON.stringify(jsonLd ?? null);

  useEffect(() => {
    document.title = fullTitle;
    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');
    upsertLink('canonical', url);
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:type', type === 'product' ? 'product' : type);
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:image', image.startsWith('http') ? image : `${SITE_URL}${image}`);
    upsertMeta('property', 'og:locale', 'en_GB');
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', image.startsWith('http') ? image : `${SITE_URL}${image}`);

    document.head.querySelectorAll('script[data-seo-jsonld="page"]').forEach((n) => n.remove());
    if (jsonLd) {
      const s = document.createElement('script');
      s.type = 'application/ld+json';
      s.dataset.seoJsonld = 'page';
      s.text = JSON.stringify(jsonLd);
      document.head.appendChild(s);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullTitle, description, url, image, type, noindex, ld]);
}

export const ORGANIZATION_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'CashMyMobile Ltd',
  url: SITE_URL,
  logo: `${SITE_URL}/brand/cmm-logo.png`,
  sameAs: ['https://cashmymobile.co.uk'],
  contactPoint: [{ '@type': 'ContactPoint', contactType: 'customer support', email: 'support@cashmymobile.co.uk', areaServed: 'GB', availableLanguage: 'en' }],
};

export const WEBSITE_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/shop?search={search_term_string}` }, 'query-input': 'required name=search_term_string' },
};

export function breadcrumbLd(items: Array<[string, string]>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE_URL}${path}` })),
  };
}
