import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Condition, GradePhoto } from '../../types';
import { CONDITIONS } from '../../lib/format';
import { cn } from '../../lib/cn';

interface Props {
  condition: Condition;
  photos: GradePhoto[];
  className?: string;
}

/** What a phone in this grade typically looks like: a real example photo with the grade's promises over it. */
export function GradeExample({ condition, photos, className }: Props) {
  const [index, setIndex] = useState(0);
  const g = CONDITIONS[condition];
  const photo = photos[Math.min(index, photos.length - 1)];
  if (!photo) return null;
  const chips = [g.short, ...g.facts.filter(([k]) => k === 'Battery').map(([k, v]) => `${k} ${v}`)];
  const step = (by: number) => setIndex((i) => (i + by + photos.length) % photos.length);

  return (
    <figure className={cn('relative overflow-hidden rounded-[32px] bg-ink', className)}>
      <img src={photo.url} alt={`Example of a phone in ${g.label} condition${photo.caption ? `: ${photo.caption.toLowerCase()}` : ''}`} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/70 to-transparent" aria-hidden />
      <span className="absolute right-4 top-4 rounded-full bg-ink/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">Example image</span>
      <figcaption className="absolute inset-x-4 bottom-4">
        <div className="flex items-end justify-between gap-3">
          <span className="rounded-full bg-ink/60 px-3 py-1 font-display text-sm font-bold text-white backdrop-blur">{photo.caption || g.label}</span>
          {photos.length > 1 && (
            <span className="flex gap-1.5">
              <button type="button" onClick={() => step(-1)} aria-label="Previous example photo" className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink transition-transform hover:scale-105 focus-ring"><ChevronLeft size={16} /></button>
              <button type="button" onClick={() => step(1)} aria-label="Next example photo" className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink transition-transform hover:scale-105 focus-ring"><ChevronRight size={16} /></button>
            </span>
          )}
        </div>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <li key={c} className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-ink">{c}</li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}
