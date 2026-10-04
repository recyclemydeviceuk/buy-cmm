import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { Product } from '../../types';
import { money } from '../../lib/format';
import { Badge } from '../ui/Badge';
import { Stars } from '../ui/Rating';

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const off = product.rrp > product.fromPrice ? product.rrp - product.fromPrice : 0;
  const isNew = product.releaseYear >= 2026;
  const storages = product.storages;
  const storageRange = storages.length > 1 ? `${storages[0]} – ${storages[storages.length - 1]}` : storages[0];
  return (
    <Link to={`/phones/${product.slug}`} className="group flex flex-col rounded-2xl border border-line bg-white p-2 transition-all duration-300 hover:-translate-y-1 hover:border-ink-4 hover:shadow-card focus-ring sm:rounded-3xl sm:p-3">
      <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-xl bg-cream p-4 sm:rounded-2xl sm:p-6">
        <img
          src={product.image}
          alt={`${product.brand} ${product.name}`}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className="h-full w-full product-img transition-transform duration-500 ease-out group-hover:scale-[1.06]"
        />
        <div className="absolute left-2 top-2 flex flex-col items-start gap-1.5 sm:left-3 sm:top-3">
          {off > 0 && <Badge tone="dark">{money(off)} off new</Badge>}
          {isNew && <Badge tone="brand">New in</Badge>}
        </div>
        <span className="absolute bottom-3 right-3 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-ink text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight size={16} />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-2 pb-1 sm:p-3 sm:pb-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-3 sm:text-[11px] sm:tracking-[0.16em]">{product.brand} · {product.releaseYear}</p>
        <h3 className="mt-1 font-display text-[15px] font-bold leading-snug sm:mt-1.5 sm:text-[17px]">{product.name}</h3>
        <p className="mt-1 text-[11px] text-ink-3 sm:text-xs">{storageRange}<span className="hidden sm:inline"> · Unlocked or network</span></p>
        <div className="mt-2 flex items-center gap-1.5">
          {product.reviewCount > 0 ? (
            <>
              <Stars value={product.rating} size={12} />
              <span className="text-xs font-semibold">{product.rating.toFixed(1)}</span>
              <span className="text-xs text-ink-3">({product.reviewCount.toLocaleString('en-GB')})</span>
            </>
          ) : (
            <span className="text-xs text-ink-3">Tested & graded · no reviews yet</span>
          )}
        </div>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-3 gap-y-0.5 pt-3 sm:pt-5">
          <div>
            <p className="text-[11px] font-medium text-ink-3">Starting at</p>
            <p className="font-display text-lg font-bold leading-none tracking-tighter sm:text-[22px]">{money(product.fromPrice)}</p>
          </div>
          {product.rrp > product.fromPrice && <p className="pb-0.5 text-[11px] text-ink-3 sm:text-xs"><span className="line-through">{money(product.rrp)}</span> new</p>}
        </div>
      </div>
    </Link>
  );
}
