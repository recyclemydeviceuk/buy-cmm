import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Product } from '../../types';
import { money } from '../../lib/format';
import { cn } from '../../lib/cn';

interface Props {
  query: string;
  results: Product[];
  onPick?: () => void;
  onSubmitAll?: () => void;
  className?: string;
  compact?: boolean;
}

/** Live result list used under every search field. Renders nothing until the query is two characters long. */
export function SearchResults({ query, results, onPick, onSubmitAll, className, compact = false }: Props) {
  const term = query.trim();
  if (term.length < 2) return null;
  return (
    <div className={cn('text-left', className)}>
      {results.length ? (
        <ul className={cn('divide-y divide-line-2', compact && 'text-sm')}>
          {results.map((p) => (
            <li key={p.id}>
              <Link to={`/phones/${p.slug}`} onClick={onPick} className="flex items-center gap-3 px-2 py-2 transition-colors hover:bg-cream rounded-xl">
                <span className={cn('flex shrink-0 items-center justify-center rounded-lg bg-cream', compact ? 'h-9 w-9' : 'h-11 w-11')}>
                  <img src={p.image} alt="" className={cn('product-img', compact ? 'h-7 w-7' : 'h-9 w-9')} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{p.name}</span>
                  <span className="block text-xs text-ink-3">{p.brand} · {p.storages[0]} – {p.storages[p.storages.length - 1]}</span>
                </span>
                <span className="shrink-0 text-xs text-ink-3">from <span className="font-semibold text-ink">{money(p.fromPrice)}</span></span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-2 py-3 text-sm text-ink-3">No phones match “{term}”. Try a model name like “iPhone 14” or “S23”.</p>
      )}
      {onSubmitAll && results.length > 0 && (
        <button type="button" onClick={onSubmitAll} className="mt-1 flex w-full items-center justify-between rounded-xl px-2 py-2.5 text-sm font-semibold hover:bg-cream">
          See all results for “{term}” <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}
