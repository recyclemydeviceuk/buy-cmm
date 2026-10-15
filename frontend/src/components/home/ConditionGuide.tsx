import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { CONDITIONS, CONDITION_ORDER } from '../../lib/format';
import { useGradePhotos } from '../../store/catalog';
import { cn } from '../../lib/cn';

export function ConditionGuide() {
  const photos = useGradePhotos();
  // The four cards stay the same shape: photos appear once every grade has one.
  const withPhotos = CONDITION_ORDER.every((c) => photos[c]?.length);
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:gap-5 xl:grid-cols-4">
      {CONDITION_ORDER.map((c) => {
        const g = CONDITIONS[c];
        const hero = c === 'excellent';
        const photo = withPhotos ? photos[c]?.[0] : undefined;
        return (
          <div key={c} className={cn('relative flex flex-col rounded-3xl border p-6', hero ? 'border-ink bg-ink text-white' : 'border-line bg-white')}>
            {photo && (
              <div className="relative mb-5 aspect-[4/3] overflow-hidden rounded-2xl bg-ink">
                <img src={photo.url} alt={`Example of a phone in ${g.label} condition`} loading="lazy" className="h-full w-full object-cover" />
                <span className="absolute right-2.5 top-2.5 rounded-full bg-ink/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">Example</span>
              </div>
            )}
            <div className="flex items-center justify-between gap-3">
              <span className={cn('flex h-12 min-w-12 items-center justify-center rounded-2xl px-3 font-display text-lg font-bold', hero ? 'bg-white/10 text-white' : 'bg-cream text-ink')}>{g.grade}</span>
              {hero && <span className="rounded-full bg-brand-600 px-2.5 py-1 text-[11px] font-bold text-white">Most popular</span>}
            </div>
            <h3 className={cn('mt-5 font-display text-2xl font-bold', hero && 'text-white')}>{g.label}</h3>
            <p className={cn('mt-1 text-sm', hero ? 'text-white/60' : 'text-ink-3')}>{g.short}</p>
            <ul className="mt-6 space-y-2.5">
              {g.detail.map((d) => (
                <li key={d} className="flex items-start gap-2.5 text-sm">
                  <Check size={15} className={cn('mt-0.5 shrink-0', hero ? 'text-tint-mint' : 'text-success')} strokeWidth={3} />
                  <span className={hero ? 'text-white/85' : 'text-ink-2'}>{d}</span>
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-8">
              <div className={cn('flex items-center justify-between border-t pt-5', hero ? 'border-white/10' : 'border-line')}>
                <span className={cn('text-xs', hero ? 'text-white/60' : 'text-ink-3')}>
                  {g.saving ? <>Save <span className={cn('font-bold', hero ? 'text-white' : 'text-ink')}>{g.saving}</span> vs new</> : 'Original and boxed'}
                </span>
                <Link to={`/shop?condition=${c}`} className={cn('inline-flex items-center gap-1.5 text-sm font-semibold', hero ? 'text-white' : 'text-ink')}>
                  Shop <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
