import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Product } from '../../types';
import { money } from '../../lib/format';
import { Skeleton } from '../ui/Skeleton';
import { cn } from '../../lib/cn';

const TINTS = ['bg-tint-peach', 'bg-tint-sky', 'bg-tint-lilac', 'bg-tint-mint', 'bg-tint-lemon'];

function Card({ p, tint, large = false }: { p: Product; tint: string; large?: boolean }) {
  return (
    <Link to={`/phones/${p.slug}`} className={cn('group relative block overflow-hidden rounded-[28px] transition-transform duration-500 hover:-translate-y-1', tint, large ? 'aspect-[4/5] sm:aspect-square md:aspect-auto md:h-full md:min-h-[560px]' : 'aspect-[4/5]')}>
      <img src={p.image} alt={`${p.brand} ${p.name}`} loading="lazy" className={cn('absolute left-1/2 top-[44%] w-auto -translate-x-1/2 -translate-y-1/2 product-img transition-transform duration-700 group-hover:scale-105', large ? 'h-[70%] md:h-[78%]' : 'h-[58%]')} />
      <div className={cn('absolute flex items-center gap-1.5', large ? 'left-4 top-4' : 'left-3 top-3 md:left-4 md:top-4')}>
        <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white md:px-2.5 md:py-1 md:text-[11px]">New in</span>
        <span className={cn('rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-bold text-ink backdrop-blur', !large && 'hidden md:inline')}>{p.releaseYear}</span>
      </div>
      <span className={cn('absolute rounded-full bg-ink font-bold text-white', large ? 'right-4 top-4 px-3 py-1.5 text-xs' : 'right-3 top-3 px-2 py-1 text-[10px] md:right-4 md:top-4 md:px-3 md:py-1.5 md:text-xs')}>from {money(p.fromPrice)}</span>
      <div className={cn('absolute inset-x-2 bottom-2 rounded-2xl border border-white/60 bg-white/75 backdrop-blur-xl md:inset-x-4 md:bottom-4', large ? 'p-4' : 'p-3 md:p-4')}>
        <p className="eyebrow">{p.brand}</p>
        <div className="mt-1 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h3 className={cn('font-display font-bold leading-tight', large ? 'text-2xl md:text-3xl' : 'text-sm md:text-lg')}>{p.name}</h3>
            <p className={cn('mt-1 truncate text-ink-2', large ? 'text-sm' : 'hidden text-xs md:block')}>{p.specs.display} · {p.specs.chip}</p>
            {large && <p className="mt-1 text-xs text-ink-3"><span className="line-through">{money(p.rrp)}</span> new · {p.storages.join(' / ')}</p>}
          </div>
          <span className={cn('flex shrink-0 items-center justify-center rounded-full bg-ink text-white transition-transform group-hover:translate-x-1', large ? 'h-10 w-10' : 'h-8 w-8 md:h-10 md:w-10')}>
            <ArrowRight size={16} />
          </span>
        </div>
      </div>
    </Link>
  );
}

/** Bento grid for the newest models: one large card, four small, all with overlay panels. */
export function NewArrivals({ products, loading }: { products: Product[]; loading?: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-4 md:grid-rows-2">
        <Skeleton className="col-span-2 aspect-[4/5] md:row-span-2 md:aspect-auto" />
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-[4/5]" />)}
      </div>
    );
  }
  const [first, ...rest] = products;
  if (!first) return null;
  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-4 md:grid-rows-2">
      <div className="col-span-2 md:col-span-2 md:row-span-2 md:h-full">
        <Card p={first} tint={TINTS[0]} large />
      </div>
      {rest.slice(0, 4).map((p, i) => (
        <Card key={p.id} p={p} tint={TINTS[(i + 1) % TINTS.length]} />
      ))}
    </div>
  );
}
