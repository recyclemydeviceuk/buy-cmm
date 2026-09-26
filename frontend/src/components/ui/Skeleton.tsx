import { cn } from '../../lib/cn';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-2xl bg-cream', className)} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-3xl border border-line-2 bg-white p-3">
      <Skeleton className="aspect-[4/5] w-full" />
      <div className="p-3">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="mt-3 h-4 w-2/3" />
        <Skeleton className="mt-2 h-3 w-1/2" />
        <Skeleton className="mt-6 h-6 w-1/3" />
      </div>
    </div>
  );
}
