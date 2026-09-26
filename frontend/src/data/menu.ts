import { CATALOG } from './catalog';
import type { Product } from '../types';

export interface MenuItem {
  name: string;
  slug: string;
  image: string;
  fromPrice: number;
  releaseYear: number;
  reviewCount: number;
}
export interface MenuGroup {
  title: string;
  to: string; // "view all" link for the group
  items: MenuItem[];
}
export interface BrandMenu {
  key: 'Apple' | 'Samsung';
  label: string;
  tagline: string;
  to: string;
  image: string;
  groups: MenuGroup[];
  featured: { title: string; blurb: string; slug: string; image: string; fromPrice: number };
}

const toItem = (p: Product): MenuItem => ({ name: p.name, slug: p.slug, image: p.image, fromPrice: p.fromPrice, releaseYear: p.releaseYear, reviewCount: p.reviewCount });
const byNewest = (a: Product, b: Product) => b.releaseYear - a.releaseYear || b.rrp - a.rrp;
const apple = CATALOG.filter((p) => p.brand === 'Apple').sort(byNewest);
const samsung = CATALOG.filter((p) => p.brand === 'Samsung').sort(byNewest);

/** iPhone generation number from the model name ("iPhone 16 Pro" → 16). Air / 17e map to their own year. */
function iphoneGen(p: Product): number {
  const m = p.name.match(/iPhone (\d+)/);
  if (m) return Number(m[1]);
  return p.releaseYear >= 2025 ? 17 : 0;
}
function galaxyGen(p: Product): number {
  const m = p.name.match(/Galaxy S(\d+)/);
  return m ? Number(m[1]) : 0;
}

const pick = (list: Product[], fn: (p: Product) => boolean) => list.filter(fn).map(toItem);

export const BRAND_MENUS: BrandMenu[] = [
  {
    key: 'Apple',
    label: 'iPhone',
    tagline: `From £${Math.min(...apple.map((p) => p.fromPrice))}`,
    to: '/shop?brand=Apple',
    image: '/phones/apple-iphone-16-pro.webp',
    groups: [
      { title: 'iPhone 18 & 17', to: '/shop?brand=Apple&sort=newest', items: pick(apple, (p) => iphoneGen(p) >= 17) },
      { title: 'iPhone 16 & 15', to: '/shop?brand=Apple&minPrice=300&maxPrice=560', items: pick(apple, (p) => [16, 15].includes(iphoneGen(p))) },
      { title: 'iPhone 14 & 13', to: '/shop?brand=Apple&minPrice=170&maxPrice=345', items: pick(apple, (p) => [14, 13].includes(iphoneGen(p))) },
      { title: 'iPhone 12 & 11', to: '/shop?brand=Apple&maxPrice=215', items: pick(apple, (p) => [12, 11].includes(iphoneGen(p))) },
    ],
    featured: { title: 'iPhone 16 Pro', blurb: 'Titanium, 5x zoom, Excellent grade.', slug: 'apple-iphone-16-pro', image: '/phones/apple-iphone-16-pro.webp', fromPrice: apple.find((p) => p.slug === 'apple-iphone-16-pro')?.fromPrice ?? 0 },
  },
  {
    key: 'Samsung',
    label: 'Samsung Galaxy',
    tagline: `From £${Math.min(...samsung.map((p) => p.fromPrice))}`,
    to: '/shop?brand=Samsung',
    image: '/phones/samsung-galaxy-s25-ultra.jpg',
    groups: [
      { title: 'Galaxy S26 to S24', to: '/shop?brand=Samsung&series=Galaxy%20S&sort=newest', items: pick(samsung, (p) => p.series === 'Galaxy S' && galaxyGen(p) >= 24) },
      { title: 'Galaxy S23 to S20', to: '/shop?brand=Samsung&series=Galaxy%20S&maxPrice=290', items: pick(samsung, (p) => p.series === 'Galaxy S' && galaxyGen(p) < 24) },
      { title: 'Galaxy Z foldables', to: '/shop?brand=Samsung&series=Galaxy%20Z', items: pick(samsung, (p) => p.series === 'Galaxy Z') },
      { title: 'Galaxy A & Note', to: '/shop?brand=Samsung&series=Galaxy%20A&series=Galaxy%20Note', items: pick(samsung, (p) => p.series === 'Galaxy A' || p.series === 'Galaxy Note') },
    ],
    featured: { title: 'Galaxy S24 Ultra', blurb: '200MP camera, S Pen, titanium frame.', slug: 'samsung-galaxy-s24-ultra', image: '/phones/samsung-galaxy-s24-ultra.webp', fromPrice: samsung.find((p) => p.slug === 'samsung-galaxy-s24-ultra')?.fromPrice ?? 0 },
  },
];

export const QUICK_LINKS: Array<{ label: string; to: string }> = [
  { label: 'All phones', to: '/shop' },
  { label: 'Under £250', to: '/shop?maxPrice=250' },
  { label: 'Excellent condition', to: '/shop?condition=excellent' },
  { label: 'Unlocked only', to: '/shop?network=Unlocked' },
  { label: 'Newest arrivals', to: '/shop?sort=newest' },
];
