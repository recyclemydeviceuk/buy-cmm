import { ArrowUpRight, Banknote, Check, PackageCheck, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';

const STEPS = [
  { icon: Smartphone, label: 'Get a quote', sub: '60 seconds online' },
  { icon: PackageCheck, label: 'Post it free', sub: 'Prepaid label' },
  { icon: Banknote, label: 'Get paid', sub: 'Within 24 hours' },
];

export function TradeInBanner() {
  return (
    <div className="grid overflow-hidden rounded-[36px] lg:grid-cols-12">
      {/* Copy */}
      <div className="relative bg-ink p-8 text-white md:p-12 lg:col-span-7 lg:p-14">
        <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-brand-600/25 blur-3xl" aria-hidden />
        <p className="eyebrow relative text-brand-500">Trade in</p>
        <h2 className="relative mt-3 max-w-lg text-3xl text-white md:text-[2.75rem] md:leading-[1.05] text-balance">
          Sell your old phone. <span className="serif-accent text-white/80">Put it towards</span> the new one.
        </h2>
        <p className="relative mt-4 max-w-md text-white/65">Instant quote, free tracked postage, and money in your account within a day of it arriving. Most people cover a third of their next phone this way.</p>
        <div className="relative mt-8 flex flex-wrap gap-3">
          <a href="https://cashmymobile.co.uk" className="inline-flex h-12 items-center gap-2 rounded-full bg-brand-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-700">
            Get a quote <ArrowUpRight size={16} />
          </a>
          <Link to="/faq#ordering" className="inline-flex h-12 items-center gap-2 rounded-full border border-white/20 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10">
            How trade-in works
          </Link>
        </div>
        <ol className="relative mt-10 grid gap-3 sm:grid-cols-3">
          {STEPS.map(({ icon: Icon, label, sub }, i) => (
            <li key={label} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.05] px-4 py-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
                <Icon size={16} />
              </span>
              <span>
                <span className="block text-[13px] font-bold">{i + 1}. {label}</span>
                <span className="block text-[11px] text-white/55">{sub}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* Example quote */}
      <div className="relative flex items-center justify-center bg-brand-600 p-8 md:p-12 lg:col-span-5">
        <div className="pointer-events-none absolute inset-0 dot-grid opacity-[.12] [mask-image:radial-gradient(70%_70%_at_50%_50%,#000,transparent)]" aria-hidden />
        <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-float md:p-7">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Example quote</p>
            <span className="rounded-full bg-tint-mint px-2.5 py-1 text-[11px] font-bold text-success">Valid 14 days</span>
          </div>
          <div className="mt-5 flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-cream">
              <img src="/phones/apple-iphone-13.webp" alt="" className="h-12 w-12 product-img" />
            </span>
            <div>
              <p className="font-display text-lg font-bold leading-tight">iPhone 13</p>
              <p className="text-sm text-ink-3">128GB · Unlocked · Good condition</p>
            </div>
          </div>
          <dl className="mt-5 divide-y divide-line border-y border-line text-sm">
            <div className="flex items-center justify-between py-3"><dt className="text-ink-3">Works and turns on</dt><dd className="flex items-center gap-1 font-semibold text-success"><Check size={14} strokeWidth={3} /> Yes</dd></div>
            <div className="flex items-center justify-between py-3"><dt className="text-ink-3">Screen and body</dt><dd className="font-semibold">Light wear</dd></div>
            <div className="flex items-center justify-between py-3"><dt className="text-ink-3">Payment</dt><dd className="font-semibold">Bank transfer, 24h</dd></div>
          </dl>
          <div className="mt-5 flex items-end justify-between">
            <div>
              <p className="text-xs text-ink-3">We pay you</p>
              <p className="font-display text-4xl font-bold tracking-tightest text-ink">£198</p>
            </div>
            <a href="https://cashmymobile.co.uk" className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white transition-colors hover:bg-ink-2">
              Start mine <ArrowUpRight size={15} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
