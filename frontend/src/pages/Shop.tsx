import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { api } from '../api';
import { useAsync } from '../hooks/useAsync';
import { useSeo, breadcrumbLd } from '../lib/seo';
import type { Condition, ProductQuery, SortKey } from '../types';
import { FilterPanel } from '../components/product/FilterPanel';
import { ProductGrid } from '../components/product/ProductGrid';
import { Select } from '../components/ui/Field';
import { Button } from '../components/ui/Button';
import { conditionLabel, money } from '../lib/format';
import { cn } from '../lib/cn';

const PAGE_SIZE = 24;
const LIST_KEYS = ['brand', 'series', 'network', 'condition', 'storage'] as const;

function parse(sp: URLSearchParams): ProductQuery {
  const q: ProductQuery = { page: Number(sp.get('page') ?? 1) || 1, pageSize: PAGE_SIZE, sort: (sp.get('sort') as SortKey) || 'popular' };
  LIST_KEYS.forEach((k) => {
    const vals = sp.getAll(k);
    if (vals.length) (q as Record<string, unknown>)[k] = vals;
  });
  if (sp.get('minPrice')) q.minPrice = Number(sp.get('minPrice'));
  if (sp.get('maxPrice')) q.maxPrice = Number(sp.get('maxPrice'));
  if (sp.get('search')) q.search = sp.get('search') ?? undefined;
  return q;
}

function serialise(q: ProductQuery): URLSearchParams {
  const sp = new URLSearchParams();
  LIST_KEYS.forEach((k) => (q[k] as string[] | undefined)?.forEach((v) => sp.append(k, v)));
  if (q.minPrice !== undefined) sp.set('minPrice', String(q.minPrice));
  if (q.maxPrice !== undefined) sp.set('maxPrice', String(q.maxPrice));
  if (q.search) sp.set('search', q.search);
  if (q.sort && q.sort !== 'popular') sp.set('sort', q.sort);
  if (q.page && q.page > 1) sp.set('page', String(q.page));
  return sp;
}

export default function Shop() {
  const [sp, setSp] = useSearchParams();
  const query = useMemo(() => parse(sp), [sp]);
  const key = sp.toString();
  const [drawer, setDrawer] = useState(false);

  const title = query.search ? `Results for “${query.search}”` : query.brand?.length === 1 ? (query.brand[0] === 'Apple' ? 'Shop iPhone' : 'Shop Samsung Galaxy') : query.series?.includes('Galaxy Z') && query.series.length === 1 ? 'Shop foldables' : 'Shop all phones';
  const brandOnly = query.brand?.length === 1 && !query.search && !query.series?.length && !query.network?.length && !query.condition?.length && !query.storage?.length && query.minPrice === undefined && query.maxPrice === undefined && (query.page ?? 1) === 1;
  useSeo({
    title,
    description: query.brand?.[0] === 'Apple' ? 'Pre-owned iPhone 11 to iPhone 18 Pro Max, every storage and network, graded Excellent, Good or Fair. 12-month warranty and free next-day delivery.' : query.brand?.[0] === 'Samsung' ? 'Pre-owned Samsung Galaxy S, Z foldables, A series and Note, tested and graded by hand. 12-month warranty and free next-day delivery.' : 'Browse every pre-owned iPhone and Samsung Galaxy we sell. Filter by price, network, storage and condition. 12-month warranty, free next-day delivery.',
    canonical: brandOnly ? `/shop?brand=${query.brand![0]}` : '/shop',
    noindex: !!query.search || (query.page ?? 1) > 1,
    jsonLd: breadcrumbLd([['Home', '/'], [title, '/shop']]),
  });

  const list = useAsync(() => api.listProducts(query), [key]);
  const facets = useAsync(() => api.getFacets(query), [key]);

  const update = useCallback((next: Partial<ProductQuery>) => setSp(serialise({ ...query, ...next }), { replace: false }), [query, setSp]);
  const reset = useCallback(() => setSp(serialise({ sort: query.sort, search: query.search })), [setSp, query.sort, query.search]);

  useEffect(() => {
    document.body.style.overflow = drawer ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawer]);

  const chips: Array<{ label: string; onRemove: () => void }> = [];
  LIST_KEYS.forEach((k) =>
    (query[k] as string[] | undefined)?.forEach((v) =>
      chips.push({ label: k === 'condition' ? conditionLabel(v as Condition) : v, onRemove: () => update({ [k]: (query[k] as string[]).filter((x) => x !== v), page: 1 } as Partial<ProductQuery>) }),
    ),
  );
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    chips.push({ label: `${query.minPrice !== undefined ? money(query.minPrice) : '£0'} – ${query.maxPrice !== undefined ? money(query.maxPrice) : 'any'}`, onRemove: () => update({ minPrice: undefined, maxPrice: undefined, page: 1 }) });
  }
  if (query.search) chips.push({ label: `“${query.search}”`, onRemove: () => update({ search: undefined, page: 1 }) });

  const total = list.data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  
  return (
    <>
      <div className="container pb-8 pt-8 md:pb-10 md:pt-12">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6 md:pb-8">
          <h1 className="text-3xl md:text-[2.75rem] md:leading-[1.05]">{title}</h1>
          <p className="text-sm text-ink-3">{list.loading ? '…' : `${total} ${total === 1 ? 'result' : 'results'}`}</p>
        </div>
        <div className="mt-8 grid gap-10 lg:grid-cols-[240px_1fr] lg:gap-14 md:mt-10">
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <FilterPanel facets={facets.data} query={query} onChange={update} onReset={reset} />
            </div>
          </aside>

          <div>
            <div className="mb-6 flex min-h-10 flex-wrap items-center gap-3">
              <Button variant="secondary" size="sm" className="lg:hidden" onClick={() => setDrawer(true)}>
                <SlidersHorizontal size={16} /> Filters{chips.length ? ` (${chips.length})` : ''}
              </Button>
              <div className="flex flex-wrap gap-2">
                {chips.map((c) => (
                  <button key={c.label} type="button" onClick={c.onRemove} className="inline-flex h-9 items-center gap-2 rounded-full bg-ink px-3.5 text-xs font-semibold text-white hover:bg-ink-2 focus-ring">
                    {c.label} <X size={12} />
                  </button>
                ))}
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Select name="sort" value={query.sort} onChange={(e) => update({ sort: e.target.value as SortKey, page: 1 })} className="w-48 [&_select]:h-10 [&_select]:rounded-full [&_select]:border-line [&_select]:text-sm">
                  <option value="popular">Most popular</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                  <option value="newest">Newest first</option>
                </Select>
              </div>
            </div>

            {list.error ? (
              <p className="card p-10 text-center text-ink-3">{list.error}</p>
            ) : !list.loading && total === 0 ? (
              <div className="card p-12 text-center">
                <h2 className="font-display text-xl font-bold">No phones match those filters</h2>
                <p className="mt-2 text-ink-3">Try widening the price range or removing a network.</p>
                <Button variant="dark" className="mt-6" onClick={reset}>
                  Clear all filters
                </Button>
              </div>
            ) : (
              <ProductGrid products={list.data?.items ?? []} loading={list.loading} columns={3} />
            )}

            {pages > 1 && (
              <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
                {Array.from({ length: pages }).map((_, i) => (
                  <button key={i} type="button" onClick={() => update({ page: i + 1 })} aria-current={query.page === i + 1 ? 'page' : undefined} className={cn('h-11 w-11 rounded-full text-sm font-semibold transition-colors focus-ring', query.page === i + 1 ? 'bg-ink text-white' : 'border border-line hover:border-ink')}>
                    {i + 1}
                  </button>
                ))}
              </nav>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <div className={cn('fixed inset-0 z-[60] lg:hidden', drawer ? '' : 'pointer-events-none')} aria-hidden={!drawer}>
        <div className={cn('absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity', drawer ? 'opacity-100' : 'opacity-0')} onClick={() => setDrawer(false)} />
        <div className={cn('absolute bottom-0 left-0 right-0 max-h-[88vh] overflow-y-auto rounded-t-[32px] bg-white p-5 transition-transform duration-300', drawer ? 'translate-y-0' : 'translate-y-full')}>
          <div className="mb-3 flex items-center justify-between">
            <span className="mx-auto h-1.5 w-12 rounded-full bg-line" />
            <button type="button" onClick={() => setDrawer(false)} className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-cream focus-ring" aria-label="Close filters">
              <X size={20} />
            </button>
          </div>
          <FilterPanel facets={facets.data} query={query} onChange={update} onReset={reset} />
          <Button variant="dark" className="mt-5 w-full" onClick={() => setDrawer(false)}>
            Show {total} {total === 1 ? 'phone' : 'phones'}
          </Button>
        </div>
      </div>
    </>
  );
}
