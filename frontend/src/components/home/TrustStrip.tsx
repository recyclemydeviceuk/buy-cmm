import { ShieldCheck, Truck, RefreshCcw, BadgeCheck } from 'lucide-react';

const ITEMS = [
  { icon: BadgeCheck, tint: 'bg-tint-mint text-success', title: '40-point tested', body: 'Every phone, every time' },
  { icon: Truck, tint: 'bg-tint-sky text-sky-700', title: 'Free next-day delivery', body: 'Order by 3pm, tracked' },
  { icon: ShieldCheck, tint: 'bg-tint-peach text-brand-600', title: '12-month warranty', body: 'Repairs and replacements' },
  { icon: RefreshCcw, tint: 'bg-tint-lilac text-violet-700', title: '30-day returns', body: 'Full refund, no questions' },
];

/** White card that overlaps the bottom of the hero. */
export function TrustStrip() {
  return (
    <div className="container relative z-10 -mt-8">
      <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line shadow-card md:grid-cols-4">
        {ITEMS.map(({ icon: Icon, tint, title, body }) => (
          <li key={title} className="flex flex-col items-start gap-3 bg-white px-5 py-5 md:flex-row md:items-center md:gap-4 md:px-7">
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${tint}`}>
              <Icon size={21} strokeWidth={2} />
            </span>
            <div>
              <p className="text-sm font-bold">{title}</p>
              <p className="text-xs text-ink-3">{body}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
