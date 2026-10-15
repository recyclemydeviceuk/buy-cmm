import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { BasketLine, Condition, Product, Variant } from '../types';
import { readJson, writeJson } from '../lib/storage';

const KEY = 'buyupon.basket';

interface BasketState {
  lines: BasketLine[];
  count: number;
  subtotal: number;
  add: (product: Product, variant: Variant, quantity?: number) => void;
  remove: (lineId: string) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  clear: () => void;
  justAdded: BasketLine | null;
  dismissJustAdded: () => void;
}

const BasketContext = createContext<BasketState | null>(null);

function lineIdFor(productId: string, v: Pick<Variant, 'storage' | 'colour' | 'condition'>) {
  return `${productId}|${v.storage}|${v.colour}|${v.condition}`;
}

function toLine(product: Product, variant: Variant, quantity: number): BasketLine {
  return {
    lineId: lineIdFor(product.id, variant),
    productId: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    image: product.colours.find((c) => c.name === variant.colour)?.image || product.image,
    storage: variant.storage,
    colour: variant.colour,
    condition: variant.condition as Condition,
    unitPrice: variant.price,
    quantity,
  };
}

export function BasketProvider({ children }: { children: ReactNode }) {
  // Baskets saved before phones were sold by colour cannot be matched to a variant any more, so they are dropped.
  const [lines, setLines] = useState<BasketLine[]>(() => readJson<BasketLine[]>(KEY, []).filter((l) => typeof l.colour === 'string'));
  const [justAdded, setJustAdded] = useState<BasketLine | null>(null);

  useEffect(() => writeJson(KEY, lines), [lines]);

  const add = useCallback((product: Product, variant: Variant, quantity = 1) => {
    // A colour is required whenever the model has colour options.
    if (product.colours.length > 0 && !variant.colour) return;
    const lineId = lineIdFor(product.id, variant);
    setLines((prev) => {
      const existing = prev.find((l) => l.lineId === lineId);
      if (existing) {
        return prev.map((l) => (l.lineId === lineId ? { ...l, quantity: Math.min(variant.stock, l.quantity + quantity) } : l));
      }
      return [...prev, toLine(product, variant, quantity)];
    });
    setJustAdded(toLine(product, variant, quantity));
  }, []);

  const remove = useCallback((lineId: string) => setLines((prev) => prev.filter((l) => l.lineId !== lineId)), []);
  const setQuantity = useCallback(
    (lineId: string, quantity: number) =>
      setLines((prev) => (quantity <= 0 ? prev.filter((l) => l.lineId !== lineId) : prev.map((l) => (l.lineId === lineId ? { ...l, quantity } : l)))),
    [],
  );
  const clear = useCallback(() => setLines([]), []);
  const dismissJustAdded = useCallback(() => setJustAdded(null), []);

  const value = useMemo<BasketState>(
    () => ({
      lines,
      count: lines.reduce((s, l) => s + l.quantity, 0),
      subtotal: lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0),
      add,
      remove,
      setQuantity,
      clear,
      justAdded,
      dismissJustAdded,
    }),
    [lines, add, remove, setQuantity, clear, justAdded, dismissJustAdded],
  );

  return <BasketContext.Provider value={value}>{children}</BasketContext.Provider>;
}

export function useBasket() {
  const ctx = useContext(BasketContext);
  if (!ctx) throw new Error('useBasket must be used inside BasketProvider');
  return ctx;
}
