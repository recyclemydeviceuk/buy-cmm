import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { CONDITIONS, CONDITION_ORDER } from '../../lib/format';
import { cn } from '../../lib/cn';

const SAVE = ['30–45%', '40–55%', '50–65%'];

export function ConditionGuide() {
  return (
    <div className="grid gap-4 md:grid-cols-3 md:gap-5">
      {CONDITION_ORDER.map((c, i) => {
        const hero = i === 0;
        return (
          <div key={c} className={cn('relative flex flex-col rounded-3xl border p-7', hero ? 'border-ink bg-ink text-white' : 'border-line bg-white')}>
            {hero && <span className="absolute right-5 top-5 rounded-full bg-brand-600 px-2.5 py-1 text-[11px] font-bold text-white">Most popular</span>}
            <span className={cn('flex h-12 w-12 items-center justify-center rounded-2xl font-display text-lg font-bold', hero ? 'bg-white/10 text-white' : 'bg-cream text-ink')}>{['A', 'B', 'C'][i]}</span>
            <h3 className={cn('mt-5 font-display text-2xl font-bold', hero && 'text-white')}>{CONDITIONS[c].label}</h3>
            <p className={cn('mt-1 text-sm', hero ? 'text-white/60' : 'text-ink-3')}>{CONDITIONS[c].short}</p>
            <ul className="mt-6 space-y-2.5">
              {CONDITIONS[c].detail.map((d) => (
                <li key={d} className="flex items-start gap-2.5 text-sm">
                  <Check size={15} className={cn('mt-0.5 shrink-0', hero ? 'text-tint-mint' : 'text-success')} strokeWidth={3} />
                  <span className={hero ? 'text-white/85' : 'text-ink-2'}>{d}</span>
                </li>
              ))}
            </ul>
            <div className={cn('mt-8 flex items-center justify-between border-t pt-5', hero ? 'border-white/10' : 'border-line')}>
              <span className={cn('text-xs', hero ? 'text-white/60' : 'text-ink-3')}>
                Save <span className={cn('font-bold', hero ? 'text-white' : 'text-ink')}>{SAVE[i]}</span> vs new
              </span>
              <Link to={`/shop?condition=${c}`} className={cn('inline-flex items-center gap-1.5 text-sm font-semibold', hero ? 'text-white' : 'text-ink')}>
                Shop <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
