import { useMemo, useState } from 'react';
import { useSiteContact } from '../store/catalog';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Mail, Search } from 'lucide-react';
import { WhatsAppIcon } from '../components/ui/WhatsAppIcon';
import { useSeo, breadcrumbLd } from '../lib/seo';
import { Accordion } from '../components/ui/Accordion';

const GROUPS: Array<{ id: string; title: string; blurb: string; items: Array<{ q: string; a: string }> }> = [
  {
    id: 'ordering',
    title: 'Ordering',
    blurb: 'What you are buying and how to pay for it.',
    items: [
      { q: 'Are these phones new?', a: 'No. Every phone is pre-owned and professionally restored. It has been fully tested, data-wiped and graded for cosmetic condition. Functionally it is as good as new, and it is a lot cheaper.' },
      { q: 'What is the difference between Unlocked and a network?', a: 'Unlocked phones work with any SIM card from any UK network. Network-locked phones are cheaper but only work on that network (and virtual networks that run on it) until you unlock them, which the network can usually do for free after a set period.' },
      { q: 'Can I pay in instalments?', a: 'Not yet. We are adding Klarna and PayPal Pay in 3 later this year. For now we accept all major debit and credit cards.' },
      { q: 'Do you do trade-ins?', a: 'Yes, through our sell site. Get an instant quote for your old phone at cashmymobile.co.uk, post it to us free, and we pay you within a day of receiving it.' },
    ],
  },
  {
    id: 'delivery',
    title: 'Delivery',
    blurb: 'Free, tracked and usually with you tomorrow.',
    items: [
      { q: 'How fast is delivery?', a: 'Order before 3pm Monday to Friday and it ships the same day on a tracked next-day service with a signature on delivery. Orders after 3pm or at the weekend ship the next working day.' },
      { q: 'Is delivery really free?', a: 'Yes, on every order, to any UK address including Northern Ireland, the Highlands and the Channel Islands.' },
      { q: 'How is it packaged?', a: 'The phone sits in a moulded insert inside a plain box with a charging cable and a SIM tool. There is nothing on the outside that says what is inside.' },
    ],
  },
  {
    id: 'warranty',
    title: 'Warranty and returns',
    blurb: '12 months of cover and 30 days to change your mind.',
    items: [
      { q: 'What does the 12-month warranty cover?', a: 'Any hardware fault that is not accidental damage: battery, screen, buttons, cameras, speakers, charging port, connectivity. We collect the phone, repair or replace it, and send it back, all free.' },
      { q: 'What is not covered?', a: 'Accidental damage such as drops or liquid, normal battery wear beyond the grade threshold, and faults caused by third-party repairs.' },
      { q: 'Can I return it if I change my mind?', a: 'Yes. You have 30 days from delivery to return the phone for a full refund. It just needs to come back in the condition it arrived, with the accessories. We send a free returns label.' },
      { q: 'What if the phone is not as described?', a: 'Tell us within 30 days and we will collect it, refund you in full or replace it, and cover the postage both ways.' },
    ],
  },
  {
    id: 'about',
    title: 'About CashMyMobile',
    blurb: 'Who we are and where the phones come from.',
    items: [
      { q: 'Who are you?', a: 'CashMyMobile is a UK phone recycler based in the North West. We have bought used phones from the public since 2019, which is exactly where our stock comes from. Every phone is graded and tested in-house.' },
      { q: 'Where do the phones come from?', a: 'From people who sold their phone to us through cashmymobile.co.uk, plus UK business fleets upgrading their handsets. We do not import grey-market stock.' },
    ],
  },
];

export default function Faq() {
  const { SUPPORT_EMAIL, WHATSAPP_DISPLAY, WHATSAPP_URL } = useSiteContact();
  useSeo({
    title: 'Help centre: ordering, delivery, warranty and returns',
    description: 'Answers on ordering, unlocked vs network phones, free next-day delivery, the 12-month warranty and 30-day returns at CashMyMobile.',
    canonical: '/faq',
    jsonLd: [
      { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: GROUPS.flatMap((g) => g.items).map((it) => ({ '@type': 'Question', name: it.q, acceptedAnswer: { '@type': 'Answer', text: it.a } })) },
      breadcrumbLd([['Home', '/'], ['Help centre', '/faq']]),
    ],
  });
  const [q, setQ] = useState('');
  const term = q.trim().toLowerCase();
  const groups = useMemo(
    () => (term ? GROUPS.map((g) => ({ ...g, items: g.items.filter((it) => `${it.q} ${it.a}`.toLowerCase().includes(term)) })).filter((g) => g.items.length) : GROUPS),
    [term],
  );
  const total = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <>
      {/* Hero with search */}
      <section className="container pt-6 md:pt-12">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow text-brand-600">Help centre</p>
          <h1 className="mt-4 text-4xl md:text-[3.5rem] md:leading-[1.02]">How can we <span className="serif-accent text-ink-3">help?</span></h1>
          <label className="mx-auto mt-8 flex h-14 max-w-xl items-center gap-3 rounded-full border border-line bg-white pl-5 pr-2 shadow-card transition-shadow focus-within:shadow-float">
            <Search size={18} className="shrink-0 text-ink-3" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search delivery, warranty, unlocking…" className="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-ink-4" />
            {q && <button type="button" onClick={() => setQ('')} className="rounded-full px-3 py-1.5 text-xs font-semibold text-ink-3 hover:bg-cream">Clear</button>}
          </label>
        </div>
        <nav className="mt-8 flex flex-wrap justify-center gap-2" aria-label="FAQ sections">
          {GROUPS.map((g) => (
            <a key={g.id} href={`#${g.id}`} className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink-2 transition-colors hover:border-ink hover:text-ink">{g.title}</a>
          ))}
        </nav>
      </section>

      {/* Groups */}
      <section className="container py-16 md:py-20">
        {total === 0 ? (
          <div className="mx-auto max-w-md rounded-[28px] bg-cream p-10 text-center">
            <p className="font-display text-lg font-bold">Nothing matches “{q.trim()}”</p>
            <p className="mt-1 text-sm text-ink-3">Try a different word, or ask us directly.</p>
            <Link to="/contact" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold">Get in touch <ArrowRight size={14} /></Link>
          </div>
        ) : (
          <div className="divide-y divide-line">
            {groups.map((g) => (
              <div key={g.id} id={g.id} className="grid scroll-mt-28 gap-6 py-12 first:pt-0 lg:grid-cols-12 lg:gap-12">
                <div className="lg:col-span-4">
                  <div className="lg:sticky lg:top-32">
                    <h2 className="text-2xl md:text-3xl">{g.title}</h2>
                    <p className="mt-2 max-w-xs text-ink-3">{g.blurb}</p>
                  </div>
                </div>
                <div className="lg:col-span-8">
                  <Accordion items={g.items} defaultOpen={term ? 0 : null} variant="plain" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Contact strip */}
      <section className="container pb-8">
        <div className="grid gap-3 md:grid-cols-3">
          <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="group flex items-center gap-4 rounded-[24px] border border-line p-5 transition-colors hover:bg-cream-2">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white"><WhatsAppIcon size={18} /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold">WhatsApp us</span>
              <span className="block truncate text-sm text-ink-3">{WHATSAPP_DISPLAY}</span>
            </span>
            <ArrowRight size={16} className="text-ink-4 transition-transform group-hover:translate-x-0.5" />
          </a>
          <a href={`mailto:${SUPPORT_EMAIL}`} className="group flex items-center gap-4 rounded-[24px] border border-line p-5 transition-colors hover:bg-cream-2">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cream"><Mail size={18} /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold">Email us</span>
              <span className="block truncate text-sm text-ink-3">{SUPPORT_EMAIL}</span>
            </span>
            <ArrowRight size={16} className="text-ink-4 transition-transform group-hover:translate-x-0.5" />
          </a>
          <Link to="/contact" className="group flex items-center gap-4 rounded-[24px] border border-line p-5 transition-colors hover:bg-cream-2">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cream"><Clock size={18} /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold">Send a message</span>
              <span className="block truncate text-sm text-ink-3">Reply within one working day</span>
            </span>
            <ArrowRight size={16} className="text-ink-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>
    </>
  );
}
