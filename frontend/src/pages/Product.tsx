import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, ShieldCheck, Truck, RefreshCcw, Check, ShoppingBag } from 'lucide-react';
import { api } from '../api';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useBasket } from '../store/basket';
import type { Condition } from '../types';
import { VariantPicker } from '../components/product/VariantPicker';
import { ProductRail } from '../components/product/ProductRail';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Stars } from '../components/ui/Rating';
import { Skeleton } from '../components/ui/Skeleton';
import { Section, SectionHeading } from '../components/ui/Section';
import { Accordion } from '../components/ui/Accordion';
import { CONDITIONS, money, savingsPct } from '../lib/format';
import { cn } from '../lib/cn';
import NotFound from './NotFound';

type Tab = 'specs' | 'box' | 'reviews';

export default function ProductPage() {
  const { slug = '' } = useParams();
  const product = useAsync(() => api.getProduct(slug), [slug]);
  const related = useAsync(() => api.getRelated(slug), [slug]);
  const reviews = useAsync(() => (product.data ? api.getReviews(product.data.id) : Promise.resolve([])), [product.data?.id]);
  const { add } = useBasket();
  const p = product.data;
  useDocumentTitle(p ? `${p.brand} ${p.name}` : undefined);

  const [selection, setSelection] = useState<{ storage: string; network: string; condition: Condition }>({ storage: '', network: 'Unlocked', condition: 'excellent' });
  const [tab, setTab] = useState<Tab>('specs');

  useEffect(() => {
    if (!p) return;
    const first = p.variants.filter((v) => v.stock > 0).sort((a, b) => a.price - b.price);
    const best = first.find((v) => v.condition === 'excellent' && v.network === 'Unlocked') ?? first.find((v) => v.condition === 'good' && v.network === 'Unlocked') ?? first[0];
    if (best) setSelection({ storage: best.storage, network: best.network, condition: best.condition });
    setTab('specs');
  }, [p]);

  const variant = useMemo(() => p?.variants.find((v) => v.storage === selection.storage && v.network === selection.network && v.condition === selection.condition), [p, selection]);
  const available = !!variant && variant.stock > 0;

  if (product.loading) {
    return (
      <div className="container grid gap-10 py-10 lg:grid-cols-12">
        <Skeleton className="aspect-square rounded-[32px] lg:col-span-6" />
        <div className="space-y-4 lg:col-span-6">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }
  if (!p) return <NotFound />;

  const save = variant ? savingsPct(variant.price, p.rrp) : 0;
  const specs: Array<[string, string]> = [
    ['Display', p.specs.display],
    ['Chip', p.specs.chip],
    ['Camera', p.specs.camera],
    ['Battery', p.specs.battery],
    ['Connectivity', p.specs.connectivity],
    ['Storage options', p.storages.join(' / ')],
    ['Networks', p.networks.join(', ')],
    ['Released', String(p.releaseYear)],
  ];
  const tint = p.brand === 'Apple' ? 'bg-tint-peach' : 'bg-tint-sky';
  const tabs: Array<[Tab, string]> = [['specs', 'Specifications'], ['box', 'Good to know'], ['reviews', `Reviews (${(reviews.data ?? []).length})`]];

  return (
    <>
      <div className="container pt-4 md:pt-6">
        <nav className="flex items-center gap-1.5 text-xs font-medium text-ink-3" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-ink">Home</Link>
          <ChevronRight size={12} />
          <Link to={`/shop?brand=${p.brand}`} className="hover:text-ink">{p.brand === 'Apple' ? 'iPhone' : 'Samsung Galaxy'}</Link>
          <ChevronRight size={12} />
          <span className="text-ink">{p.name}</span>
        </nav>
      </div>

      <div className="container grid gap-8 py-6 lg:grid-cols-12 lg:gap-12 lg:py-8">
        {/* Gallery */}
        <div className="lg:col-span-6">
          <div className="sticky top-28">
            <div className={cn('relative overflow-hidden rounded-[32px] p-8 md:p-12', tint)}>
              <div className="absolute left-5 top-5 flex gap-2">
                {save > 0 && <Badge tone="dark">Save {save}%</Badge>}
                {p.releaseYear >= 2026 && <Badge tone="brand">New in</Badge>}
              </div>
              <img src={p.image} alt={`${p.brand} ${p.name}`} className="mx-auto aspect-square w-full max-w-sm product-img" loading="eager" />
              <ul className="mt-2 flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-xs font-semibold text-ink-2">
                {['40-point tested', 'Data wiped', 'Blocklist checked', 'Cable included'].map((t) => (
                  <li key={t} className="flex items-center gap-1.5"><Check size={13} className="text-success" strokeWidth={3} /> {t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Buy panel */}
        <div className="lg:col-span-6">
          <p className="eyebrow">{p.brand} · {p.releaseYear}</p>
          <div className="mt-1.5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h1 className="text-3xl md:text-[2.4rem] md:leading-[1.05]">{p.name}</h1>
            <span className="flex items-center gap-1.5 text-sm"><Stars value={p.rating} size={13} /> <span className="font-semibold">{p.rating.toFixed(1)}</span><span className="text-ink-3">({p.reviewCount.toLocaleString('en-GB')})</span></span>
          </div>

          <div className="mt-4 flex flex-wrap items-baseline gap-x-3 border-y border-line py-4">
            <span className="font-display text-4xl font-bold tracking-tightest">{variant ? money(variant.price) : '—'}</span>
            {p.rrp > (variant?.price ?? 0) && <span className="text-sm text-ink-3"><span className="line-through">{money(p.rrp)}</span> new</span>}
            <span className="ml-auto text-xs text-ink-3">Includes VAT · Free next-day delivery{available && variant!.stock <= 2 && <span className="font-semibold text-brand-600"> · Only {variant!.stock} left</span>}</span>
          </div>

          <div className="mt-6">
            <VariantPicker product={p} selection={selection} onChange={setSelection} />
          </div>

          <p className="mt-4 text-xs text-ink-3"><span className="font-semibold text-ink">{CONDITIONS[selection.condition].label}:</span> {CONDITIONS[selection.condition].blurb}</p>

          <Button size="lg" disabled={!available} onClick={() => variant && add(p, variant)} className="mt-5 w-full">
            <ShoppingBag size={18} />
            {available ? `Add to basket · ${money(variant!.price)}` : 'Sold out in this configuration'}
          </Button>

          <ul className="mt-5 grid grid-cols-3 gap-2 text-[11px] leading-tight text-ink-2">
            {[
              [Truck, 'Next-day delivery', 'Free, order by 3pm'],
              [ShieldCheck, '12-month warranty', 'Repair or replace'],
              [RefreshCcw, '30-day returns', 'Full refund'],
            ].map(([Icon, t, sub]) => {
              const I = Icon as typeof Truck;
              return (
                <li key={String(t)} className="flex items-center gap-2 rounded-xl border border-line px-3 py-2">
                  <I size={15} className="shrink-0 text-ink" />
                  <span><span className="block font-bold text-ink">{String(t)}</span>{String(sub)}</span>
                </li>
              );
            })}
          </ul>

          {/* Tabs */}
          <div className="mt-10">
            <div className="flex gap-6 border-b border-line" role="tablist">
              {tabs.map(([key, label]) => (
                <button key={key} type="button" role="tab" aria-selected={tab === key} onClick={() => setTab(key)} className={cn('-mb-px border-b-2 pb-3 text-sm font-semibold transition-colors', tab === key ? 'border-ink text-ink' : 'border-transparent text-ink-3 hover:text-ink')}>
                  {label}
                </button>
              ))}
            </div>
            <div className="pt-5">
              {tab === 'specs' && (
                <dl className="grid gap-x-8 sm:grid-cols-2">
                  {specs.map(([k, v]) => (
                    <div key={k} className="flex items-baseline justify-between gap-4 border-b border-line-2 py-2.5 text-sm">
                      <dt className="text-ink-3">{k}</dt>
                      <dd className="text-right font-semibold">{v}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {tab === 'box' && (
                <Accordion
                  variant="plain"
                  defaultOpen={0}
                  items={[
                    { q: 'What comes with the phone?', a: 'The phone, a USB charging cable and a SIM tool, in plain protective packaging. We don’t include a plug or earphones; most people already have them and it keeps the price and packaging down.' },
                    { q: `Is this ${p.name} unlocked?`, a: `Choose “Unlocked” above and it works with any UK SIM. Network-locked phones are cheaper and only work on that network (or an MVNO that uses it) until unlocked.` },
                    { q: 'How is battery health checked?', a: `Every ${p.name} is checked with the manufacturer’s own diagnostics. Excellent phones have 90%+ battery health, Good 85%+, Fair 80%+. If a battery is below the threshold we replace it before sale.` },
                    { q: 'What does the warranty cover?', a: 'Any hardware fault that isn’t accidental damage for 12 months: battery, screen, buttons, cameras, speakers, charging port. We collect, repair or replace, and return it for free.' },
                  ]}
                />
              )}
              {tab === 'reviews' && (
                <ul className="divide-y divide-line-2">
                  {(reviews.data ?? []).map((r) => (
                    <li key={r.id} className="py-4">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm font-bold">{r.title}</p>
                        <Stars value={r.rating} size={12} />
                      </div>
                      <p className="mt-1 text-sm text-ink-3">{r.body}</p>
                      <p className="mt-1.5 text-xs text-ink-2"><span className="font-semibold">{r.author}</span> · {new Date(r.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · <span className="text-success">Verified purchase</span></p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {(related.data?.length ?? 0) > 0 && (
        <Section className="py-12 md:py-16">
          <SectionHeading eyebrow="You might also like" title="Similar phones" action={{ label: `All ${p.brand === 'Apple' ? 'iPhone' : 'Samsung'}`, to: `/shop?brand=${p.brand}` }} />
          <ProductRail products={related.data ?? []} loading={related.loading} />
        </Section>
      )}
    </>
  );
}
