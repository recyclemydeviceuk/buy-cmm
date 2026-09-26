import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from '../ui/Skeleton';
import type { Product } from '../../types';

/** Horizontal, snap-scrolling rail on mobile; grid on desktop. */
export function ProductRail({ products, loading }: { products: Product[]; loading?: boolean }) {
  return (
    <div className="-mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-3 pt-1 no-scrollbar md:mx-0 md:grid md:grid-cols-4 md:gap-5 md:overflow-visible md:px-0">
      {loading
        ? Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-[74%] shrink-0 snap-start sm:w-[46%] md:w-auto">
              <ProductCardSkeleton />
            </div>
          ))
        : products.map((p, i) => (
            <div key={p.id} className="w-[74%] shrink-0 snap-start sm:w-[46%] md:w-auto">
              <ProductCard product={p} priority={i < 2} />
            </div>
          ))}
    </div>
  );
}
