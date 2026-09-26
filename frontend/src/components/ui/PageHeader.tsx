import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

/** Cream band at the top of inner pages. */
export function PageHeader({ eyebrow, title, blurb, children, className, align = 'left' }: { eyebrow?: string; title: ReactNode; blurb?: ReactNode; children?: ReactNode; className?: string; align?: 'left' | 'center' }) {
  return (
    <section className={cn('bg-cream', className)}>
      <div className={cn('container py-12 md:py-16', align === 'center' && 'text-center')}>
        {eyebrow && <p className="eyebrow text-brand-600">{eyebrow}</p>}
        <h1 className={cn('mt-3 text-4xl md:text-[3.25rem] md:leading-[1.05] text-balance', align === 'center' && 'mx-auto max-w-3xl')}>{title}</h1>
        {blurb && <div className={cn('mt-4 max-w-2xl text-[17px] text-ink-2 text-balance', align === 'center' && 'mx-auto')}>{blurb}</div>}
        {children}
      </div>
    </section>
  );
}
