import { Star } from 'lucide-react';
import { cn } from '../../lib/cn';

export function Stars({ value, size = 14, className }: { value: number; size?: number; className?: string }) {
  return (
    <div className={cn('flex items-center gap-0.5', className)} aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} className={i <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'fill-line text-line'} strokeWidth={0} />
      ))}
    </div>
  );
}

export function Rating({ value, count, size = 14, className }: { value: number; count?: number; size?: number; className?: string }) {
  return (
    <div className={cn('flex items-center gap-1.5', className)} aria-label={`Rated ${value} out of 5`}>
      <Stars value={value} size={size} />
      <span className="text-sm font-semibold text-ink">{value.toFixed(1)}</span>
      {count !== undefined && <span className="text-sm text-ink-3">({count.toLocaleString('en-GB')})</span>}
    </div>
  );
}
