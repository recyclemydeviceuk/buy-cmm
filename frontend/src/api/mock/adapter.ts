import { CATALOG } from '../../data/catalog';
import type { Condition, Order, Product, ProductQuery } from '../../types';
import { readJson, writeJson } from '../../lib/storage';
import type { StorefrontApi } from '../types';
import { REVIEWS } from './reviews';

const LATENCY = 180;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const CONDITION_LABEL: Record<Condition, string> = { excellent: 'Excellent', good: 'Good', fair: 'Fair' };

function inStock(p: Product) {
  return p.variants.filter((v) => v.stock > 0);
}

function matches(p: Product, q: ProductQuery): boolean {
  if (q.brand?.length && !q.brand.includes(p.brand)) return false;
  if (q.series?.length && !q.series.includes(p.series)) return false;
  if (q.search) {
    const s = q.search.toLowerCase();
    if (!`${p.brand} ${p.name} ${p.series}`.toLowerCase().includes(s)) return false;
  }
  const variants = inStock(p).filter(
    (v) =>
      (!q.network?.length || q.network.includes(v.network)) &&
      (!q.condition?.length || q.condition.includes(v.condition)) &&
      (!q.storage?.length || q.storage.includes(v.storage)) &&
      (q.minPrice === undefined || v.price >= q.minPrice) &&
      (q.maxPrice === undefined || v.price <= q.maxPrice),
  );
  return variants.length > 0;
}

/** Lowest price of the variants that satisfy the active variant-level filters. */
function priceFor(p: Product, q: ProductQuery): number {
  const vs = inStock(p).filter(
    (v) =>
      (!q.network?.length || q.network.includes(v.network)) &&
      (!q.condition?.length || q.condition.includes(v.condition)) &&
      (!q.storage?.length || q.storage.includes(v.storage)),
  );
  return vs.length ? Math.min(...vs.map((v) => v.price)) : p.fromPrice;
}

function sortProducts(items: Product[], q: ProductQuery): Product[] {
  const arr = [...items];
  switch (q.sort) {
    case 'price-asc':
      return arr.sort((a, b) => priceFor(a, q) - priceFor(b, q));
    case 'price-desc':
      return arr.sort((a, b) => priceFor(b, q) - priceFor(a, q));
    case 'newest':
      return arr.sort((a, b) => b.releaseYear - a.releaseYear || b.rrp - a.rrp);
    default:
      return arr.sort((a, b) => b.reviewCount * b.rating - a.reviewCount * a.rating);
  }
}

function count<T extends string>(values: T[]): Map<T, number> {
  const m = new Map<T, number>();
  values.forEach((v) => m.set(v, (m.get(v) ?? 0) + 1));
  return m;
}

const ORDERS_KEY = 'buyupon.orders';

export const mockApi: StorefrontApi = {
  async listProducts(q) {
    await sleep(LATENCY);
    const filtered = sortProducts(CATALOG.filter((p) => matches(p, q)), q).map((p) => ({ ...p, fromPrice: priceFor(p, q) }));
    const pageSize = q.pageSize ?? 24;
    const page = q.page ?? 1;
    return { items: filtered.slice((page - 1) * pageSize, page * pageSize), total: filtered.length, page, pageSize };
  },

  async getFacets(q) {
    await sleep(60);
    // Facet counts ignore the facet's own dimension so users can widen a selection.
    const base = CATALOG.filter((p) => matches(p, { ...q, brand: undefined, series: undefined }));
    const brandCounts = count(base.map((p) => p.brand));
    const seriesCounts = count(CATALOG.filter((p) => matches(p, { ...q, series: undefined })).map((p) => p.series));
    const all = CATALOG.filter((p) => matches(p, { ...q, network: undefined, condition: undefined, storage: undefined, minPrice: undefined, maxPrice: undefined }));
    const vs = all.flatMap(inStock);
    // Count models (not variants) per facet value.
    const distinct = <T extends string>(pick: (p: Product) => T[]) => count(all.flatMap((p) => [...new Set(pick(p))]));
    const networkCounts = distinct((p) => inStock(p).map((v) => v.network));
    const conditionCounts = distinct((p) => inStock(p).map((v) => v.condition));
    const storageCounts = distinct((p) => inStock(p).map((v) => v.storage));
    const prices = vs.map((v) => v.price);
    const order = ['64GB', '128GB', '256GB', '512GB', '1TB', '2TB'];
    return {
      brands: [...brandCounts].map(([value, c]) => ({ value, label: value, count: c })),
      series: [...seriesCounts].map(([value, c]) => ({ value, label: value, count: c })).sort((a, b) => a.label.localeCompare(b.label)),
      networks: ['Unlocked', 'EE', 'Vodafone', 'O2', 'Three'].filter((n) => networkCounts.has(n)).map((value) => ({ value, label: value, count: networkCounts.get(value) ?? 0 })),
      conditions: (['excellent', 'good', 'fair'] as Condition[]).map((value) => ({ value, label: CONDITION_LABEL[value], count: conditionCounts.get(value) ?? 0 })),
      storages: order.filter((s) => storageCounts.has(s)).map((value) => ({ value, label: value, count: storageCounts.get(value) ?? 0 })),
      priceRange: { min: prices.length ? Math.min(...prices) : 0, max: prices.length ? Math.max(...prices) : 0 },
    };
  },

  async getProduct(slug) {
    await sleep(LATENCY);
    return CATALOG.find((p) => p.slug === slug) ?? null;
  },

  async getFeatured() {
    await sleep(LATENCY);
    const picks = ['apple-iphone-15', 'samsung-galaxy-s24', 'apple-iphone-16-pro', 'samsung-galaxy-s25-ultra', 'apple-iphone-14', 'samsung-galaxy-z-flip-6', 'apple-iphone-13', 'samsung-galaxy-a56'];
    return picks.map((s) => CATALOG.find((p) => p.slug === s)!).filter(Boolean);
  },

  async getRelated(slug) {
    await sleep(LATENCY);
    const p = CATALOG.find((x) => x.slug === slug);
    if (!p) return [];
    return CATALOG.filter((x) => x.slug !== slug && x.series === p.series)
      .sort((a, b) => Math.abs(a.fromPrice - p.fromPrice) - Math.abs(b.fromPrice - p.fromPrice))
      .slice(0, 4);
  },

  async getReviews(productId) {
    await sleep(LATENCY);
    return REVIEWS.filter((r) => r.productId === productId || r.productId === '*').slice(0, 4);
  },

  async checkout(req) {
    await sleep(900);
    const lines = req.lines.map((l, i) => {
      const p = CATALOG.find((x) => x.id === l.productId)!;
      const v = p.variants.find((x) => x.storage === l.storage && x.network === l.network && x.condition === l.condition)!;
      return {
        lineId: `${i}`,
        productId: p.id,
        slug: p.slug,
        name: p.name,
        brand: p.brand,
        image: p.image,
        storage: v.storage,
        network: v.network,
        condition: v.condition,
        unitPrice: v.price,
        quantity: l.quantity,
      };
    });
    const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
    const deliveryFee = req.delivery === 'next-day' ? 0 : 0;
    const now = new Date();
    const eta = new Date(now);
    eta.setDate(now.getDate() + (req.delivery === 'next-day' ? 1 : 3));
    const order: Order = {
      orderNumber: `CMM-${now.getFullYear().toString().slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(100000 + Math.random() * 899999)}`,
      createdAt: now.toISOString(),
      status: 'confirmed',
      lines,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      delivery: req.delivery,
      customer: req.customer,
      estimatedDelivery: eta.toISOString(),
    };
    const orders = readJson<Order[]>(ORDERS_KEY, []);
    writeJson(ORDERS_KEY, [order, ...orders].slice(0, 20));
    return order;
  },

  async getOrder(orderNumber) {
    await sleep(LATENCY);
    return readJson<Order[]>(ORDERS_KEY, []).find((o) => o.orderNumber === orderNumber) ?? null;
  },

  async subscribe() {
    await sleep(400);
    return { ok: true };
  },

  async sendContact() {
    await sleep(600);
    return { ok: true };
  },
};
