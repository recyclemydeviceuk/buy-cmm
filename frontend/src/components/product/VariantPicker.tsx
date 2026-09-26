import { Link } from 'react-router-dom';
import type { Condition, Product, Variant } from '../../types';
import { CONDITIONS, CONDITION_ORDER, money } from '../../lib/format';
import { cn } from '../../lib/cn';
import { Check } from 'lucide-react';

interface Selection {
  storage: string;
  network: string;
  condition: Condition;
}

interface Props {
  product: Product;
  selection: Selection;
  onChange: (s: Selection) => void;
}

function cheapest(vs: Variant[]) {
  const live = vs.filter((v) => v.stock > 0);
  return live.length ? Math.min(...live.map((v) => v.price)) : null;
}

const GRADE: Record<Condition, string> = { excellent: 'A', good: 'B', fair: 'C' };

function Chip({ selected, disabled, onClick, label, sub }: { selected: boolean; disabled: boolean; onClick: () => void; label: string; sub: string }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm transition-all focus-ring disabled:cursor-not-allowed disabled:opacity-40',
        selected ? 'border-ink bg-ink text-white' : 'border-line bg-white hover:border-ink',
      )}
    >
      <span className="font-semibold">{label}</span>
      <span className={cn('text-xs', selected ? 'text-white/70' : 'text-ink-3')}>{sub}</span>
    </button>
  );
}

export function VariantPicker({ product, selection, onChange }: Props) {
  const vs = product.variants;
  const priceLabel = (exact: number | null, fallback: number | null) => (exact !== null ? money(exact) : fallback !== null ? `from ${money(fallback)}` : 'Sold out');
  const storagePrice = (s: string) => priceLabel(cheapest(vs.filter((v) => v.storage === s && v.network === selection.network && v.condition === selection.condition)), cheapest(vs.filter((v) => v.storage === s)));
  const networkPrice = (n: string) => priceLabel(cheapest(vs.filter((v) => v.network === n && v.storage === selection.storage && v.condition === selection.condition)), cheapest(vs.filter((v) => v.network === n)));
  const conditionVariant = (c: Condition) => vs.find((v) => v.condition === c && v.storage === selection.storage && v.network === selection.network);

  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="mb-3 flex w-full items-baseline justify-between">
          <span className="font-display text-sm font-bold">Storage</span>
          <span className="text-xs font-medium text-ink-3">{selection.storage}</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {product.storages.map((s) => {
            const price = storagePrice(s);
            return <Chip key={s} label={s} sub={price} selected={s === selection.storage} disabled={price === 'Sold out'} onClick={() => onChange({ ...selection, storage: s })} />;
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 flex w-full items-baseline justify-between">
          <span className="font-display text-sm font-bold">Network</span>
          <span className="text-xs font-medium text-ink-3">{selection.network === 'Unlocked' ? 'Works with any SIM' : `Locked to ${selection.network}`}</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {product.networks.map((n) => {
            const price = networkPrice(n);
            return <Chip key={n} label={n} sub={price} selected={n === selection.network} disabled={price === 'Sold out'} onClick={() => onChange({ ...selection, network: n })} />;
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 flex w-full items-baseline justify-between">
          <span className="font-display text-sm font-bold">Condition</span>
          <Link to="/how-it-works#grades" className="text-xs font-semibold text-ink-3 underline underline-offset-4 hover:text-ink">How we grade</Link>
        </legend>
        <div className="grid grid-cols-3 gap-2">
          {CONDITION_ORDER.map((c) => {
            const v = conditionVariant(c);
            const available = !!v && v.stock > 0;
            const selected = c === selection.condition;
            return (
              <button
                key={c}
                type="button"
                disabled={!available}
                onClick={() => onChange({ ...selection, condition: c })}
                aria-pressed={selected}
                className={cn(
                  'relative rounded-2xl border p-3.5 text-left transition-all focus-ring disabled:cursor-not-allowed disabled:opacity-40',
                  selected ? 'border-ink bg-white ring-1 ring-ink' : 'border-line bg-white hover:border-ink',
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={cn('flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold', selected ? 'bg-ink text-white' : 'bg-cream text-ink-2')}>{GRADE[c]}</span>
                  {selected && <Check size={14} strokeWidth={3} className="text-success" />}
                </div>
                <p className="mt-2 text-sm font-bold">{CONDITIONS[c].label}</p>
                <p className="text-[11px] leading-tight text-ink-3">{CONDITIONS[c].short}</p>
                <p className="mt-2 font-display text-base font-bold tracking-tighter">{available ? money(v!.price) : 'Sold out'}</p>
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
