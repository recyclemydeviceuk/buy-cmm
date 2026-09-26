// Builds public/sitemap.xml from the catalogue so every product page is discoverable.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const SITE = (process.env.VITE_SITE_URL ?? 'https://buy.cashmymobile.co.uk').replace(/\/$/, '');
const catalog = readFileSync(join(root, 'src/data/catalog.ts'), 'utf8');
const slugs = [...catalog.matchAll(/"slug":\s*"([^"]+)"/g)].map((m) => m[1]);
const today = new Date().toISOString().slice(0, 10);

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
