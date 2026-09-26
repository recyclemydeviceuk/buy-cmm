import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const STEPS = [
  { n: '01', title: 'Pick a phone', body: 'Browse iPhone and Galaxy from the last seven years. Every one is fully tested and data-wiped.' },
  { n: '02', title: 'Choose what matters', body: 'Storage, network and cosmetic grade change the price. Pay for what you care about and skip what you don’t.' },
  { n: '03', title: 'It arrives tomorrow', body: 'Order before 3pm for free tracked next-day delivery, with a cable and 30 days to change your mind.' },
];

const STATS = [
  { value: '60%', label: 'average saving vs new' },
  { value: '40', label: 'checks before listing' },
  { value: '24h', label: 'order to doorstep' },
  { value: '80kg', label: 'CO₂ saved per phone' },
];

export function HowItWorks() {
  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-5">
        <p className="eyebrow text-white/50">How it works</p>
        <h2 className="mt-3 text-3xl leading-[1.08] text-white md:text-[2.75rem] text-balance">
          Three steps. <span className="serif-accent text-white/80">Zero</span> small print.
        </h2>
        <p className="mt-4 max-w-md text-white/60">Buying from us should feel like buying new, just with more money left in your account.</p>
        <Link to="/how-it-works" className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-ink transition-colors hover:bg-cream">
          See the full process <ArrowRight size={16} />
        </Link>
        <dl className="mt-12 grid grid-cols-2 gap-3">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <dt className="font-display text-3xl font-bold tracking-tightest text-white">{s.value}</dt>
              <dd className="mt-1 text-xs text-white/55">{s.label}</dd>
            </div>
          ))}
        </dl>
      </div>
      <ol className="space-y-3 lg:col-span-7">
        {STEPS.map((s) => (
          <li key={s.n} className="group flex gap-6 rounded-3xl border border-white/10 bg-white/[.04] p-6 transition-colors hover:bg-white/[.08] md:p-8">
            <span className="serif-accent text-4xl leading-none text-brand-500 md:text-5xl">{s.n}</span>
            <div>
              <h3 className="font-display text-xl font-bold text-white">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60 md:text-[15px]">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
