import { useMemo } from 'react';
import { useMenuProducts } from '../store/catalog';
import type { MenuProduct } from '../types';

/** Instant search over the live catalogue shared by every search box. Matches brand, model and series; ranks exact-ish matches first. */
export function useProductSearch(query: string, limit = 6): MenuProduct[] {
  const products = useMenuProducts();
  const term = query.trim().toLowerCase();
  return useMemo(() => {
    if (term.length < 2) return [];
    const words = term.split(/\s+/);
    return products
      .map((p) => {
        const hay = `${p.brand} ${p.name} ${p.series}`.toLowerCase();
        if (!words.every((w) => hay.includes(w))) return null;
        const score = (p.name.toLowerCase().startsWith(term) ? 2 : 0) + (p.name.toLowerCase() === term ? 3 : 0) + p.reviewCount / 1000;
        return { p, score };
      })
      .filter((x): x is { p: MenuProduct; score: number } => x !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((x) => x.p);
  }, [products, term, limit]);
}
