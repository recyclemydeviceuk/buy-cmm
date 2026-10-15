import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, ShieldCheck, Truck, RefreshCcw, Check, ShoppingBag } from 'lucide-react';
import { api } from '../api';
import { useAsync } from '../hooks/useAsync';
import { useSeo, breadcrumbLd, SITE_URL } from '../lib/seo';
import { useBasket } from '../store/basket';
import { useGradePhotos } from '../store/catalog';
import { VariantPicker, settle, type Selection } from '../components/product/VariantPicker';
import { GradeExample } from '../components/product/GradeExample';
import { ProductRail } from '../components/product/ProductRail';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Stars } from '../components/ui/Rating';
import { Skeleton } from '../components/ui/Skeleton';
import { Section, SectionHeading } from '../components/ui/Section';
import { ReviewForm } from '../components/product/ReviewForm';
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
  const gradePhotos = useGradePhotos();
  const p = product.data;
  const inStock = p ? p.variants.filter((v) => v.stock > 0) : [];
  const maxPrice = inStock.length ? Math.max(...inStock.map((v) => v.price)) : undefined;
  useSeo({
    title: p ? `${p.brand === 'Apple' ? '' : 'Samsung '}${p.name}${inStock.length ? ` from ${money(p.fromPrice)}` : ''}` : undefined,
    description: p ? `Buy a pre-owned ${p.brand === 'Apple' ? 'Apple' : 'Samsung'} ${p.name}${inStock.length ? ` from ${money(p.fromPrice)}` : ''}. ${p.specs.display}, ${p.specs.chip}, ${p.specs.camera}. Unlocked. Choose colour, storage and condition. 12-month warranty, free next-day delivery.` : undefined,
    canonical: p ? `/phones/${p.slug}` : undefined,
    image: p ? p.image : undefined,
    type: 'product',
    jsonLd: p
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: `${p.brand} ${p.name}`,
            image: [/^https?:/.test(p.image) ? p.image : `${SITE_URL}${p.image}`],
            description: `Pre-owned ${p.brand} ${p.name}, tested on 40 points and graded by hand. ${p.specs.display}, ${p.specs.chip}, ${p.specs.camera}, ${p.specs.battery}.`,
            brand: { '@type': 'Brand', name: p.brand },
            sku: p.id,
            url: `${SITE_URL}/phones/${p.slug}`,
            ...(p.reviewCount > 0 ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: p.rating, reviewCount: p.reviewCount } } : {}),
            offers: { '@type': 'AggregateOffer', priceCurrency: 'GBP', lowPrice: p.fromPrice, highPrice: maxPrice ?? p.fromPrice, offerCount: inStock.length, availability: inStock.length ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock', itemCondition: 'https://schema.org/RefurbishedCondition', url: `${SITE_URL}/phones/${p.slug}` },
          },
          breadcrumbLd([['Home', '/'], [p.brand === 'Apple' ? 'iPhone' : 'Samsung Galaxy', `/shop?brand=${p.brand}`], [p.name, `/phones/${p.slug}`]]),
        ]
      : undefined,
  });

  const [selection, setSelection] = useState<Selection>({ storage: '', colour: '', condition: 'excellent' });
  const [tab, setTab] = useState<Tab>('specs');
  /** The gallery shows the phone, or an example of the grade once the shopper picks one. */
  const [view, setView] = useState<'phone' | 'grade'>('phone');

  useEffect(() => {
    if (!p) return;
    const first = p.variants.filter((v) => v.stock > 0).sort((a, b) => a.price - b.price);
    const best = first.find((v) => v.condition === 'excellent') ?? first.find((v) => v.condition === 'good') ?? first[0] ?? p.variants[0];
    // Phones with colour options start without one picked: the shopper has to choose before adding to the basket.
    if (best) setSelection({ storage: best.storage, colour: p.colours.length ? '' : best.colour, condition: best.condition });
    setTab('specs');
    setView('phone');
  }, [p]);

  const variant = useMemo(() => p?.variants.find((v) => v.storage === selection.storage && v.colour === selection.colour && v.condition === selection.condition), [p, selection]);
  const needsColour = !!p && p.colours.length > 0 && selection.colour === '';
  const available = !!variant && variant.stock > 0;
  /** Cheapest in-stock price for the chosen storage and grade while the colour is still open. */
  const fromPrice = useMemo(() => {
    if (!p || !needsColour) return null;
    const live = p.variants.filter((v) => v.stock > 0 && v.storage === selection.storage && v.condition === selection.condition);
    return live.length ? Math.min(...live.map((v) => v.price)) : null;
  }, [p, needsColour, selection.storage, selection.condition]);

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
    ...(p.colours.length ? [['Colours', p.colours.map((c) => c.name).join(', ')] as [string, string]] : []),
    ['Network', 'Unlocked'],
    ['Released', String(p.releaseYear)],
  ];
  const tabs: Array<[Tab, string]> = [['specs', 'Specifications'], ['box', 'Good to know'], ['reviews', `Reviews (${(reviews.data ?? []).length})`]];
  const soldOut = inStock.length === 0;
  const colourPhoto = p.colours.find((c) => c.name === selection.colour)?.image;
  const image = colourPhoto || p.image;
  // A colour's own photo sits on neutral cream so a white or silver phone is not read as the tile's tint.
  const tint = colourPhoto ? 'bg-cream' : p.brand === 'Apple' ? 'bg-tint-peach' : 'bg-tint-sky';
  const photos = gradePhotos[selection.condition] ?? [];
  const showGrade = view === 'grade' && photos.length > 0;
  const choose = (next: Selection, changed: keyof Selection) => {
    setSelection(settle(p.variants, next, changed));
    setView(changed === 'condition' ? 'grade' : 'phone');
  };

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
            {showGrade ? (
              <GradeExample key={selection.condition} condition={selection.condition} photos={photos} className="aspect-square animate-pop" />
            ) : (
              <div className={cn('relative overflow-hidden rounded-[32px] p-8 md:p-12', tint)}>
                <div className="absolute left-5 top-5 flex gap-2">
                  {save > 0 && available && <Badge tone="dark">Save {save}%</Badge>}
                  {p.releaseYear >= 2026 && <Badge tone="brand">New in</Badge>}
                </div>
                <img key={image} src={image} alt={[p.brand, p.name, selection.colour].filter(Boolean).join(' ')} className="mx-auto aspect-square w-full max-w-sm animate-pop product-img" loading="eager" />
                <ul className="mt-2 flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-xs font-semibold text-ink-2">
                  {['40-point tested', 'Data wiped', 'Blocklist checked', 'Cable included'].map((t) => (
                    <li key={t} className="flex items-center gap-1.5"><Check size={13} className="text-success" strokeWidth={3} /> {t}</li>
                  ))}
                </ul>
              </div>
            )}
            {photos.length > 0 && (
              <div className="mt-3 flex items-center gap-2" role="tablist" aria-label="Photos">
                {([['phone', image, 'The phone'], ['grade', photos[0].url, `${CONDITIONS[selection.condition].label} example`]] as const).map(([key, src, label]) => (
                  <button key={key} type="button" role="tab" aria-selected={view === key} onClick={() => setView(key)} className={cn('flex items-center gap-2.5 rounded-2xl border p-1.5 pr-4 text-left text-xs font-semibold transition-colors focus-ring', view === key ? 'border-ink text-ink' : 'border-line text-ink-3 hover:border-ink')}>
                    <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl', key === 'phone' ? tint : 'bg-ink')}>
                      <img src={src} alt="" className={key === 'phone' ? 'h-9 w-9 product-img' : 'h-full w-full object-cover'} />
                    </span>
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Buy panel */}
        <div className="lg:col-span-6">
          <p className="eyebrow">{p.brand} · {p.releaseYear}</p>
          <div className="mt-1.5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h1 className="text-3xl md:text-[2.4rem] md:leading-[1.05]">{p.name}</h1>
            <span className="flex items-center gap-1.5 text-sm">{p.reviewCount > 0 ? <><Stars value={p.rating} size={13} /> <span className="font-semibold">{p.rating.toFixed(1)}</span><span className="text-ink-3">({p.reviewCount.toLocaleString('en-GB')})</span></> : <span className="text-ink-3">No reviews yet</span>}</span>
          </div>

          <div className="mt-4 flex flex-wrap items-baseline gap-x-3 border-y border-line py-4">
            <span className="font-display text-4xl font-bold tracking-tightest">{available ? money(variant!.price) : needsColour && fromPrice !== null ? <>From {money(fromPrice)}</> : soldOut ? 'Sold out' : '—'}</span>
            {available && p.rrp > variant!.price && <span className="text-sm text-ink-3"><span className="line-through">{money(p.rrp)}</span> new</span>}
            <span className="ml-auto text-xs text-ink-3">{soldOut ? 'Back in stock soon' : <>Includes VAT · Free next-day delivery{available && variant!.stock <= 2 && <span className="font-semibold text-brand-600"> · Only {variant!.stock} left</span>}</>}</span>
          </div>

          <div className="mt-6">
            <VariantPicker product={p} selection={selection} onChange={choose} />
          </div>

          <p className="mt-4 text-xs text-ink-3"><span className="font-semibold text-ink">{CONDITIONS[selection.condition].label}:</span> {CONDITIONS[selection.condition].blurb}</p>

          <Button size="lg" disabled={!available || needsColour} onClick={() => variant && !needsColour && add(p, variant)} className="mt-5 w-full">
            <ShoppingBag size={18} />
            {needsColour && !soldOut ? 'Choose a colour to add to basket' : available ? `Add to basket · ${money(variant!.price)}` : soldOut ? 'Sold out' : 'Sold out in this configuration'}
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
                    { q: 'What comes with the phone?', a: 'The phone, a USB charging cable and a SIM tool, in plain protective packaging. Premium phones come in their box. We don’t include a plug or earphones; most people already have them and it keeps the price and packaging down.' },
                    { q: `Is this ${p.name} unlocked?`, a: `Yes. Every ${p.name} we sell is unlocked, so it works with a SIM from any UK network.` },
                    { q: 'How is battery health checked?', a: `Every ${p.name} is checked with the manufacturer’s own diagnostics. Premium and Excellent phones have 90%+ battery health, Good 85%+, Fair 80%+. If a battery is below the threshold we replace it before sale.` },
                    { q: 'What does the warranty cover?', a: 'Any hardware fault that isn’t accidental damage for 12 months: battery, screen, buttons, cameras, speakers, charging port. We collect, repair or replace, and return it for free.' },
                  ]}
                />
              )}
              {tab === 'reviews' && (
                <div>
                  <ul className="divide-y divide-line-2">
                    {(reviews.data ?? []).map((r) => (
                      <li key={r.id} className="py-4">
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-sm font-bold">{r.title}</p>
                          <Stars value={r.rating} size={12} />
                        </div>
                        <p className="mt-1 text-sm text-ink-3">{r.body}</p>
                        <p className="mt-1.5 text-xs text-ink-2"><span className="font-semibold">{r.author}</span> · {new Date(r.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}{r.verified && <> · <span className="text-success">Verified purchase</span></>}</p>
                        {r.reply && <p className="mt-2 rounded-2xl bg-cream px-4 py-3 text-sm text-ink-2"><span className="block text-[11px] font-bold uppercase tracking-wider text-ink-3">Reply from CashMyMobile</span>{r.reply}</p>}
                      </li>
                    ))}
                    {(reviews.data ?? []).length === 0 && <li className="py-6 text-sm text-ink-3">No reviews for this model yet. Bought one? Be the first.</li>}
                  </ul>
                  <div className="mt-4"><ReviewForm productId={p.id} productName={p.name} /></div>
                </div>
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
