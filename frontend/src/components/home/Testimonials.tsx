import { api } from '../../api';
import { useAsync } from '../../hooks/useAsync';
import { Stars } from '../ui/Rating';
import { Section, SectionHeading } from '../ui/Section';
import type { Review } from '../../types';
import { cn } from '../../lib/cn';

const TONES = ['bg-tint-mint text-success', 'bg-tint-sky text-info', 'bg-tint-lilac text-violet', 'bg-tint-peach text-brand-700', 'bg-tint-lemon text-warn'];
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');

function Card({ r, i }: { r: Review; i: number }) {
  return (
    <figure className="flex w-[320px] shrink-0 flex-col rounded-3xl border border-line bg-white p-6 md:w-[360px]">
      <div className="flex items-center justify-between">
        <Stars value={r.rating} size={14} />
        {r.productName && <span className="max-w-[55%] truncate rounded-full bg-cream px-2.5 py-1 text-[11px] font-semibold text-ink-2">{r.productName}</span>}
      </div>
      <blockquote className="mt-4 flex-1">
        <p className="font-display text-[16px] font-bold leading-snug">{r.title}</p>
        <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-ink-3">{r.body}</p>
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <span className={cn('flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ring-2 ring-white shadow-ring', TONES[i % TONES.length])}>{initials(r.author)}</span>
        <span className="text-xs">
          <span className="font-semibold text-ink">{r.author}</span>
          {r.verified && <span className="text-ink-3"> · Verified purchase</span>}
        </span>
      </figcaption>
    </figure>
  );
}

function Row({ items, reverse }: { items: Review[]; reverse?: boolean }) {
  const doubled = [...items, ...items];
  return (
    <div className="mask-fade-x overflow-hidden">
      <div className={cn('flex w-max gap-4 py-2', items.length > 2 ? (reverse ? 'animate-marquee [animation-direction:reverse]' : 'animate-marquee') : '')}>
        {doubled.map((r, i) => <Card key={`${r.id}-${i}`} r={r} i={i} />)}
      </div>
    </div>
  );
}

/** Latest approved reviews from the backend. The whole section hides until there are reviews to show. */
export function Testimonials() {
  const { data } = useAsync(() => api.getRecentReviews(12), []);
  if (!data || data.items.length === 0) return null;
  const items = data.items;
  const half = Math.ceil(items.length / 2);
  return (
    <Section className="overflow-hidden">
      <SectionHeading eyebrow="Reviews" title={<>What <span className="serif-accent text-ink-3">{data.total.toLocaleString('en-GB')} {data.total === 1 ? 'customer' : 'customers'}</span> say</>} blurb={`Rated ${data.average.toFixed(1)} out of 5 on ${data.total.toLocaleString('en-GB')} verified ${data.total === 1 ? 'review' : 'reviews'}.`} align="center" />
      <div className="space-y-4">
        <Row items={items.slice(0, half)} />
        {items.length > 1 && <Row items={items.slice(half)} reverse />}
      </div>
    </Section>
  );
}
