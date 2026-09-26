import { Star } from 'lucide-react';
import { Stars } from '../ui/Rating';
import { cn } from '../../lib/cn';

interface Quote {
  name: string;
  rating: number;
  title: string;
  body: string;
  bought: string;
  photo: string;
}

const QUOTES: Quote[] = [
  { name: 'Hannah M.', photo: '/avatars/1.jpg', rating: 5, title: 'Honestly looks brand new', body: 'Ordered in Excellent condition and I genuinely cannot find a mark on it. Battery was at 96%.', bought: 'iPhone 15 · Excellent' },
  { name: 'Daniel O.', photo: '/avatars/2.jpg', rating: 5, title: 'Saved over £300 vs new', body: 'Went for Good to save a bit more. A couple of tiny scuffs on the frame, exactly as described.', bought: 'Galaxy S24 · Good' },
  { name: 'Priya S.', photo: '/avatars/3.jpg', rating: 4, title: 'Great phone, quick delivery', body: 'Spotless and well packaged. Would have liked a charger included, but the price makes up for it.', bought: 'iPhone 13 · Excellent' },
  { name: 'Tom R.', photo: '/avatars/4.jpg', rating: 5, title: 'Second phone I have bought here', body: 'One for my son last year and now one for me. Both were exactly as graded and unlocked as promised.', bought: 'iPhone 14 · Good' },
  { name: 'Aisha K.', photo: '/avatars/5.jpg', rating: 5, title: 'Arrived the next morning', body: 'Ordered at 2pm, it was on my doorstep before 10 the next day. Set up in minutes.', bought: 'Galaxy Z Flip 6 · Excellent' },
  { name: 'Marcus W.', photo: '/avatars/6.jpg', rating: 5, title: 'Fair grade, flawless phone', body: 'Bought Fair to save money. A few marks on the back but the screen is perfect and it runs like new.', bought: 'iPhone 12 · Fair' },
  { name: 'Sophie L.', photo: '/avatars/7.jpg', rating: 5, title: 'Warranty actually works', body: 'Speaker went after four months. They collected it, replaced it and had it back to me in five days.', bought: 'Galaxy S22 · Good' },
  { name: 'James P.', photo: '/avatars/8.jpg', rating: 4, title: 'Better than the network deal', body: 'Cheaper than the upgrade my network offered, and I own it outright. Battery at 91% as listed.', bought: 'iPhone 16 Pro · Excellent' },
];

function Card({ q }: { q: Quote }) {
  return (
    <figure className="flex w-[320px] shrink-0 flex-col rounded-3xl border border-line bg-white p-6 md:w-[360px]">
      <div className="flex items-center justify-between">
        <Stars value={q.rating} size={14} />
        <span className="rounded-full bg-cream px-2.5 py-1 text-[11px] font-semibold text-ink-2">{q.bought}</span>
      </div>
      <blockquote className="mt-4 flex-1">
        <p className="font-display text-[16px] font-bold leading-snug">{q.title}</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-3">{q.body}</p>
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <img src={q.photo} alt="" loading="lazy" className="h-9 w-9 rounded-full object-cover ring-2 ring-white shadow-ring" />
        <span className="text-xs">
          <span className="font-semibold text-ink">{q.name}</span>
          <span className="text-ink-3"> · Verified purchase</span>
        </span>
      </figcaption>
    </figure>
  );
}

function Row({ items, reverse = false }: { items: Quote[]; reverse?: boolean }) {
  return (
    <div className="group/row mask-fade-x overflow-hidden">
      <div className={cn('flex w-max gap-4 animate-marquee group-hover/row:[animation-play-state:paused]', reverse && '[animation-direction:reverse]')}>
        {[...items, ...items].map((q, i) => <Card key={`${q.name}-${i}`} q={q} />)}
      </div>
    </div>
  );
}

/** White reviews band: rating summary, then two marquee rows of cards scrolling in opposite directions. */
export function Testimonials() {
  return (
    <div>
      <div className="mx-auto -mt-4 mb-10 flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm md:mb-12">
        <span className="flex items-center gap-2 rounded-full border border-line px-4 py-2">
          <span className="font-display text-lg font-bold">4.8</span>
          <span className="flex items-center gap-0.5 text-amber-400">{[1, 2, 3, 4, 5].map((i) => <Star key={i} size={13} className="fill-amber-400" strokeWidth={0} />)}</span>
          <span className="text-ink-3">12,400 reviews</span>
        </span>
        <span className="flex items-center gap-2 rounded-full border border-line px-4 py-2"><span className="font-display text-lg font-bold">96%</span><span className="text-ink-3">would buy again</span></span>
        <span className="flex items-center gap-2 rounded-full border border-line px-4 py-2"><span className="font-display text-lg font-bold">24h</span><span className="text-ink-3">average delivery</span></span>
      </div>
      <div className="-mx-5 space-y-4 md:-mx-10">
        <Row items={QUOTES.slice(0, 4).concat(QUOTES.slice(4))} />
        <Row items={QUOTES.slice(4).concat(QUOTES.slice(0, 4))} reverse />
      </div>
    </div>
  );
}
