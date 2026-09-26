import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { BRAND_MENUS, QUICK_LINKS } from '../../data/menu';
import { money } from '../../lib/format';
import { cn } from '../../lib/cn';

/** Desktop "Buy a phone" panel: brand switch, range links, most popular models, one featured device. */
export function MegaMenu({ onNavigate }: { onNavigate: () => void }) {
  const [brandKey, setBrandKey] = useState<'Apple' | 'Samsung'>('Apple');
  const brand = BRAND_MENUS.find((b) => b.key === brandKey)!;
  const tile = brandKey === 'Apple' ? 'bg-tint-peach' : 'bg-tint-sky';
  const popular = brand.groups.flatMap((g) => g.items).sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 5);
  const row = 'flex h-11 items-center justify-between rounded-xl px-3 text-[15px] text-ink-2 transition-colors hover:bg-cream hover:text-ink';

  return (
    <div className="flex animate-pop">
      {/* Brand switch */}
      <div className="flex w-[276px] shrink-0 flex-col border-r border-line bg-cream-2 p-4">
        <p className="eyebrow px-3 pb-3 pt-1">Brand</p>
        <div className="space-y-1">
          {BRAND_MENUS.map((b) => {
            const active = b.key === brandKey;
            return (
              <button
                key={b.key}
                type="button"
                onMouseEnter={() => setBrandKey(b.key)}
                onFocus={() => setBrandKey(b.key)}
                onClick={() => setBrandKey(b.key)}
                className={cn('flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-all focus-ring', active ? 'bg-white shadow-card' : 'hover:bg-white/70')}
              >
                <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', active ? (b.key === 'Apple' ? 'bg-tint-peach' : 'bg-tint-sky') : 'bg-white')}>
                  <img src={b.image} alt="" className="h-9 w-9 product-img" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block whitespace-nowrap font-display text-[15px] font-bold leading-tight">{b.label}</span>
                  <span className="block text-xs text-ink-3">{b.tagline}</span>
                </span>
                <ChevronRight size={16} className={active ? 'text-ink' : 'text-ink-4'} />
              </button>
            );
          })}
        </div>
        <Link to="/shop" onClick={onNavigate} className="mt-auto flex h-11 items-center justify-between rounded-xl px-3 text-sm font-semibold text-ink transition-colors hover:bg-white">
          All phones <ArrowRight size={15} />
        </Link>
      </div>

      {/* Ranges + popular */}
      <div className="flex min-w-0 flex-1 flex-col p-6">
        <div className="grid flex-1 grid-cols-2 gap-6">
          <div>
            <p className="eyebrow mb-2 px-3">Shop by range</p>
            <ul>
              {brand.groups.map((g) => (
                <li key={g.title}>
                  <Link to={g.to} onClick={onNavigate} className={row}>
                    <span>{g.title}</span>
                    <ChevronRight size={15} className="text-ink-4" />
                  </Link>
                </li>
              ))}
              <li>
                <Link to={brand.to} onClick={onNavigate} className={cn(row, 'font-semibold text-ink')}>
                  <span>All {brand.label}</span>
                  <ArrowRight size={15} />
                </Link>
              </li>
            </ul>
          </div>
          <div className="border-l border-line pl-6">
            <p className="eyebrow mb-2 px-3">Most popular</p>
            <ul>
              {popular.map((it) => (
                <li key={it.slug}>
                  <Link to={`/phones/${it.slug}`} onClick={onNavigate} className={row}>
                    <span className="truncate">{it.name}</span>
                    <span className="ml-3 shrink-0 text-xs tabular-nums text-ink-3">from {money(it.fromPrice)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-5 flex items-center gap-2 border-t border-line pt-4">
          <span className="mr-1 text-xs font-semibold text-ink-3">Quick picks</span>
          {QUICK_LINKS.filter((q) => q.to !== '/shop').map((q) => (
            <Link key={q.label} to={q.to} onClick={onNavigate} className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink-2 transition-colors hover:border-ink hover:text-ink">
              {q.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Featured */}
      <div className="w-[290px] shrink-0 p-4 pl-0">
        <Link to={`/phones/${brand.featured.slug}`} onClick={onNavigate} className={cn('group flex h-full flex-col overflow-hidden rounded-3xl p-6 transition-colors', tile)}>
          <p className="eyebrow text-ink-2">Most wanted</p>
          <p className="mt-1.5 font-display text-2xl font-bold leading-tight">{brand.featured.title}</p>
          <p className="mt-1 text-sm text-ink-2">{brand.featured.blurb}</p>
          <div className="relative my-3 flex flex-1 items-center justify-center">
            <img src={brand.featured.image} alt={brand.featured.title} className="h-40 w-auto product-img transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-2" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink-2">
              from <span className="font-display text-lg font-bold text-ink">{money(brand.featured.fromPrice)}</span>
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-white transition-transform group-hover:translate-x-1">
              <ArrowRight size={16} />
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
