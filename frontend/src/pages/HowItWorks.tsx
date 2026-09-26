import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Battery, Check, PackageCheck, Search, ShieldCheck, SlidersHorizontal, Smile, Sparkles, X } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Button } from '../components/ui/Button';
import { CONDITIONS, CONDITION_ORDER } from '../lib/format';
import type { Condition } from '../types';
import { cn } from '../lib/cn';

const STEPS = [
  { icon: Search, title: 'Pick a phone', body: 'Browse iPhone and Galaxy models from the last seven years. Every one has been fully tested and data-wiped.', fact: 'Under 2 minutes to choose', tint: 'bg-tint-lemon' },
  { icon: SlidersHorizontal, title: 'Choose what matters', body: 'Storage, network lock and cosmetic condition all change the price. Pay for what you care about and skip what you don’t.', fact: '3 grades, 5 networks', tint: 'bg-tint-sky' },
  { icon: PackageCheck, title: 'Delivered tomorrow', body: 'Order before 3pm for free tracked next-day delivery. Your phone arrives in protective packaging with a charging cable.', fact: 'Free, tracked, signed for', tint: 'bg-tint-mint' },
  { icon: Smile, title: 'Love it or return it', body: '30 days to change your mind, no questions asked, plus a 12-month warranty for anything that isn’t cosmetic.', fact: '30 days · 12 months', tint: 'bg-tint-peach' },
];

const GRADE_META: Record<Condition, { letter: string; battery: string; saving: string; screen: string; body: string; image: string; tint: string }> = {
  excellent: { letter: 'A', battery: '90%+', saving: '30–45%', screen: 'No scratches', body: 'Micro-marks only', image: '/phones/apple-iphone-15.webp', tint: 'bg-tint-mint' },
  good: { letter: 'B', battery: '85%+', saving: '40–55%', screen: 'Hairline, invisible when on', body: 'Light scuffs', image: '/phones/apple-iphone-14.webp', tint: 'bg-tint-sky' },
  fair: { letter: 'C', battery: '80%+', saving: '50–65%', screen: 'Visible, no cracks', body: 'Scuffs, dents or chips', image: '/phones/apple-iphone-12.webp', tint: 'bg-tint-lemon' },
};

const CHECKS = [
  'Screen touch, dead pixels and burn-in',
  'True Tone and colour accuracy',
  'Battery health and charge cycles',
  'Rear cameras, focus and OIS',
  'Front camera and flash',
  'Face ID or fingerprint sensor',
  'Speakers, microphones, earpiece',
  'Charging port and wireless charging',
  'Wi-Fi, Bluetooth, 4G / 5G',
  'GPS and NFC',
  'Buttons, vibration motor, sensors',
  'IMEI blocklist and finance check',
  'Activation lock and account removal',
  'Factory reset and firmware update',
  'Cosmetic grading under studio lighting',
];

const NEVER = ['Cracked screens or back glass', 'Water damage indicator triggered', 'Reported lost, stolen or on finance', 'Batteries below 80% health', 'Non-genuine screens that fail colour or touch', 'Account locks we cannot remove'];

export default function HowItWorks() {
  useDocumentTitle('How it works');
  const [grade, setGrade] = useState<Condition>('excellent');
  const g = GRADE_META[grade];

  return (
    <>
      {/* Hero */}
      <section className="container pt-6 md:pt-10">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="eyebrow text-brand-600">How it works</p>
            <h1 className="mt-4 text-4xl md:text-[3.75rem] md:leading-[1.02] text-balance">
              From our bench <span className="serif-accent text-ink-3">to your</span> doorstep.
            </h1>
          </div>
          <div className="lg:col-span-5 lg:pb-2">
            <p className="max-w-md text-[17px] text-ink-2">Every phone passes the same 40-point functional test. The grade only describes cosmetic wear, and it is checked by a person, not a photo.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button to="/shop" variant="dark">Shop phones <ArrowRight size={16} /></Button>
              <a href="#grades" className="inline-flex h-12 items-center gap-2 rounded-full border border-line px-6 text-sm font-semibold hover:border-ink">See the grades</a>
            </div>
          </div>
        </div>
        <dl className="mt-12 grid grid-cols-2 divide-x divide-line border-y border-line md:grid-cols-4">
          {[
            ['40', 'functional checks'],
            ['3', 'honest grades'],
            ['24h', 'order to doorstep'],
            ['12', 'months of warranty'],
          ].map(([v, l]) => (
            <div key={l} className="px-5 py-6 first:pl-0 md:px-8">
              <dt className="font-display text-3xl font-bold tracking-tightest md:text-4xl">{v}</dt>
              <dd className="mt-1 text-sm text-ink-3">{l}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Process timeline */}
      <section className="container py-20 md:py-28">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <p className="eyebrow text-brand-600">The process</p>
              <h2 className="mt-3 text-3xl md:text-4xl">Four steps, no small print.</h2>
              <p className="mt-4 max-w-sm text-ink-3">Buying from us should feel like buying new, just with more money left in your account.</p>
            </div>
          </div>
          <ol className="lg:col-span-8">
            {STEPS.map(({ icon: Icon, title, body, fact, tint }, i) => (
              <li key={title} className="group grid grid-cols-[64px_1fr] gap-6 border-t border-line py-8 last:border-b md:grid-cols-[96px_1fr] md:py-10">
                <span className="serif-accent text-4xl leading-none text-ink-3 transition-colors group-hover:text-brand-600 md:text-5xl">0{i + 1}</span>
                <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-start">
                  <div>
                    <h3 className="font-display text-2xl font-bold">{title}</h3>
                    <p className="mt-2 max-w-md text-ink-3">{body}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-cream px-3 py-1 text-xs font-semibold text-ink-2"><Sparkles size={12} /> {fact}</span>
                  </div>
                  <span className={cn('flex h-16 w-16 items-center justify-center rounded-2xl transition-transform group-hover:-rotate-6', tint)}>
                    <Icon size={26} strokeWidth={1.75} />
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Grades: interactive switcher */}
      <section id="grades" className="scroll-mt-28 bg-cream py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow text-brand-600">Condition grades</p>
            <h2 className="mt-3 text-3xl md:text-4xl">Same phone. Same warranty. <span className="serif-accent text-ink-3">You choose</span> how it looks.</h2>
          </div>
          <div className="mx-auto mt-8 flex w-fit rounded-full border border-line bg-white p-1" role="tablist">
            {CONDITION_ORDER.map((c) => (
              <button key={c} type="button" role="tab" aria-selected={grade === c} onClick={() => setGrade(c)} className={cn('flex h-10 items-center gap-2 rounded-full px-5 text-sm font-semibold transition-all', grade === c ? 'bg-ink text-white' : 'text-ink-2 hover:text-ink')}>
                <span className={cn('flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold', grade === c ? 'bg-white/20' : 'bg-cream')}>{GRADE_META[c].letter}</span>
                {CONDITIONS[c].label}
              </button>
            ))}
          </div>

          <div key={grade} className="mx-auto mt-10 grid max-w-5xl gap-4 animate-pop lg:grid-cols-12">
            <div className={cn('flex items-center justify-center rounded-[32px] p-10 lg:col-span-5', g.tint)}>
              <img src={g.image} alt="" className="h-72 w-auto product-img" />
            </div>
            <div className="rounded-[32px] border border-line bg-white p-8 lg:col-span-7 md:p-10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">Grade {g.letter}</p>
                  <h3 className="mt-1 font-display text-3xl font-bold">{CONDITIONS[grade].label}</h3>
                  <p className="mt-1 text-ink-3">{CONDITIONS[grade].short}</p>
                </div>
                <span className="rounded-full bg-tint-mint px-3 py-1.5 text-xs font-bold text-success">Save {g.saving} vs new</span>
              </div>
              <dl className="mt-6 grid grid-cols-3 gap-3">
                {[
                  ['Screen', g.screen],
                  ['Body', g.body],
                  ['Battery', g.battery],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-2xl bg-cream-2 p-4">
                    <dt className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-3">{k}</dt>
                    <dd className="mt-1 text-sm font-semibold leading-snug">{v}</dd>
                  </div>
                ))}
              </dl>
              <ul className="mt-6 space-y-2">
                {CONDITIONS[grade].detail.map((d) => (
                  <li key={d} className="flex items-start gap-2.5 text-sm text-ink-2"><Check size={15} className="mt-0.5 shrink-0 text-success" strokeWidth={3} /> {d}</li>
                ))}
              </ul>
              <div className="mt-7 flex items-center justify-between border-t border-line pt-5">
                <span className="flex items-center gap-2 text-xs text-ink-3"><ShieldCheck size={14} /> 12-month warranty on every grade</span>
                <Link to={`/shop?condition=${grade}`} className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline">Shop {CONDITIONS[grade].label.toLowerCase()} <ArrowRight size={14} /></Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 40-point check */}
      <section className="container py-20 md:py-28">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <p className="eyebrow text-brand-600">Functional testing</p>
              <h2 className="mt-3 text-3xl md:text-4xl">The 40-point check every phone passes.</h2>
              <p className="mt-4 max-w-sm text-ink-3">If a phone fails any point it is repaired with quality parts or it does not go on sale. There is no grade for “mostly works”.</p>
              <div className="mt-8 flex items-center gap-4 rounded-2xl border border-line p-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white"><Battery size={20} /></span>
                <p className="text-sm"><span className="font-bold">Below 80% battery?</span><br /><span className="text-ink-3">We fit a new one before it is listed.</span></p>
              </div>
            </div>
          </div>
          <ol className="grid gap-x-10 sm:grid-cols-2 lg:col-span-8">
            {CHECKS.map((c, i) => (
              <li key={c} className="flex items-baseline gap-4 border-b border-line-2 py-3.5 text-[15px]">
                <span className="w-6 shrink-0 text-xs font-bold tabular-nums text-ink-4">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-ink-2">{c}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Never sell + CTA */}
      <section className="container pb-8">
        <div className="grid overflow-hidden rounded-[36px] border border-line lg:grid-cols-12">
          <div className="p-8 md:p-12 lg:col-span-5">
            <p className="eyebrow text-brand-600">What we never sell</p>
            <h2 className="mt-3 text-3xl md:text-4xl">Some phones don’t make the cut.</h2>
            <Button to="/shop" variant="dark" className="mt-8">Shop tested phones <ArrowRight size={16} /></Button>
          </div>
          <ul className="grid gap-x-8 border-t border-line p-8 sm:grid-cols-2 md:p-12 lg:col-span-7 lg:border-l lg:border-t-0">
            {NEVER.map((t) => (
              <li key={t} className="flex items-center gap-3 border-b border-line-2 py-3.5 text-sm text-ink-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600"><X size={12} strokeWidth={3} /></span> {t}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
