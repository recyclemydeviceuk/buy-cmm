import { useState, type ReactNode } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '../../lib/cn';

export function Accordion({ items, defaultOpen = 0, variant = 'card' }: { items: Array<{ q: string; a: ReactNode }>; defaultOpen?: number | null; variant?: 'card' | 'plain' }) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  return (
    <div className={cn(variant === 'card' ? 'space-y-3' : 'divide-y divide-line border-y border-line')}>
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={it.q} className={cn(variant === 'card' && 'rounded-2xl border transition-colors', variant === 'card' && (isOpen ? 'border-ink bg-white' : 'border-line bg-white hover:border-ink-4'))}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className={cn('flex w-full items-center justify-between gap-6 text-left focus-ring rounded-2xl', variant === 'card' ? 'px-6 py-5' : 'py-6')}
            >
              <span className="font-display text-base font-semibold md:text-[17px]">{it.q}</span>
              <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300', isOpen ? 'rotate-45 bg-ink text-white' : 'bg-cream text-ink')}>
                <Plus size={16} />
              </span>
            </button>
            <div className={cn('grid transition-[grid-template-rows] duration-300 ease-out', isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
              <div className="overflow-hidden">
                <div className={cn('text-ink-3 leading-relaxed', variant === 'card' ? 'px-6 pb-6 pr-16' : 'pb-6 pr-10')}>{it.a}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
