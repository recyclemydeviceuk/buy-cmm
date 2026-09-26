import type { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from '../ui/Skeleton';

export function ProductGrid({ products, loading = false, columns = 4 }: { products: Product[]; loading?: boolean; columns?: 3 | 4 }) {
  const cols = columns === 3 ? 'sm:grid-cols-2 xl:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
  return (
    <div className={`grid grid-cols-1 gap-4 md:gap-5 ${cols}`}>
      {loading ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />) : products.map((p, i) => <ProductCard key={p.id} product={p} priority={i < 4} />)}
    </div>
  );
}
