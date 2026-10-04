// Builds public/sitemap.xml. Product URLs come from the backend (VITE_API_BASE_URL); when it is unreachable only the
// static pages are written so the build never fails.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const SITE = (process.env.VITE_SITE_URL ?? 'https://buy.cashmymobile.co.uk').replace(/\/$/, '');
const API = (process.env.VITE_API_BASE_URL ?? 'http://localhost:8010').replace(/\/$/, '');
const today = new Date().toISOString().slice(0, 10);

let slugs = [];
try {
  const res = await fetch(`${API}/api/buy/products/menu`, { signal: AbortSignal.timeout(8000) });
  if (res.ok) slugs = (await res.json()).map((p) => p.slug);
  else console.warn(`sitemap: API responded ${res.status}; writing static pages only`);
} catch (e) {
  console.warn(`sitemap: could not reach ${API} (${e.message}); writing static pages only`);
}

const staticPages = [
  ['/', '1.0', 'daily'],
  ['/shop', '0.9', 'daily'],
  ['/shop?brand=Apple', '0.8', 'daily'],
  ['/shop?brand=Samsung', '0.8', 'daily'],
  ['/how-it-works', '0.6', 'monthly'],
  ['/faq', '0.5', 'monthly'],
  ['/contact', '0.4', 'monthly'],
];
const url = (loc, priority, freq) => `  <url><loc>${SITE}${loc.replace(/&/g, '&amp;')}</loc><lastmod>${today}</lastmod><changefreq>${freq}</changefreq><priority>${priority}</priority></url>`;
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[
  ...staticPages.map(([l, p, f]) => url(l, p, f)),
  ...slugs.map((s) => url(`/phones/${s}`, '0.7', 'weekly')),
].join('\n')}\n</urlset>\n`;
writeFileSync(join(root, 'public/sitemap.xml'), xml);
console.log(`sitemap.xml: ${staticPages.length + slugs.length} urls`);
