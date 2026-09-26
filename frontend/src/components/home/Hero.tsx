import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Search, Star } from 'lucide-react';
import { DeviceShowcase } from './DeviceShowcase';
import { useProductSearch } from '../../hooks/useProductSearch';
import { SearchResults } from '../product/SearchResults';

export function Hero() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [focused, setFocused] = useState(false);
  const results = useProductSearch(q);
  function submit(e: FormEvent) {
    e.preventDefault();
    const term = q.trim();
    navigate(term ? `/shop?search=${encodeURIComponent(term)}` : '/shop');
  }
  return (
    <section className="relative -mt-[92px] overflow-hidden bg-cream pt-[136px] md:-mt-[104px] md:pt-[168px]">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-[radial-gradient(closest-side,rgba(208,26,42,.14),transparent)]" />
        <div className="absolute inset-x-0 top-0 h-[620px] dot-grid [mask-image:radial-gradient(60%_60%_at_50%_20%,#000,transparent)]" />
      </div>

      <div className="container relative">
        <div className="relative z-20 mx-auto max-w-3xl text-center animate-rise">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-ink-2 shadow-glass backdrop-blur">
            <span className="flex items-center gap-0.5 text-amber-400">
              {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={12} className="fill-amber-400" strokeWidth={0} />)}
            </span>
            Rated 4.8 from 12,400 verified reviews
          </div>
          <h1 className="mt-7 text-[2.9rem] leading-[1.02] sm:text-6xl lg:text-[5rem] text-balance">
            Premium phones.
            <br />
            <span className="serif-accent text-brand-600">Smarter</span> prices.
          </h1>

          <form onSubmit={submit} role="search" className="relative z-20 mx-auto mt-9 max-w-2xl" onFocus={() => setFocused(true)} onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setFocused(false)}>
            <label className="flex h-16 items-center gap-3 rounded-full border border-white bg-white p-2 pl-6 shadow-card transition-shadow focus-within:shadow-float">
              <Search size={20} className="shrink-0 text-ink-3" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search iPhone 16, Galaxy S25, Z Flip…" className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-ink-4 md:text-lg" />
              <button type="submit" className="flex h-12 shrink-0 items-center gap-2 rounded-full bg-brand-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 md:px-6">
                <span className="hidden sm:inline">Find my phone</span>
                <ArrowRight size={16} />
              </button>
            </label>
            {focused && q.trim().length >= 2 && (
              <div className="absolute inset-x-2 top-[calc(100%+8px)] rounded-3xl border border-line bg-white p-3 shadow-float animate-pop">
                <SearchResults query={q} results={results} onSubmitAll={() => submit(new Event('submit') as unknown as FormEvent)} />
              </div>
            )}
          </form>
        </div>

        <div className="mt-14 md:mt-16">
          <DeviceShowcase />
        </div>
      </div>
    </section>
  );
}
