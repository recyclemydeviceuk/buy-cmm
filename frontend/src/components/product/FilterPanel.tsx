import { useEffect, useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import type { Facets, ProductQuery } from '../../types';
import { money } from '../../lib/format';
import { cn } from '../../lib/cn';

interface Props {
  facets: Facets | null;
  query: ProductQuery;
  onChange: (next: Partial<ProductQuery>) => void;
  onReset: () => void;
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-line py-6 first:border-t-0 first:pt-0">
      <legend className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-ink-3">{title}</legend>
      {children}
    </fieldset>
  );
}

function CheckList({ title, options, selected, onToggle }: { title: string; options: Array<{ value: string; label: string; count: number }>; selected: string[]; onToggle: (v: string) => void }) {
  if (!options.length) return null;
  return (
    <Group title={title}>
      <ul className="space-y-0.5">
        {options.map((o) => {
          const checked = selected.includes(o.value);
          return (
            <li key={o.value}>
              <label className={cn('-mx-2 flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-[15px] transition-colors hover:bg-cream-2', o.count === 0 && !checked && 'text-ink-4')}>
                <input type="checkbox" checked={checked} onChange={() => onToggle(o.value)} className="peer sr-only" />
                <span className={cn('flex h-[18px] w-[18px] items-center justify-center rounded-[5px] border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-ink peer-focus-visible:ring-offset-2', checked ? 'border-ink bg-ink text-white' : 'border-ink/25 bg-white')}>
                  {checked && <Check size={11} strokeWidth={3} />}
                </span>
                <span className={cn('flex-1', checked ? 'font-semibold text-ink' : 'text-ink-2')}>{o.label}</span>
                <span className="text-xs tabular-nums text-ink-4">{o.count}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </Group>
  );
}

function PriceRange({ min, max, value, onCommit }: { min: number; max: number; value: [number, number]; onCommit: (v: [number, number]) => void }) {
  const [local, setLocal] = useState<[number, number]>(value);
  useEffect(() => setLocal(value), [value[0], value[1]]); // eslint-disable-line react-hooks/exhaustive-deps
  const span = Math.max(1, max - min);
  const left = ((local[0] - min) / span) * 100;
  const right = ((local[1] - min) / span) * 100;
  return (
    <Group title="Price">
      <div className="flex items-center justify-between text-sm font-semibold tabular-nums">
        <span>{money(local[0])}</span>
        <span>{money(local[1])}</span>
      </div>
      <div className="relative mt-4 h-5">
        <div className="absolute left-0 right-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-line" />
        <div className="absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-ink" style={{ left: `${left}%`, right: `${100 - right}%` }} />
        <input type="range" min={min} max={max} step={10} value={local[0]} aria-label="Minimum price" onChange={(e) => setLocal([Math.min(Number(e.target.value), local[1] - 10), local[1]])} onMouseUp={() => onCommit(local)} onTouchEnd={() => onCommit(local)} onKeyUp={() => onCommit(local)} className="pointer-events-none absolute inset-0 h-5 w-full" />
        <input type="range" min={min} max={max} step={10} value={local[1]} aria-label="Maximum price" onChange={(e) => setLocal([local[0], Math.max(Number(e.target.value), local[0] + 10)])} onMouseUp={() => onCommit(local)} onTouchEnd={() => onCommit(local)} onKeyUp={() => onCommit(local)} className="pointer-events-none absolute inset-0 h-5 w-full" />
      </div>
    </Group>
  );
}

/** Minimal sidebar: no card, hairline groups, small caps headings. */
export function FilterPanel({ facets, query, onChange, onReset }: Props) {
  const toggle = (key: 'brand' | 'series' | 'network' | 'condition' | 'storage') => (v: string) => {
    const cur = (query[key] ?? []) as string[];
    const next = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v];
    onChange({ [key]: next.length ? next : undefined, page: 1 } as Partial<ProductQuery>);
  };
  const active = ['brand', 'series', 'network', 'condition', 'storage'].some((k) => (query[k as keyof ProductQuery] as string[] | undefined)?.length) || query.minPrice !== undefined || query.maxPrice !== undefined;
  if (!facets) return <div className="h-96 animate-pulse rounded-2xl bg-cream" />;
  const pmin = Math.floor(facets.priceRange.min / 10) * 10;
  const pmax = Math.ceil(facets.priceRange.max / 10) * 10;
  return (
    <div>
      <div className="mb-6 flex h-8 items-center justify-between">
        <h2 className="font-display text-base font-bold">Filters</h2>
        {active && (
          <button type="button" onClick={onReset} className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-3 underline-offset-4 hover:text-ink hover:underline">
            <RotateCcw size={12} /> Clear all
          </button>
        )}
      </div>
      <CheckList title="Brand" options={facets.brands} selected={query.brand ?? []} onToggle={toggle('brand')} />
      <CheckList title="Condition" options={facets.conditions} selected={query.condition ?? []} onToggle={toggle('condition')} />
      <PriceRange min={pmin} max={pmax} value={[query.minPrice ?? pmin, query.maxPrice ?? pmax]} onCommit={([a, b]) => onChange({ minPrice: a <= pmin ? undefined : a, maxPrice: b >= pmax ? undefined : b, page: 1 })} />
      <CheckList title="Network" options={facets.networks} selected={query.network ?? []} onToggle={toggle('network')} />
      <CheckList title="Storage" options={facets.storages} selected={query.storage ?? []} onToggle={toggle('storage')} />
      <CheckList title="Range" options={facets.series} selected={query.series ?? []} onToggle={toggle('series')} />
    </div>
  );
}
