import type { MenuProduct } from '../types';

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
  to: string;
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

const toItem = (p: MenuProduct): MenuItem => ({ name: p.name, slug: p.slug, image: p.image, fromPrice: p.fromPrice, releaseYear: p.releaseYear, reviewCount: p.reviewCount });
const byNewest = (a: MenuProduct, b: MenuProduct) => b.releaseYear - a.releaseYear || b.rrp - a.rrp;

function iphoneGen(p: MenuProduct): number {
  const m = p.name.match(/iPhone (\d+)/);
  if (m) return Number(m[1]);
  return p.releaseYear >= 2025 ? 17 : 0;
}
function galaxyGen(p: MenuProduct): number {
  const m = p.name.match(/Galaxy S(\d+)/);
  return m ? Number(m[1]) : 0;
}
const pick = (list: MenuProduct[], fn: (p: MenuProduct) => boolean) => list.filter(fn).map(toItem);
const star = (list: MenuProduct[]) => [...list].sort((a, b) => b.reviewCount * b.rating - a.reviewCount * a.rating || byNewest(a, b))[0];

/** Builds the "Buy a phone" menus from the live catalogue. Groups with no models are dropped. */
export function buildBrandMenus(products: MenuProduct[]): BrandMenu[] {
  const apple = products.filter((p) => p.brand === 'Apple').sort(byNewest);
  const samsung = products.filter((p) => p.brand === 'Samsung').sort(byNewest);
  const menus: BrandMenu[] = [];
  if (apple.length) {
    const top = star(apple);
    const gens = apple.map(iphoneGen);
    const newest = Math.max(...gens);
    menus.push({
      key: 'Apple',
      label: 'iPhone',
      tagline: `From £${Math.min(...apple.map((p) => p.fromPrice))}`,
      to: '/shop?brand=Apple',
      image: top.image,
      groups: [
        { title: `iPhone ${newest} & ${newest - 1}`, to: '/shop?brand=Apple&sort=newest', items: pick(apple, (p) => iphoneGen(p) >= newest - 1) },
        { title: `iPhone ${newest - 2} & ${newest - 3}`, to: `/shop?brand=Apple&search=iPhone%20${newest - 2}`, items: pick(apple, (p) => [newest - 2, newest - 3].includes(iphoneGen(p))) },
        { title: `iPhone ${newest - 4} & ${newest - 5}`, to: `/shop?brand=Apple&search=iPhone%20${newest - 4}`, items: pick(apple, (p) => [newest - 4, newest - 5].includes(iphoneGen(p))) },
        { title: `iPhone ${newest - 6} and earlier`, to: '/shop?brand=Apple&sort=price-asc', items: pick(apple, (p) => iphoneGen(p) <= newest - 6) },
      ].filter((g) => g.items.length),
      featured: { title: top.name, blurb: `${top.series} · ${top.releaseYear} · all grades`, slug: top.slug, image: top.image, fromPrice: top.fromPrice },
    });
  }
  if (samsung.length) {
    const top = star(samsung);
    const sGens = samsung.filter((p) => p.series === 'Galaxy S').map(galaxyGen);
    const newest = sGens.length ? Math.max(...sGens) : 0;
    menus.push({
      key: 'Samsung',
      label: 'Samsung Galaxy',
      tagline: `From £${Math.min(...samsung.map((p) => p.fromPrice))}`,
      to: '/shop?brand=Samsung',
      image: top.image,
      groups: [
        { title: `Galaxy S${newest} to S${newest - 2}`, to: '/shop?brand=Samsung&series=Galaxy%20S&sort=newest', items: pick(samsung, (p) => p.series === 'Galaxy S' && galaxyGen(p) >= newest - 2) },
        { title: `Galaxy S${newest - 3} and earlier`, to: '/shop?brand=Samsung&series=Galaxy%20S&sort=price-asc', items: pick(samsung, (p) => p.series === 'Galaxy S' && galaxyGen(p) < newest - 2) },
        { title: 'Galaxy Z foldables', to: '/shop?brand=Samsung&series=Galaxy%20Z', items: pick(samsung, (p) => p.series === 'Galaxy Z') },
        { title: 'Galaxy A & Note', to: '/shop?brand=Samsung&series=Galaxy%20A&series=Galaxy%20Note', items: pick(samsung, (p) => p.series === 'Galaxy A' || p.series === 'Galaxy Note') },
      ].filter((g) => g.items.length),
      featured: { title: top.name, blurb: `${top.series} · ${top.releaseYear} · all grades`, slug: top.slug, image: top.image, fromPrice: top.fromPrice },
    });
  }
  return menus;
}

export const QUICK_LINKS: Array<{ label: string; to: string }> = [
  { label: 'All phones', to: '/shop' },
  { label: 'Under £250', to: '/shop?maxPrice=250' },
  { label: 'Excellent condition', to: '/shop?condition=excellent' },
  { label: 'Unlocked only', to: '/shop?network=Unlocked' },
  { label: 'Newest arrivals', to: '/shop?sort=newest' },
];
