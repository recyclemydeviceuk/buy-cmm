import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { api } from '../../api';
import { useAsync } from '../../hooks/useAsync';
import { money } from '../../lib/format';
import { cn } from '../../lib/cn';

const TILES = [
  { tint: 'bg-tint-lemon', lift: 'lg:translate-y-12' },
  { tint: 'bg-tint-lilac', lift: 'lg:translate-y-6' },
  { tint: 'bg-tint-peach', lift: '' },
  { tint: 'bg-tint-sky', lift: 'lg:translate-y-6' },
  { tint: 'bg-tint-mint', lift: 'lg:translate-y-12' },
];

/** Five featured devices (chosen in the admin) on tinted tiles, arranged in a gentle arc under the hero copy. */
export function DeviceShowcase() {
  const { data } = useAsync(() => api.getFeatured(), []);
  const items = (data ?? []).slice(0, 5);
  return (
    <div className="-mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-6 pt-2 no-scrollbar md:mx-0 md:px-0 lg:grid lg:grid-cols-5 lg:gap-4 lg:overflow-visible">
      {(items.length ? items : Array.from({ length: 5 }, () => null)).map((product, i) => {
        const { tint, lift } = TILES[i % TILES.length];
        if (!product) return <div key={i} className={cn('aspect-[4/5] w-[62%] shrink-0 animate-pulse rounded-3xl sm:w-[40%] lg:w-auto', tint, lift)} />;
        return (
          <Link
            key={product.slug}
            to={`/phones/${product.slug}`}
            className={cn('group relative flex w-[62%] shrink-0 snap-center flex-col overflow-hidden rounded-3xl p-5 transition-transform duration-500 hover:-translate-y-2 sm:w-[40%] lg:w-auto', tint, lift)}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display text-[15px] font-bold leading-tight">{product.name}</p>
                <p className="text-xs text-ink-2">from {money(product.fromPrice)}</p>
              </div>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-ink transition-colors group-hover:bg-ink group-hover:text-white">
                <ArrowUpRight size={15} />
              </span>
            </div>
            <div className="mt-4 flex aspect-[4/5] items-end justify-center">
              <img src={product.image} alt={`${product.brand} ${product.name}`} loading={i === 2 ? 'eager' : 'lazy'} className="h-[92%] w-auto product-img transition-transform duration-700 group-hover:scale-[1.06]" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
