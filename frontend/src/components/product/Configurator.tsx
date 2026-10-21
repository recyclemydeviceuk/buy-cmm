import { forwardRef, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import type { Product, Variant } from '../../types';
import { money } from '../../lib/format';
import { cn } from '../../lib/cn';
import type { Selection } from './VariantPicker';

const OPTIONS = ['colour', 'storage', 'condition'] as const;

export interface OptionPrice {
  /** What to show: "£940", "from £860" or "Sold out". */
  label: string;
  /** The number behind the label, for comparing options (null when sold out). */
  value: number | null;
  soldOut: boolean;
}

/** Prices each option given the other choices; an unchosen colour ('') does not narrow the price. */
export function optionPricer(product: Product, selection: Selection) {
  const live = (vs: Variant[]) => vs.filter((v) => v.stock > 0);
  const cheapest = (vs: Variant[]) => (live(vs).length ? Math.min(...live(vs).map((v) => v.price)) : null);
  const matches = (v: Variant, o: Selection) => OPTIONS.every((k) => (k === 'colour' && o[k] === '') || v[k] === o[k]);
  return (option: keyof Selection, value: string): OptionPrice => {
    const exact = cheapest(product.variants.filter((v) => matches(v, { ...selection, [option]: value })));
    if (exact !== null) return { label: money(exact), value: exact, soldOut: false };
    const any = cheapest(product.variants.filter((v) => v[option] === value));
    return any !== null ? { label: `from ${money(any)}`, value: any, soldOut: false } : { label: 'Sold out', value: null, soldOut: true };
  };
}

/** The lowest priced option that is in stock, used for the "Best price" tag. */
export function bestValue(prices: Array<[string, OptionPrice]>): string | null {
  const live = prices.filter(([, p]) => !p.soldOut && p.value !== null);
  if (live.length < 2) return null;
  return live.sort((a, b) => a[1].value! - b[1].value!)[0][0];
}

interface StepProps {
  id: string;
  n: number;
  title: string;
  sub?: ReactNode;
  /** Shown beside the title, e.g. "How we grade". */
  aside?: ReactNode;
  visual: ReactNode;
  /** Puts the visual on the right on large screens, so the page alternates as you scroll. */
  flip?: boolean;
  highlight?: boolean;
  children: ReactNode;
}

/** One step of the configurator: a large visual on one side, the choices on the other. */
export const StepSection = forwardRef<HTMLElement, StepProps>(function StepSection({ id, n, title, sub, aside, visual, flip, highlight, children }, ref) {
  return (
    <section ref={ref} id={id} className="scroll-mt-28 border-t border-line py-12 md:py-16">
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
        <div className={flip ? 'lg:order-2' : undefined}>{visual}</div>
        <div>
          <div className="flex items-start gap-4">
            <span className="serif-accent text-5xl leading-none text-ink-4 md:text-6xl" aria-hidden>
              0{n}
            </span>
            <div className="min-w-0 flex-1 pt-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h2 className="font-display text-2xl font-bold tracking-tighter md:text-[1.9rem]">{title}</h2>
                {aside}
              </div>
              {sub && <p className="mt-1 text-sm text-ink-3">{sub}</p>}
            </div>
          </div>
          <div className={cn('mt-6 space-y-2.5 rounded-[28px] transition-shadow duration-500', highlight && 'shadow-[0_0_0_3px_rgba(208,26,42,.35)]')} role="radiogroup" aria-label={title}>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
});

interface OptionProps {
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: ReactNode;
  sub?: ReactNode;
  price: OptionPrice;
  /** Small coloured label, e.g. "Best price". */
  tag?: { label: string; tone: 'mint' | 'lilac' | 'peach' | 'sky' };
  /** Shown before the title: a grade badge or a colour swatch. */
  leading?: ReactNode;
}

const TAG_TONE = { mint: 'bg-tint-mint text-success', lilac: 'bg-tint-lilac text-[#5B3FA8]', peach: 'bg-tint-peach text-brand-700', sky: 'bg-tint-sky text-[#1F4E86]' };

/** A full-width radio row: marker, title and description, price on the right. */
export function OptionRow({ selected, disabled, onClick, title, sub, price, tag, leading }: OptionProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'group flex w-full items-center gap-4 rounded-[22px] border bg-white px-4 py-4 text-left transition-all duration-200 focus-ring sm:px-5',
        selected ? 'border-ink shadow-[0_0_0_1px_#0B0C10,0_14px_30px_-18px_rgba(11,12,16,.35)]' : 'border-line hover:-translate-y-px hover:border-ink-3 hover:shadow-card',
        disabled && 'cursor-not-allowed opacity-45 hover:translate-y-0 hover:border-line hover:shadow-none',
      )}
    >
      <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors', selected ? 'border-ink bg-ink text-white' : 'border-line bg-white group-hover:border-ink-3')} aria-hidden>
        {selected && <Check size={13} strokeWidth={3.5} />}
      </span>
      {leading}
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-display text-[15px] font-bold">{title}</span>
          {tag && <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider', TAG_TONE[tag.tone])}>{tag.label}</span>}
        </span>
        {sub && <span className="mt-0.5 block text-xs leading-snug text-ink-3">{sub}</span>}
      </span>
      <span className={cn('shrink-0 text-right font-display font-bold tracking-tighter', price.soldOut ? 'text-sm text-ink-4' : 'text-lg')}>{price.label}</span>
    </button>
  );
}
