import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ChevronRight, ShieldCheck, Truck, RefreshCcw, Check, ShoppingBag, Lock, Cpu, Sparkles, Cable, Database, BadgeCheck, ArrowDown } from 'lucide-react';
import { api } from '../api';
import { useAsync } from '../hooks/useAsync';
import { useSeo, breadcrumbLd, SITE_URL } from '../lib/seo';
import { useBasket } from '../store/basket';
import { useGradePhotos } from '../store/catalog';
import { settle, type Selection } from '../components/product/VariantPicker';
import { OptionRow, StepSection, bestValue, optionPricer } from '../components/product/Configurator';
import { GradeExample } from '../components/product/GradeExample';
import { ProductRail } from '../components/product/ProductRail';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Stars } from '../components/ui/Rating';
import { Skeleton } from '../components/ui/Skeleton';
import { Section, SectionHeading } from '../components/ui/Section';
import { ReviewForm } from '../components/product/ReviewForm';
import { Accordion } from '../components/ui/Accordion';
import { CONDITIONS, CONDITION_ORDER, money, savingsPct } from '../lib/format';
import { cn } from '../lib/cn';
import NotFound from './NotFound';

/** How each storage size tends to be used; a guide, not a promise. */
function storageHint(s: string) {
  const gb = s.endsWith('TB') ? parseInt(s) * 1024 : parseInt(s);
  if (gb <= 64) return 'Messages, maps and a light photo library';
  if (gb <= 128) return 'Everyday use: apps, photos and some video';
  if (gb <= 256) return 'Room to spare for photos, 4K video and games';
  if (gb <= 512) return 'Big photo libraries and lots of 4K video';
  return 'Pro-level space for creators and offline libraries';
}

export default function ProductPage() {
  const { slug = '' } = useParams();
  // Links in our review emails open the form with the order number filled in (?review=1&order=…).
  const [params] = useSearchParams();
  const reviewInvite = params.get('review') === '1';
  const reviewOrder = (params.get('order') ?? '').toUpperCase().slice(0, 20);
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
  /** The gallery shows the phone, or an example of the grade. */
  const [view, setView] = useState<'phone' | 'grade'>('phone');
  /** Briefly rings the colour step when someone tries to add without choosing one. */
  const [nudgeColour, setNudgeColour] = useState(false);
  const colourStep = useRef<HTMLElement>(null);
  const heroCta = useRef<HTMLDivElement>(null);
  const [heroCtaVisible, setHeroCtaVisible] = useState(true);

  useEffect(() => {
    if (!p || !reviewInvite) return;
    const t = window.setTimeout(() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    return () => window.clearTimeout(t);
  }, [p, reviewInvite]);

  useEffect(() => {
    if (!p) return;
    const first = p.variants.filter((v) => v.stock > 0).sort((a, b) => a.price - b.price);
    const best = first.find((v) => v.condition === 'excellent') ?? first.find((v) => v.condition === 'good') ?? first[0] ?? p.variants[0];
    // Phones with colour options start without one picked: the shopper has to choose before adding to the basket.
    if (best) setSelection({ storage: best.storage, colour: p.colours.length ? '' : best.colour, condition: best.condition });
    setView('phone');
  }, [p]);

  // The mobile buy bar appears once the main button has scrolled away.
  useEffect(() => {
    const el = heroCta.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setHeroCtaVisible(e.isIntersecting), { rootMargin: '-80px 0px 0px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [p?.id]);

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
        <Skeleton className="aspect-square rounded-[32px] lg:col-span-7" />
        <div className="space-y-4 lg:col-span-5">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }
  if (!p) return <NotFound />;

  const soldOut = inStock.length === 0;
  const price = available ? variant!.price : fromPrice;
  const save = price ? savingsPct(price, p.rrp) : 0;
  const colour = p.colours.find((c) => c.name === selection.colour);
  const image = colour?.image || p.image;
  const photos = gradePhotos[selection.condition] ?? [];
  const showGrade = view === 'grade' && photos.length > 0;
  const grade = CONDITIONS[selection.condition];
  const priceOf = optionPricer(p, selection);
  const conditionPrices = CONDITION_ORDER.map((c) => [c, priceOf('condition', c)] as [string, ReturnType<typeof priceOf>]);
  const storagePrices = p.storages.map((s) => [s, priceOf('storage', s)] as [string, ReturnType<typeof priceOf>]);
  const colourPrices = p.colours.map((c) => [c.name, priceOf('colour', c.name)] as [string, ReturnType<typeof priceOf>]);
  const cheapestCondition = bestValue(conditionPrices);
  const cheapestStorage = bestValue(storagePrices);
  const reviewList = reviews.data ?? [];

  const choose = (next: Selection, changed: keyof Selection) => {
    setSelection(settle(p.variants, next, changed));
    setView(changed === 'condition' && (gradePhotos[next.condition] ?? []).length ? 'grade' : 'phone');
  };
  const pick = (option: keyof Selection, value: string) => choose({ ...selection, [option]: value } as Selection, option);

  function addToBasket() {
    if (needsColour) {
      colourStep.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setNudgeColour(true);
      window.setTimeout(() => setNudgeColour(false), 1800);
      return;
    }
    if (variant && available) add(p!, variant);
  }

  const ctaLabel = soldOut ? 'Sold out' : needsColour ? 'Choose your colour' : available ? `Add to basket · ${money(variant!.price)}` : 'Sold out in this configuration';
  const ctaDisabled = soldOut || (!needsColour && !available);
  const priceText = available ? money(variant!.price) : needsColour && fromPrice !== null ? `From ${money(fromPrice)}` : soldOut ? 'Sold out' : '—';

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
  const summaryChips: Array<[string, string, string]> = [
    ['condition', `${grade.grade} · ${grade.label}`, '#step-condition'],
    ['storage', selection.storage || 'Storage', '#step-storage'],
    ...(p.colours.length ? [['colour', selection.colour || 'Choose colour', '#step-colour'] as [string, string, string]] : []),
  ];

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

      {/* ── Hero: gallery + summary ─────────────────────────────────────────── */}
      <div className="container grid gap-8 py-6 lg:grid-cols-12 lg:gap-12 lg:py-8">
        <div className="lg:col-span-7">
          <div className="lg:sticky lg:top-28">
            {showGrade ? (
              <GradeExample key={selection.condition} condition={selection.condition} photos={photos} className="aspect-square animate-pop md:aspect-[5/4]" />
            ) : (
              <div className="relative overflow-hidden rounded-[32px] border border-line p-6 md:p-12">
                <div className="absolute left-5 top-5 z-10 flex flex-wrap gap-2">
                  {save > 0 && !soldOut && <Badge tone="dark">Save {save}%</Badge>}
                  {p.releaseYear >= 2026 && <Badge tone="brand">New in</Badge>}
                </div>
                <img key={image} src={image} alt={[p.brand, p.name, selection.colour].filter(Boolean).join(' ')} className="mx-auto aspect-square w-full max-w-md animate-pop product-img" loading="eager" />
              </div>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2" role="tablist" aria-label="Photos">
              <button type="button" role="tab" aria-selected={view === 'phone'} onClick={() => setView('phone')} className={cn('flex items-center gap-2.5 rounded-2xl border p-1.5 pr-4 text-left text-xs font-semibold transition-colors focus-ring', view === 'phone' ? 'border-ink text-ink' : 'border-line text-ink-3 hover:border-ink')}>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl"><img src={image} alt="" className="h-10 w-10 product-img" /></span>
                The phone
              </button>
              {photos.length > 0 && (
                <button type="button" role="tab" aria-selected={view === 'grade'} onClick={() => setView('grade')} className={cn('flex items-center gap-2.5 rounded-2xl border p-1.5 pr-4 text-left text-xs font-semibold transition-colors focus-ring', view === 'grade' ? 'border-ink text-ink' : 'border-line text-ink-3 hover:border-ink')}>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-ink"><img src={photos[0].url} alt="" className="h-full w-full object-cover" /></span>
                  {grade.label} example
                </button>
              )}
              <ul className="ml-auto hidden flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-ink-2 md:flex">
                {['40-point tested', 'Data wiped', 'Unlocked'].map((t) => (
                  <li key={t} className="flex items-center gap-1.5"><Check size={13} className="text-success" strokeWidth={3} /> {t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <p className="eyebrow">{p.brand} · {p.releaseYear} · Unlocked</p>
            <h1 className="mt-1.5 text-3xl md:text-[2.6rem] md:leading-[1.04]">{p.name}</h1>
            <a href="#reviews" className="mt-2 inline-flex items-center gap-1.5 text-sm">
              {p.reviewCount > 0 ? <><Stars value={p.rating} size={13} /> <span className="font-semibold">{p.rating.toFixed(1)}</span><span className="text-ink-3 underline-offset-4 hover:underline">({p.reviewCount.toLocaleString('en-GB')} reviews)</span></> : <span className="inline-flex items-center gap-1.5 text-ink-3"><Sparkles size={14} className="text-brand-600" /> Just landed · <span className="font-semibold text-ink underline-offset-4 hover:underline">be the first to review</span></span>}
            </a>

            {/* Current configuration: each chip jumps to its step */}
            <div className="mt-5 flex flex-wrap gap-2">
              {summaryChips.map(([key, label, href]) => (
                <a key={key} href={href} className={cn('inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-semibold transition-colors hover:border-ink', key === 'colour' && needsColour ? 'border-brand-200 bg-brand-50 text-brand-700' : 'border-line bg-white text-ink')}>
                  {key === 'colour' && colour && <span className="h-3.5 w-3.5 rounded-full border border-ink/15" style={{ backgroundColor: colour.hex }} aria-hidden />}
                  {label}
                </a>
              ))}
            </div>

            <div className="mt-5 rounded-[28px] border border-line bg-white p-5 shadow-card md:p-6">
              <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
                <div>
                  <p className="font-display text-[2.6rem] font-bold leading-none tracking-tightest">{priceText}</p>
                  {price !== null && p.rrp > price && !soldOut && <p className="mt-1.5 text-sm text-ink-3"><span className="line-through">{money(p.rrp)}</span> new</p>}
                </div>
                {price !== null && p.rrp > price && !soldOut && (
                  <span className="rounded-full bg-tint-mint px-3 py-1.5 text-xs font-bold text-success">{money(p.rrp - price)} less than new</span>
                )}
              </div>
              <p className="mt-3 text-xs text-ink-3">{soldOut ? 'Back in stock soon' : <>Includes VAT · Free next-day delivery{available && variant!.stock <= 2 && <span className="font-semibold text-brand-600"> · Only {variant!.stock} left</span>}</>}</p>
              <div ref={heroCta}>
                <Button size="lg" disabled={ctaDisabled} onClick={addToBasket} className="mt-5 w-full">
                  {needsColour && !soldOut ? <ArrowDown size={18} /> : <ShoppingBag size={18} />}
                  {ctaLabel}
                </Button>
              </div>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-ink-3"><Lock size={11} /> Secure checkout with PayPal</p>
            </div>

            <ul className="mt-4 divide-y divide-line overflow-hidden rounded-[24px] bg-cream-2 text-sm">
              {[
                [Truck, 'Free next-day delivery', 'Order by 3pm, tracked and signed for'],
                [ShieldCheck, '12-month warranty', 'Any fault: we collect, repair or replace'],
                [RefreshCcw, '30-day returns', 'Changed your mind? Full refund'],
              ].map(([Icon, t, sub]) => {
                const I = Icon as typeof Truck;
                return (
                  <li key={String(t)} className="flex items-center gap-3.5 px-5 py-3.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white"><I size={16} /></span>
                    <span><span className="block font-bold">{String(t)}</span><span className="text-xs text-ink-3">{String(sub)}</span></span>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
      </div>

      {/* ── Configure ───────────────────────────────────────────────────────── */}
      <div className="container">
        <div className="pb-2 pt-8 md:pt-12">
          <p className="eyebrow text-brand-600">Make it yours</p>
          <h2 className="mt-2 max-w-xl text-3xl md:text-[2.6rem] md:leading-[1.05]">Build your {p.name} <span className="serif-accent text-ink-3">in three steps.</span></h2>
        </div>

        <StepSection
          id="step-condition"
          n={1}
          title="Choose the condition"
          sub="Every grade is fully tested, works perfectly and has the same 12-month warranty. The difference is cosmetic."
          aside={<Link to="/how-it-works#grades" className="text-xs font-semibold text-ink-3 underline underline-offset-4 hover:text-ink">How we grade</Link>}
          visual={
            photos.length ? (
              <GradeExample key={`step-${selection.condition}`} condition={selection.condition} photos={photos} className="aspect-[4/3] animate-pop" />
            ) : (
              <div className="relative overflow-hidden rounded-[32px] border border-line p-8">
                <img src={image} alt="" className="mx-auto aspect-[4/3] w-full max-w-sm object-contain product-img" />
                <ul className="mt-4 flex flex-wrap justify-center gap-2">
                  {grade.facts.map(([k, v]) => (
                    <li key={k} className="rounded-full bg-cream px-3 py-1.5 text-xs font-semibold"><span className="text-ink-3">{k}</span> {v}</li>
                  ))}
                </ul>
              </div>
            )
          }
        >
          {conditionPrices.map(([c, pr]) => {
            const g = CONDITIONS[c as keyof typeof CONDITIONS];
            return (
              <OptionRow
                key={c}
                selected={selection.condition === c}
                disabled={pr.soldOut}
                onClick={() => pick('condition', c)}
                leading={<span className={cn('flex h-9 min-w-9 shrink-0 items-center justify-center rounded-xl px-2 font-display text-sm font-bold', selection.condition === c ? 'bg-ink text-white' : 'bg-cream text-ink-2')}>{g.grade}</span>}
                title={g.label}
                sub={g.short + (g.facts.find(([k]) => k === 'Battery') ? ` · battery ${g.facts.find(([k]) => k === 'Battery')![1]}` : '')}
                price={pr}
                tag={c === cheapestCondition ? { label: 'Best price', tone: 'mint' } : c === 'excellent' && !pr.soldOut ? { label: 'Most chosen', tone: 'lilac' } : undefined}
              />
            );
          })}
        </StepSection>

        <StepSection
          id="step-storage"
          n={2}
          flip
          title="Pick your storage"
          sub="More space for photos, video and apps. Phones can’t be upgraded later, so pick with room to grow."
          visual={
            <div className="relative flex aspect-[4/3] items-center overflow-hidden rounded-[32px] bg-ink p-8 text-white md:p-12">
              <div className="relative z-10">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Storage</p>
                <p key={selection.storage} className="mt-2 font-display text-6xl font-bold tracking-tightest animate-pop md:text-8xl">{selection.storage || '—'}</p>
                <p className="mt-3 max-w-[16rem] text-sm text-white/60">{selection.storage ? storageHint(selection.storage) : 'Choose a size'}</p>
              </div>
              <img src={image} alt="" className="absolute -bottom-6 -right-6 h-[85%] w-auto rotate-[8deg] object-contain opacity-95 product-img" />
              <Database size={180} className="absolute -left-10 -top-10 text-white/[.04]" aria-hidden />
            </div>
          }
        >
          {storagePrices.map(([s, pr]) => (
            <OptionRow
              key={s}
              selected={selection.storage === s}
              disabled={pr.soldOut}
              onClick={() => pick('storage', s)}
              leading={<span className={cn('flex h-9 min-w-[3.25rem] shrink-0 items-center justify-center rounded-xl px-2 text-xs font-bold', selection.storage === s ? 'bg-ink text-white' : 'bg-cream text-ink-2')}><Cpu size={13} className="mr-1" />{s.replace('GB', '')}</span>}
              title={s}
              sub={storageHint(s)}
              price={pr}
              tag={s === cheapestStorage ? { label: 'Best price', tone: 'mint' } : undefined}
            />
          ))}
        </StepSection>

        {p.colours.length > 0 && (
          <StepSection
            ref={colourStep}
            id="step-colour"
            n={3}
            highlight={nudgeColour}
            title="Choose your colour"
            sub={needsColour ? <span className="font-semibold text-brand-600">Pick a colour to add this phone to your basket.</span> : 'The official finishes this model was made in.'}
            visual={
              <div className="relative overflow-hidden rounded-[32px] border border-line p-8 md:p-10">
                <img key={image} src={image} alt={colour ? `${p.name} in ${colour.name}` : p.name} className="mx-auto aspect-[4/3] w-full max-w-sm object-contain animate-pop product-img" />
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                  {p.colours.map((c) => {
                    const pr = colourPrices.find(([n]) => n === c.name)![1];
                    return (
                      <button key={c.name} type="button" disabled={pr.soldOut} onClick={() => pick('colour', c.name)} aria-label={c.name} title={c.name} className={cn('h-8 w-8 rounded-full border border-ink/15 ring-offset-2 transition-transform hover:scale-110 focus-ring disabled:opacity-30 disabled:hover:scale-100', selection.colour === c.name && 'ring-2 ring-ink')} style={{ backgroundColor: c.hex }} />
                    );
                  })}
                </div>
                <p className="mt-3 text-center text-sm font-semibold">{colour ? colour.name : <span className="text-ink-3">No colour chosen yet</span>}</p>
              </div>
            }
          >
            {colourPrices.map(([name, pr]) => {
              const c = p.colours.find((x) => x.name === name)!;
              return (
                <OptionRow
                  key={name}
                  selected={selection.colour === name}
                  disabled={pr.soldOut}
                  onClick={() => pick('colour', name)}
                  leading={<span className="h-9 w-9 shrink-0 rounded-full border border-ink/15 shadow-inner" style={{ backgroundColor: c.hex }} aria-hidden />}
                  title={name}
                  sub={pr.soldOut ? 'Not in stock right now' : pr.value !== null && selection.colour !== name ? 'In stock' : undefined}
                  price={pr}
                />
              );
            })}
          </StepSection>
        )}

        {/* ── Review your phone ── */}
        <section className="border-t border-line py-12 md:py-16">
          <div className="grid items-center gap-8 overflow-hidden rounded-[36px] bg-ink p-6 text-white md:grid-cols-[1fr_1.2fr] md:p-12">
            <img src={image} alt="" className="mx-auto aspect-square w-full max-w-[18rem] object-contain product-img" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Your phone</p>
              <h2 className="mt-2 text-3xl text-white md:text-4xl">{p.brand} {p.name}</h2>
              <dl className="mt-6 divide-y divide-white/10 border-y border-white/10 text-sm">
                {[
                  ['Condition', `${grade.label} (${grade.grade})`, '#step-condition'],
                  ['Storage', selection.storage, '#step-storage'],
                  ...(p.colours.length ? [['Colour', selection.colour || 'Not chosen yet', '#step-colour']] : []),
                  ['Network', 'Unlocked, any UK SIM', ''],
                ].map(([k, v, href]) => (
                  <div key={k} className="flex items-center justify-between gap-4 py-3">
                    <dt className="text-white/50">{k}</dt>
                    <dd className={cn('font-semibold', k === 'Colour' && needsColour && 'text-brand-200')}>{href ? <a href={href} className="underline-offset-4 hover:underline">{v}</a> : v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <p className="font-display text-4xl font-bold tracking-tightest">{priceText}</p>
                <Button size="lg" variant="light" disabled={ctaDisabled} onClick={addToBasket} className="min-w-[14rem] flex-1 sm:flex-none">
                  {needsColour && !soldOut ? <ArrowDown size={18} /> : <ShoppingBag size={18} />}
                  {needsColour && !soldOut ? 'Choose your colour' : available ? 'Add to basket' : ctaLabel}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Included with every phone ── */}
        <section className="border-t border-line py-12 md:py-16">
          <SectionHeading eyebrow="Every phone, every time" title="What you get" />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [BadgeCheck, '40-point tested', 'Screen, cameras, battery, speakers, sensors and ports checked by hand.', 'bg-tint-mint'],
              [Sparkles, 'Cleaned and data-wiped', 'Professionally cleaned and certified data erasure before it ships.', 'bg-tint-sky'],
              [Lock, 'Blocklist checked', 'Not lost, stolen or financed. Unlocked to work on any UK network.', 'bg-tint-lilac'],
              [Cable, 'Charging cable included', 'Plus a SIM tool, in protective packaging. Premium comes boxed.', 'bg-tint-peach'],
            ].map(([Icon, t, sub, tone]) => {
              const I = Icon as typeof Lock;
              return (
                <li key={String(t)} className={cn('rounded-[24px] p-6', String(tone))}>
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white"><I size={20} /></span>
                  <p className="mt-4 font-display text-lg font-bold">{String(t)}</p>
                  <p className="mt-1 text-sm text-ink-2">{String(sub)}</p>
                </li>
              );
            })}
          </ul>
        </section>

        {/* ── Specs + FAQs ── */}
        <section className="grid gap-10 border-t border-line py-12 md:py-16 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading eyebrow="Specifications" title={`${p.name} at a glance`} />
            <dl className="mt-6 rounded-[24px] border border-line px-5">
              {specs.map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-4 border-b border-line-2 py-3 text-sm last:border-b-0">
                  <dt className="text-ink-3">{k}</dt>
                  <dd className="text-right font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <SectionHeading eyebrow="Good to know" title="Questions, answered" />
            <div className="mt-6">
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
            </div>
          </div>
        </section>

        {/* ── Reviews ── */}
        <section id="reviews" className="scroll-mt-28 border-t border-line py-12 md:py-16">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <SectionHeading eyebrow="Reviews" title="What buyers say" />
              <div className="mt-6 rounded-[28px] bg-cream-2 p-6">
                {p.reviewCount > 0 ? (
                  <>
                    <p className="font-display text-5xl font-bold tracking-tightest">{p.rating.toFixed(1)}<span className="text-2xl text-ink-3">/5</span></p>
                    <Stars value={p.rating} size={16} />
                    <p className="mt-2 text-sm text-ink-3">{p.reviewCount.toLocaleString('en-GB')} reviews</p>
                  </>
                ) : (
                  <>
                    <p className="font-display text-xl font-bold">Fresh in stock</p>
                    <p className="mt-1 text-sm text-ink-3">This {p.name} hasn’t been reviewed yet. Bought one from us? Your review helps the next buyer pick the right grade.</p>
                  </>
                )}
                <div className="mt-5"><ReviewForm key={reviewOrder} productId={p.id} productName={p.name} initialOpen={reviewInvite} initialOrder={reviewOrder} /></div>
              </div>
            </div>
            <ul className="space-y-3">
              {reviewList.map((r) => (
                <li key={r.id} className="rounded-[24px] border border-line p-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-display font-bold">{r.title}</p>
                    <Stars value={r.rating} size={12} />
                  </div>
                  <p className="mt-2 text-sm text-ink-2">{r.body}</p>
                  <p className="mt-3 text-xs text-ink-3"><span className="font-semibold text-ink-2">{r.author}</span> · {new Date(r.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}{r.verified && <> · <span className="text-success">Verified purchase</span></>}</p>
                  {r.reply && <p className="mt-3 rounded-2xl bg-cream px-4 py-3 text-sm text-ink-2"><span className="block text-[11px] font-bold uppercase tracking-wider text-ink-3">Reply from CashMyMobile</span>{r.reply}</p>}
                </li>
              ))}
              {reviewList.length === 0 && (
                <li className="rounded-[24px] border border-line p-6 md:p-8">
                  <p className="font-display text-lg font-bold">Every review here comes from a real customer</p>
                  <p className="mt-1 text-sm text-ink-3">We email buyers a few days after delivery and check every review before it’s published. Until then, here’s what every {p.name} comes with:</p>
                  <ul className="mt-5 grid gap-2.5 sm:grid-cols-3">
                    {[
                      [ShieldCheck, '12-month warranty', 'Repair or replace'],
                      [RefreshCcw, '30-day returns', 'Full refund, any reason'],
                      [BadgeCheck, 'Verified reviews', 'Buyers only, checked by us'],
                    ].map(([Icon, t, sub]) => {
                      const I = Icon as typeof ShieldCheck;
                      return (
                        <li key={String(t)} className="flex items-center gap-3 rounded-2xl bg-cream-2 px-4 py-3 text-sm">
                          <I size={17} className="shrink-0" />
                          <span><span className="block font-bold">{String(t)}</span><span className="text-xs text-ink-3">{String(sub)}</span></span>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              )}
            </ul>
          </div>
        </section>
      </div>

      {(related.data?.length ?? 0) > 0 && (
        <Section className="py-12 md:py-16">
          <SectionHeading eyebrow="You might also like" title="Similar phones" action={{ label: `All ${p.brand === 'Apple' ? 'iPhone' : 'Samsung'}`, to: `/shop?brand=${p.brand}` }} />
          <ProductRail products={related.data ?? []} loading={related.loading} />
        </Section>
      )}

      {/* ── Mobile buy bar ── */}
      <div className={cn('fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-3 backdrop-blur transition-transform duration-300 lg:hidden', heroCtaVisible ? 'translate-y-full' : 'translate-y-0')}>
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-ink-3">{[selection.storage, selection.colour, grade.label].filter(Boolean).join(' · ')}</p>
            <p className="font-display text-xl font-bold tracking-tighter">{priceText}</p>
          </div>
          <Button size="md" disabled={ctaDisabled} onClick={addToBasket}>
            {needsColour && !soldOut ? 'Choose colour' : available ? 'Add to basket' : 'Sold out'}
          </Button>
        </div>
      </div>
    </>
  );
}
