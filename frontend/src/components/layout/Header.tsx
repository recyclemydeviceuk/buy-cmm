import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, ChevronDown, Menu, MessageCircle, Search, ShoppingBag, X } from 'lucide-react';
import { useBasket } from '../../store/basket';
import { cn } from '../../lib/cn';
import { MegaMenu } from './MegaMenu';
import { BRAND_MENUS, QUICK_LINKS } from '../../data/menu';
import { useProductSearch } from '../../hooks/useProductSearch';
import { SearchResults } from '../product/SearchResults';

type Panel = 'menu' | 'search' | null;

export function Header() {
  const { count } = useBasket();
  const [panel, setPanel] = useState<Panel>(null);
  const [drawer, setDrawer] = useState(false);
  const [q, setQ] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const closeTimer = useRef<number | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const results = useProductSearch(q);

  useEffect(() => {
    setPanel(null);
    setDrawer(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    document.body.style.overflow = drawer ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawer]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPanel(null);
        setDrawer(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (panel === 'search') searchRef.current?.focus();
  }, [panel]);

  const open = (p: Panel) => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setPanel(p);
  };
  const scheduleClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setPanel(null), 140);
  };
  const cancelClose = () => closeTimer.current && window.clearTimeout(closeTimer.current);

  function submit(e: FormEvent) {
    e.preventDefault();
    const term = q.trim();
    setPanel(null);
    setDrawer(false);
    navigate(term ? `/shop?search=${encodeURIComponent(term)}` : '/shop');
  }

  const navItem = 'inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-[14px] font-semibold text-ink-2 transition-colors hover:bg-ink/[.06] hover:text-ink focus-ring';

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-5 md:pt-4">
        <div className="relative mx-auto max-w-[1180px]" onMouseLeave={scheduleClose} onMouseEnter={cancelClose}>
          {/* Pill */}
          <div className={cn('glass flex h-16 items-center gap-2 rounded-full pl-5 pr-2 transition-all duration-300', scrolled || panel ? 'bg-white/85' : 'bg-white/60')}>
            <Link
              to="/"
              onClick={(e) => {
                setPanel(null);
                if (location.pathname === '/') {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="flex shrink-0 items-center rounded-full focus-ring"
              aria-label="CashMyMobile home"
            >
              <img src="/brand/cmm-logo.png" alt="CashMyMobile" className="h-6 w-auto md:h-7" />
            </Link>

            <nav className="mx-auto hidden items-center gap-1 lg:flex" aria-label="Primary">
              <button
                type="button"
                onMouseEnter={() => open('menu')}
                onClick={() => setPanel(panel === 'menu' ? null : 'menu')}
                aria-expanded={panel === 'menu'}
                aria-haspopup="true"
                className={cn(navItem, panel === 'menu' && 'bg-ink/[.06] text-ink')}
              >
                Buy a phone
                <ChevronDown size={15} className={cn('transition-transform duration-300', panel === 'menu' && 'rotate-180')} />
              </button>
              <NavLink to="/how-it-works" onMouseEnter={scheduleClose} className={({ isActive }) => cn(navItem, isActive && 'text-ink')}>
                How it works
              </NavLink>
            </nav>

            <div className="ml-auto flex items-center gap-1 lg:ml-0">
              <button
                type="button"
                onClick={() => setPanel(panel === 'search' ? null : 'search')}
                onMouseEnter={cancelClose}
                className={cn('flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/[.06] focus-ring', panel === 'search' && 'bg-ink/[.06]')}
                aria-label="Search"
              >
                <Search size={19} strokeWidth={2} />
              </button>
              <Link to="/basket" className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/[.06] focus-ring" aria-label={`Basket, ${count} items`}>
                <ShoppingBag size={19} strokeWidth={2} />
                {count > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">{count}</span>}
              </Link>
              <Link to="/contact" className="ml-1 hidden h-11 items-center gap-2 rounded-full bg-ink pl-4 pr-1.5 text-sm font-semibold text-white transition-colors hover:bg-ink-2 focus-ring md:inline-flex">
                Get in touch
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                  <MessageCircle size={15} />
                </span>
              </Link>
              <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-ink/[.06] lg:hidden focus-ring" aria-label="Open menu" onClick={() => setDrawer(true)}>
                <Menu size={22} />
              </button>
            </div>
          </div>

          {/* Floating panels */}
          <div
            className={cn('absolute inset-x-0 top-[calc(100%+10px)] hidden lg:block transition-all duration-200', panel ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-1 opacity-0')}
            aria-hidden={!panel}
          >
            <div className="overflow-hidden rounded-[28px] border border-line bg-white shadow-float">
              {panel === 'menu' && <MegaMenu onNavigate={() => setPanel(null)} />}
              {panel === 'search' && (
                <form onSubmit={submit} role="search" className="p-6 animate-pop">
                  <label className="flex h-14 items-center gap-3 rounded-full border border-line bg-cream-2 px-5 transition-colors focus-within:border-ink focus-within:bg-white">
                    <Search size={20} className="text-ink-3" />
                    <input ref={searchRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search iPhone 16, Galaxy S25, Z Flip…" className="h-full flex-1 bg-transparent text-lg outline-none placeholder:text-ink-4" />
                    <button type="submit" className="flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-white">
                      Search <ArrowRight size={15} />
                    </button>
                  </label>
                  {q.trim().length >= 2 ? (
                    <SearchResults query={q} results={results} onPick={() => setPanel(null)} onSubmitAll={() => submit(new Event('submit') as unknown as FormEvent)} className="mt-4" />
                  ) : (
                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      <span className="mr-1 text-xs font-semibold text-ink-3">Popular</span>
                      {['iPhone 16 Pro', 'iPhone 15', 'Galaxy S25 Ultra', 'Z Flip 6', 'iPhone 13'].map((t) => (
                        <button key={t} type="button" onClick={() => navigate(`/shop?search=${encodeURIComponent(t)}`)} className="pill h-9 py-0 text-[13px]">
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div className={cn('fixed inset-0 z-[60] lg:hidden', drawer ? 'pointer-events-auto' : 'pointer-events-none')} aria-hidden={!drawer}>
        <div className={cn('absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity', drawer ? 'opacity-100' : 'opacity-0')} onClick={() => setDrawer(false)} />
        <div className={cn('absolute inset-y-3 right-3 flex w-[88%] max-w-sm flex-col overflow-hidden rounded-[28px] bg-white shadow-float transition-transform duration-300', drawer ? 'translate-x-0' : 'translate-x-[110%]')}>
          <div className="flex h-16 items-center justify-between border-b border-line px-5">
            <Link
              to="/"
              onClick={(e) => {
                setDrawer(false);
                if (location.pathname === '/') {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              aria-label="CashMyMobile home"
            >
              <img src="/brand/cmm-logo.png" alt="CashMyMobile" className="h-6 w-auto" />
            </Link>
            <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full bg-cream focus-ring" aria-label="Close menu" onClick={() => setDrawer(false)}>
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-5">
            <form onSubmit={submit} role="search">
              <label className="flex h-12 items-center gap-3 rounded-full border border-line bg-cream-2 px-4 focus-within:border-ink focus-within:bg-white">
                <Search size={18} className="text-ink-3" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search phones" className="h-full flex-1 bg-transparent text-sm outline-none" />
              </label>
              <SearchResults query={q} results={results} compact onPick={() => setDrawer(false)} onSubmitAll={() => submit(new Event('submit') as unknown as FormEvent)} className="mt-2" />
            </form>
            <nav className="mt-6" aria-label="Mobile">
              <p className="eyebrow mb-2">Buy a phone</p>
              {BRAND_MENUS.map((b) => (
                <details key={b.key} className="group border-b border-line">
                  <summary className="flex cursor-pointer list-none items-center gap-3 py-3.5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cream">
                      <img src={b.image} alt="" className="h-8 w-8 product-img" />
                    </span>
                    <span className="flex-1">
                      <span className="block font-display font-bold">{b.label}</span>
                      <span className="block text-xs text-ink-3">{b.tagline}</span>
                    </span>
                    <ChevronDown size={18} className="transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="space-y-1 pb-4">
                    {b.groups.map((g) => (
                      <Link key={g.title} to={g.to} className="flex items-center justify-between rounded-xl px-2 py-2 text-sm text-ink-2">
                        {g.title} <ChevronDown size={14} className="-rotate-90 text-ink-4" />
                      </Link>
                    ))}
                    <Link to={b.to} className="flex items-center gap-1 px-2 py-2 text-sm font-semibold">
                      All {b.label} <ArrowRight size={14} />
                    </Link>
                  </div>
                </details>
              ))}
              <div className="mt-2 flex flex-wrap gap-2 py-3">
                {QUICK_LINKS.map((l) => (
                  <Link key={l.label} to={l.to} className="pill h-9 py-0 text-[13px]">{l.label}</Link>
                ))}
              </div>
              <Link to="/how-it-works" className="flex items-center justify-between border-t border-line py-4 font-display text-lg font-bold">
                How it works <ArrowUpRight size={18} />
              </Link>
              <Link to="/basket" className="flex items-center justify-between border-t border-line py-4 font-display text-lg font-bold">
                Basket {count > 0 && <span className="rounded-full bg-brand-600 px-2 py-0.5 text-xs text-white">{count}</span>}
              </Link>
            </nav>
          </div>
          <div className="border-t border-line p-4">
            <Link to="/contact" className="flex h-12 items-center justify-center gap-2 rounded-full bg-ink text-sm font-semibold text-white">
              <MessageCircle size={16} /> Get in touch
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
