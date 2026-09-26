import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { useSeo } from '../lib/seo';
import { useProductSearch } from '../hooks/useProductSearch';
import { SearchResults } from '../components/product/SearchResults';

export default function NotFound() {
  useSeo({ title: 'Page not found', noindex: true });
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const results = useProductSearch(q);
  function submit(e: FormEvent) {
    e.preventDefault();
    navigate(q.trim() ? `/shop?search=${encodeURIComponent(q.trim())}` : '/shop');
  }
  return (
    <div className="container py-16 md:py-28">
      <div className="mx-auto max-w-xl text-center">
        <p className="serif-accent text-[7rem] leading-none text-line">404</p>
        <h1 className="-mt-6 text-3xl md:text-4xl">That page has moved on.</h1>
        <p className="mt-3 text-ink-3">The phone or page you were after isn’t here anymore. Try a search, or start from the shop.</p>
        <form onSubmit={submit} role="search" className="mx-auto mt-8 max-w-md">
          <label className="flex h-14 items-center gap-3 rounded-full border border-line bg-white pl-5 pr-2 shadow-card">
            <Search size={18} className="shrink-0 text-ink-3" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search iPhone 15, Galaxy S24…" className="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-ink-4" />
            <button type="submit" className="flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-white">Search <ArrowRight size={14} /></button>
          </label>
          <SearchResults query={q} results={results} compact onSubmitAll={() => submit(new Event('submit') as unknown as FormEvent)} className="mt-3 rounded-3xl border border-line bg-white p-2" />
        </form>
        <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-semibold">
          <Link to="/shop" className="hover:underline">All phones</Link>
          <Link to="/how-it-works" className="hover:underline">How it works</Link>
          <Link to="/faq" className="hover:underline">Help centre</Link>
          <Link to="/contact" className="hover:underline">Get in touch</Link>
        </div>
      </div>
    </div>
  );
}
