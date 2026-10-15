import { Link } from 'react-router-dom';
import type { Condition, Product, Variant } from '../../types';
import { CONDITIONS, CONDITION_ORDER, money } from '../../lib/format';
import { cn } from '../../lib/cn';
import { Check } from 'lucide-react';

export type Selection = Pick<Variant, 'storage' | 'colour' | 'condition'>;

interface Props {
  product: Product;
  selection: Selection;
  /** `changed` is the option the shopper just picked. */
  onChange: (s: Selection, changed: keyof Selection) => void;
}

const OPTIONS = ['colour', 'storage', 'condition'] as const;

/** Keeps the option just picked and moves the other two to the closest configuration that is in stock. */
export function settle(variants: Variant[], wanted: Selection, changed: keyof Selection): Selection {
  const live = variants.filter((v) => v.stock > 0 && v[changed] === wanted[changed]);
  if (!live.length) return wanted;
  // While no colour has been chosen the shopper still has to pick one, so only storage and condition are settled.
  const open = wanted.colour === '' && changed !== 'colour';
  const keys = open ? (['storage', 'condition'] as const) : OPTIONS;
  const kept = (v: Variant) => keys.filter((o) => v[o] === wanted[o]).length;
  const best = [...live].sort((a, b) => kept(b) - kept(a) || a.price - b.price)[0];
  return { storage: best.storage, colour: open ? '' : best.colour, condition: best.condition };
}

function cheapest(vs: Variant[]) {
  const live = vs.filter((v) => v.stock > 0);
  return live.length ? Math.min(...live.map((v) => v.price)) : null;
}

function Chip({ selected, disabled, onClick, label, sub, swatch }: { selected: boolean; disabled: boolean; onClick: () => void; label: string; sub: string; swatch?: string }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm transition-all focus-ring disabled:cursor-not-allowed disabled:opacity-40',
        swatch && 'pl-2.5',
        selected ? 'border-ink bg-ink text-white' : 'border-line bg-white hover:border-ink',
      )}
    >
      {swatch && <span className={cn('h-5 w-5 shrink-0 rounded-full border', selected ? 'border-white/40' : 'border-ink/15')} style={{ backgroundColor: swatch }} aria-hidden />}
      <span className="font-semibold">{label}</span>
      <span className={cn('text-xs', selected ? 'text-white/70' : 'text-ink-3')}>{sub}</span>
    </button>
  );
}

export function VariantPicker({ product, selection, onChange }: Props) {
  const vs = product.variants;
  // An unchosen colour ('') does not narrow the price: it shows the cheapest colour in stock.
  const matches = (v: Variant, o: Partial<Selection>) => OPTIONS.every((k) => o[k] === undefined || (k === 'colour' && o[k] === '') || v[k] === o[k]);
  /** Exact price with the other two options as picked, else the cheapest this option is sold for, else sold out. */
  const priceOf = (option: keyof Selection, value: string) => {
    const exact = cheapest(vs.filter((v) => matches(v, { ...selection, [option]: value } as Selection)));
    const any = cheapest(vs.filter((v) => v[option] === value));
    return exact !== null ? money(exact) : any !== null ? `from ${money(any)}` : 'Sold out';
  };
  const pick = (option: keyof Selection, value: string) => onChange({ ...selection, [option]: value } as Selection, option);

  return (
    <div className="space-y-6">
      {product.colours.length > 0 && (
        <fieldset>
          <legend className="mb-3 flex w-full items-baseline justify-between">
            <span className="font-display text-sm font-bold">Colour</span>
            <span className={cn('text-xs font-medium', selection.colour ? 'text-ink-3' : 'text-brand-600')}>{selection.colour || 'Choose a colour'}</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {product.colours.map((c) => {
              const price = priceOf('colour', c.name);
              return <Chip key={c.name} label={c.name} sub={price} swatch={c.hex} selected={c.name === selection.colour} disabled={price === 'Sold out'} onClick={() => pick('colour', c.name)} />;
            })}
          </div>
        </fieldset>
      )}

      <fieldset>
        <legend className="mb-3 flex w-full items-baseline justify-between">
          <span className="font-display text-sm font-bold">Storage</span>
          <span className="text-xs font-medium text-ink-3">{selection.storage}</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {product.storages.map((s) => {
            const price = priceOf('storage', s);
            return <Chip key={s} label={s} sub={price} selected={s === selection.storage} disabled={price === 'Sold out'} onClick={() => pick('storage', s)} />;
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 flex w-full items-baseline justify-between">
          <span className="font-display text-sm font-bold">Condition</span>
          <Link to="/how-it-works#grades" className="text-xs font-semibold text-ink-3 underline underline-offset-4 hover:text-ink">How we grade</Link>
        </legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {CONDITION_ORDER.map((c: Condition) => {
            const price = priceOf('condition', c);
            const selected = c === selection.condition;
            return (
              <button
                key={c}
                type="button"
                disabled={price === 'Sold out'}
                onClick={() => pick('condition', c)}
                aria-pressed={selected}
                className={cn(
                  'relative flex flex-col rounded-2xl border p-3.5 text-left transition-all focus-ring disabled:cursor-not-allowed disabled:opacity-40',
                  selected ? 'border-ink bg-white ring-1 ring-ink' : 'border-line bg-white hover:border-ink',
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={cn('flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] font-bold', selected ? 'bg-ink text-white' : 'bg-cream text-ink-2')}>{CONDITIONS[c].grade}</span>
                  {selected && <Check size={14} strokeWidth={3} className="text-success" />}
                </div>
                <p className="mt-2 text-sm font-bold">{CONDITIONS[c].label}</p>
                <p className="text-[11px] leading-tight text-ink-3">{CONDITIONS[c].short}</p>
                <p className="mt-auto pt-2 font-display text-base font-bold tracking-tighter">{price}</p>
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
